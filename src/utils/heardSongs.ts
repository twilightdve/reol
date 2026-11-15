/**
 * 「生で聴いた曲」の集計。
 *
 * 参戦済みにした公演のセットリストに載っている曲を「生で聴いた曲」とみなす
 * (案K「参戦履歴トラッカー」。plan/27 ステップ5)。
 * LIVE ページ(LiveSection)と /live/unheard/(まだ生で聴いていない曲。plan/74)が
 * 同じ数になるよう、数え方はここ1か所に置く。
 *
 * セトリ比較(setlistCompare.ts)と同じ基準で、MC等の segment と空欄を除き、
 * songUuid(なければ正規化した曲名)で同じ曲をまとめる。
 */
import { normalizeSongName } from "./songMatcher";

// ページごとにクエリの項目が違うので、集計に要る項目だけの型で受ける
export type TallySetlistSong = {
  songUuid?: string | null;
  liveItemSongName?: string | null;
  type?: string | null;
};

export type TallyLiveItem = {
  liveItemUuid: string;
  slug?: string | null;
  date?: string | null;
  setList?: TallySetlistSong[] | null;
};

export type TallyLive = {
  title?: string | null;
  items?: TallyLiveItem[] | null;
};

/** その曲が最後に演奏された公演 */
export type LastPlay = {
  date: string;
  itemSlug: string | null;
  liveTitle: string;
};

export type SongTally = {
  key: string;
  name: string;
  plays: number;
  /** 楽曲データ(DISCOGRAPHY)と結び付いている時の代表 songUuid。カバーなど結び付かない演目は null */
  songUuid: string | null;
  last: LastPlay | null;
};

export type LiveSongTally = {
  songs: Map<string, SongTally>;
  keysByItem: Map<string, Set<string>>;
  yearByItem: Map<string, number>;
};

// シートで種別が segment になっていない、曲ではない行(MC、コーナー、中止の注記など)。
// 「聴いた曲」に数えると数が合わなくなるので、名前で外す
const NON_SONG_PATTERNS: RegExp[] = [
  /^[-‐－\s(（]*MC[-‐－\s)）]*$/i,
  /^質問コーナー$/,
  /^抽選会$/,
  /紹介$/,
  /(中止|キャンセル)$/,
];

export const isNonSongEntry = (name: string): boolean => NON_SONG_PATTERNS.some((re) => re.test(name));

/** メドレーなどで <br/> や改行が入っている名前は、最初の行だけを表示に使う */
export const displaySongName = (raw: string): string => raw.split(/<br\s*\/?>|\n/)[0].trim();

// 公演日("YYYY-MM-DD"。複数日は範囲表記)から、最後の日を取り出す
const lastDateOf = (s: string | null | undefined): string | null => {
  const dates = (s ?? "").match(/\d{4}-\d{2}-\d{2}/g);
  return dates ? dates.sort()[dates.length - 1] : null;
};

export const tallyLiveSongs = (liveInfos: TallyLive[]): LiveSongTally => {
  const songs = new Map<string, SongTally>();
  const keysByItem = new Map<string, Set<string>>();
  const yearByItem = new Map<string, number>();
  for (const live of liveInfos) {
    for (const item of live.items ?? []) {
      const keys = new Set<string>();
      const date = lastDateOf(item.date);
      for (const s of item.setList ?? []) {
        const name = s.liveItemSongName?.trim();
        if (!name || name === "-" || s.type === "segment" || isNonSongEntry(name)) continue;
        const key = s.songUuid ? `song:${s.songUuid}` : `name:${normalizeSongName(name)}`;
        keys.add(key);
        let cur = songs.get(key);
        if (cur) cur.plays += 1;
        else {
          cur = { key, name: displaySongName(name), plays: 1, songUuid: s.songUuid ?? null, last: null };
          songs.set(key, cur);
        }
        if (date && (!cur.last || date > cur.last.date)) {
          cur.last = { date, itemSlug: item.slug ?? null, liveTitle: live.title ?? "" };
        }
      }
      keysByItem.set(item.liveItemUuid, keys);
      const year = parseInt((item.date ?? "").slice(0, 4), 10);
      if (!isNaN(year)) yearByItem.set(item.liveItemUuid, year);
    }
  }
  return { songs, keysByItem, yearByItem };
};

/** 参戦済みの公演(liveItemUuid)のセットリストに載っている曲のキー */
export const heardKeysOf = (attended: Iterable<string>, tally: LiveSongTally): Set<string> => {
  const keys = new Set<string>();
  for (const uuid of attended) {
    for (const k of tally.keysByItem.get(uuid) ?? []) keys.add(k);
  }
  return keys;
};
