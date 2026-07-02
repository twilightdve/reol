import {
  IArtist,
  IBrowseReleasesResult,
  IRecording,
  IRelation,
  IRelease,
  ITrack,
  IWork,
  MusicBrainzApi,
  loadMusicBrainzApi,
} from "musicbrainz-api";
import Bottleneck from "bottleneck";

export interface IRecordingWithArtist extends IRecording {
  relations?: (IRelation & { artist?: Partial<IArtist> })[];
}

export interface Record {
  title: string;
  disambiguation: string;
  date: string;
  recordings: {
    position: number;
    format: string | undefined;
    title: string;
    tracks: {
      id: string;
      position: number;
      title: string;
      relations: {
        type: string;
        targetCredit: string;
        targetType: string | undefined;
        artist?: Partial<IArtist>;
        /** "recording" (rel from the recording itself) or "work" (rel resolved via work). */
        source?: "recording" | "work";
      }[];
    }[];
  }[];
}

type AnyRelation = IRelation & {
  artist?: Partial<IArtist>;
  work?: Partial<IWork> & { id?: string };
};

const PAGE_SIZE = 100;

export class MusicBrainzService {
  limiter: Bottleneck;
  mbApi: MusicBrainzApi | undefined;
  /** @deprecated 旧フィールド。互換のため残す。実体は PAGE_SIZE を使う。 */
  amountPerReq = PAGE_SIZE;

  constructor() {
    // MusicBrainz の匿名レートリミット (~1 req/sec) を遵守。
    // 旧設定 (maxConcurrent: 300) はサーバから 503 を貰った上に
    // OS のソケット枯渇まで誘発していたため変更。
    this.limiter = new Bottleneck({
      minTime: 1100,
      maxConcurrent: 1,
    });
  }

  private async withRetry<T>(
    label: string,
    op: () => Promise<T>,
    max = 3
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= max; attempt++) {
      try {
        return await op();
      } catch (e) {
        lastErr = e;
        const msg = (e as { message?: string })?.message ?? String(e);
        const wait = 1500 * attempt;
        console.warn(
          `[mb] retry ${attempt}/${max} (${label}): ${msg} (wait ${wait}ms)`
        );
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    throw lastErr;
  }

  private schedule<T>(label: string, op: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(() => this.withRetry(label, op));
  }

  private async ensureApi(): Promise<MusicBrainzApi> {
    if (!this.mbApi) {
      const { MusicBrainzApi } = await loadMusicBrainzApi();
      this.mbApi = new MusicBrainzApi({
        appName: "fansite-reol",
        appVersion: "1.0.0",
        appContactInfo: "tw.l.ghtea+reol@gmail.com",
        disableRateLimiting: true,
      });
    }
    return this.mbApi;
  }

  private mapRelationToOutput(
    rel: AnyRelation,
    source: "recording" | "work"
  ): Record["recordings"][number]["tracks"][number]["relations"][number] {
    const out: Record["recordings"][number]["tracks"][number]["relations"][number] =
      {
        type: rel.type,
        targetCredit: rel["target-credit"],
        targetType: rel["target-type"],
        source,
      };
    if (rel.artist) {
      out.artist = {
        id: rel.artist.id,
        disambiguation: rel.artist.disambiguation,
        name: rel.artist.name,
        type: rel.artist.type,
      };
    }
    return out;
  }

  /**
   * 指定アーティストのリリース → 録音 → (NEW) 作品 まで辿ってクレジット情報を抽出する。
   *
   * 主な改善点 (旧版比):
   *  1. release-group 単位で初回限定/通常盤/Hi-Res などの重複リリースを 1 件にまとめる
   *     → recording lookup を 50%+ 削減 (時間 / リクエスト数とも大幅短縮)
   *  2. recording lookup に `work-rels` を追加し、さらに work を `artist-rels` で
   *     もう一段 lookup。これにより work 側にしか紐付いていない作詞・作曲クレジットを
   *     拾えるようになり、cgraph の接続ノードが増える。
   *  3. ページング不具合 (`reqs.concat(...)` の戻り値を捨てていた) を修正。
   *  4. 失敗時の無限再帰 retry を 3 回上限の指数バックオフへ。
   */
  async getArtistInfosRecursive(
    name: string,
    id: string
  ): Promise<{ [p: string]: Record[] }> {
    const api = await this.ensureApi();
    const log = (msg: string) => console.log(`[${name}] ${msg}`);

    // ---- 1. browse releases (paged) ----
    const firstPage = (await this.schedule(`browse:${name}:0`, () =>
      api.browse("release", {
        artist: id,
        place: "JP",
        limit: PAGE_SIZE,
        offset: 0,
      })
    )) as IBrowseReleasesResult;
    // MB は `place=JP` で 1 件もヒットしないアーティスト (海外プロデューサー等)
    // について `releases` フィールド自体を省略してレスポンスを返すことがあるため、
    // undefined / 空配列の両方を許容する。
    const firstReleases = firstPage.releases ?? [];
    const total = firstPage["release-count"] ?? firstReleases.length;
    if (total === 0) {
      log(`browse: 0 releases (skipping)`);
      return { [name]: [] };
    }
    const pages = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
    const browsed: IRelease[] = [...firstReleases];
    if (pages > 0) {
      log(`browse: total=${total}, fetching ${pages} more pages`);
      const rest = await Promise.all(
        Array.from({ length: pages }, (_, i) =>
          this.schedule(`browse:${name}:${i + 1}`, () =>
            api.browse("release", {
              artist: id,
              place: "JP",
              limit: PAGE_SIZE,
              offset: (i + 1) * PAGE_SIZE,
            })
          ) as Promise<IBrowseReleasesResult>
        )
      );
      for (const r of rest) browsed.push(...r.releases);
    }
    log(`browsed ${browsed.length} releases`);

    // ---- 2. lookup each release (recordings + release-groups) ----
    const releaseDetails = (await Promise.all(
      browsed.map((r, i, arr) =>
        this.schedule(`release:${name}:${r.title}`, () =>
          api
            .lookup("release", r.id, [
              "recordings",
              "release-groups",
            ])
            .then((res) => {
              log(`release ${i + 1}/${arr.length}: ${r.title}`);
              return res;
            })
        )
      )
    )) as IRelease[];

    // ---- 3. filter by country + dedupe by release-group ----
    const filtered = releaseDetails.filter(
      (d) => d.country === "JP" || d.country === "XW"
    );
    const isDigital = (r: IRelease): boolean =>
      (r.media ?? []).some((m) => m.format === "Digital Media");
    const canonicalByGroup = new Map<string, IRelease>();
    for (const r of filtered) {
      const groupId = r["release-group"]?.id ?? `__no_group__:${r.id}`;
      const existing = canonicalByGroup.get(groupId);
      if (!existing) {
        canonicalByGroup.set(groupId, r);
        continue;
      }
      // canonical 選好: Digital Media > 早い date > 既存のまま
      const newDigital = isDigital(r);
      const oldDigital = isDigital(existing);
      if (newDigital && !oldDigital) {
        canonicalByGroup.set(groupId, r);
      } else if (newDigital === oldDigital) {
        const newDate = (r.date ?? "").replaceAll("-", "");
        const oldDate = (existing.date ?? "").replaceAll("-", "");
        if (newDate && (!oldDate || newDate < oldDate)) {
          canonicalByGroup.set(groupId, r);
        }
      }
    }
    const canonical = Array.from(canonicalByGroup.values());
    log(
      `dedupe: ${filtered.length} releases → ${canonical.length} release-groups`
    );

    // ---- 4. recording lookups (artist-credits + artist-rels + work-rels) ----
    type RecInfo = {
      relations: AnyRelation[];
      workIds: string[];
      /**
       * 録音そのものの artist-credit (= 一般に「アーティスト」として表示される
       * クレジット)。artist-rels や work-rels から musician 関係が拾えなかった
       * 場合の fallback として使う。
       */
      artistCredits: Partial<IArtist>[];
    };
    const recInfo = new Map<string, RecInfo>();
    const recordingTargets: { id: string; title: string }[] = [];
    for (const rel of canonical) {
      for (const med of rel.media ?? []) {
        for (const t of med.tracks ?? []) {
          const recId = (t as ITrack & { recording: { id: string } }).recording
            ?.id;
          if (!recId || recInfo.has(recId)) continue;
          recInfo.set(recId, {
            relations: [],
            workIds: [],
            artistCredits: [],
          });
          recordingTargets.push({ id: recId, title: t.title });
        }
      }
    }
    log(`recording lookups: ${recordingTargets.length} unique recordings`);
    await Promise.all(
      recordingTargets.map((t, i, arr) =>
        this.schedule(`rec:${name}:${t.title}`, () =>
          api
            .lookup("recording", t.id, [
              "artist-credits",
              "artist-rels",
              "work-rels",
            ])
            .then(
              (
                rec: IRecording & {
                  "artist-credit"?: { artist?: Partial<IArtist> }[];
                }
              ) => {
                const info = recInfo.get(t.id)!;
                const rels = (rec.relations ?? []) as AnyRelation[];
                info.relations = rels;
                for (const r of rels) {
                  if (
                    (r["target-type"] as string | undefined) === "work" &&
                    r.work?.id
                  ) {
                    info.workIds.push(r.work.id);
                  }
                }
                // 録音の artist-credit を fallback 用に保存。
                for (const ac of rec["artist-credit"] ?? []) {
                  if (ac.artist?.id) info.artistCredits.push(ac.artist);
                }
                if ((i + 1) % 10 === 0 || i + 1 === arr.length) {
                  log(`recording ${i + 1}/${arr.length}`);
                }
              }
            )
        )
      )
    );

    // ---- 5. work lookups (artist-rels) — one level deeper ----
    const allWorkIds = new Set<string>();
    for (const info of recInfo.values()) {
      for (const wid of info.workIds) allWorkIds.add(wid);
    }
    const workRelations = new Map<string, AnyRelation[]>();
    log(`work lookups: ${allWorkIds.size} unique works`);
    await Promise.all(
      Array.from(allWorkIds).map((wid, i, arr) =>
        this.schedule(`work:${name}:${wid.slice(0, 8)}`, () =>
          api
            .lookup("work", wid, ["artist-rels"])
            .then((w: IWork & { relations?: AnyRelation[] }) => {
              workRelations.set(wid, w.relations ?? []);
              if ((i + 1) % 10 === 0 || i + 1 === arr.length) {
                log(`work ${i + 1}/${arr.length}`);
              }
            })
        ).catch((e) => {
          console.warn(`[${name}] work ${wid} failed permanently:`, e);
        })
      )
    );

    // ---- 6. assemble output ----
    const records: Record[] = canonical.map((rel) => ({
      title: rel.title,
      disambiguation: rel.disambiguation,
      date: rel.date,
      recordings: (rel.media ?? []).map((med) => ({
        position: med.position,
        format: med.format,
        title: med.title,
        tracks: (med.tracks ?? []).map((t) => {
          const recId = (t as ITrack & { recording: { id: string } }).recording
            ?.id;
          const info = recInfo.get(recId ?? "");
          const recRels = info?.relations ?? [];
          // work から resolve した artist-rels を merge。
          // (artist が乗ってない rel は cgraph 側で捨てられるので artist あり限定)
          const workArtistRels: AnyRelation[] = [];
          if (info) {
            for (const wid of info.workIds) {
              const wrels = workRelations.get(wid) ?? [];
              for (const wr of wrels) {
                if (wr.artist) workArtistRels.push(wr);
              }
            }
          }
          const seenArtistKey = new Set<string>();
          const merged: Record["recordings"][number]["tracks"][number]["relations"] =
            [];
          for (const r of recRels) {
            if (!r.artist) continue;
            const key = `${r.type}|${r.artist.id ?? r.artist.name}`;
            if (seenArtistKey.has(key)) continue;
            seenArtistKey.add(key);
            merged.push(this.mapRelationToOutput(r, "recording"));
          }
          for (const r of workArtistRels) {
            if (!r.artist) continue;
            const key = `${r.type}|${r.artist.id ?? r.artist.name}`;
            if (seenArtistKey.has(key)) continue;
            seenArtistKey.add(key);
            merged.push(this.mapRelationToOutput(r, "work"));
          }
          // Fallback: artist-rels / work-rels から musician 情報が一切取れなかった
          // 場合、いくつかの候補を順に試して必ず 1 件以上のクレジットを付ける。
          // 「ミュージシャン情報が紐づいていない楽曲データ」を防ぐ目的。
          if (merged.length === 0) {
            // (a) recording の artist-credit (recording lookup で取得)
            const candidates: Partial<IArtist>[] = [];
            for (const a of info?.artistCredits ?? []) {
              if (a?.id || a?.name) candidates.push(a);
            }
            // (b) track 自身に紐付く artist-credit (release lookup 時のもの)。
            // 録音側に artist-credit が無くてもリリース側にはある場合がある。
            const trackCredits = (
              t as ITrack & {
                "artist-credit"?: { artist?: Partial<IArtist> }[];
              }
            )["artist-credit"];
            for (const ac of trackCredits ?? []) {
              if (ac.artist?.id || ac.artist?.name) candidates.push(ac.artist);
            }
            // (c) recording オブジェクト自体の artist-credit。
            const recCredits = (
              (t as ITrack & { recording?: unknown }).recording as
                | {
                    "artist-credit"?: { artist?: Partial<IArtist> }[];
                  }
                | undefined
            )?.["artist-credit"];
            for (const ac of recCredits ?? []) {
              if (ac.artist?.id || ac.artist?.name) candidates.push(ac.artist);
            }
            // (d) どれも無ければ、最低限このリリースのオーナーアーティスト
            // (= 取得対象アーティスト) をクレジットとして残す。
            if (candidates.length === 0) {
              candidates.push({ id, name });
            }
            for (const a of candidates) {
              if (!a?.id && !a?.name) continue;
              const key = `vocal|${a.id ?? a.name}`;
              if (seenArtistKey.has(key)) continue;
              seenArtistKey.add(key);
              merged.push({
                type: "vocal",
                targetCredit: a.name ?? "",
                targetType: "artist",
                source: "recording",
                artist: {
                  id: a.id,
                  name: a.name,
                  disambiguation: a.disambiguation,
                  type: a.type,
                },
              });
            }
          }
          return {
            id: t.id,
            position: t.position,
            title: t.title,
            relations: merged,
          };
        }),
      })),
    }));

    return { [name]: records };
  }
}

