/**
 * /card/ — プロフィールカードを作る・見せる(plan/48)。
 * ライヴ会場(開演前・打ち上げなど)で知り合った人に、画面を見せる/QR を読んでもらう/画像を送る、で自己紹介する。
 *
 * - 会員・非会員とも使える。非会員はこの端末だけに保存(消えることがある。画面に明記)。会員はアカウントにも保存。
 * - QR はカードの内容そのもの(/card/view/#…)。サーバーには置かない(codec.ts)。
 * - 静的HTMLは説明と空のフォームだけ。入力・保存は JS が動いた後。
 * - 試験中は運営(OWNER_USER_ID)のログイン時だけ作れる(2026-10-18 ユーザー「一旦自分だけが見れる機能にして」)。
 *   切り替えは constants/profileCard.ts の PROFILE_CARD_OWNER_ONLY(false で元に戻る)。
 *   それ以外(静的HTMLを含む)は「準備中」だけを出し、検索にも出さない。表示の切り替えで、閲覧の制限ではない。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { trackEvent } from "../../utils/analytics";
import { CARD_STYLES } from "../../components/profileCard/cardStyles";
import { ProfileCardFace, cardAccent, cardInitial } from "../../components/profileCard/ProfileCardFace";
import { LiveItemRef, liveLabel, useCardDraft } from "../../components/profileCard/useCardDraft";
import { renderCardImage, shareOrDownload } from "../../components/profileCard/cardImage";
import { loadIconImage, useCardIcon } from "../../components/profileCard/useCardIcon";
import { CARD_LIMITS, CARD_VIEW_PATH, SNS, cardViewUrl, normalizeSnsId } from "../../utils/profileCard/codec";
import { reolTypes, TypeCode } from "../../data/reol-type/types";
import { useAuth } from "../../contexts/AuthContext";
import { PROFILE_CARD_OWNER_ONLY, canCreateProfileCard } from "../../constants/profileCard";

type CardPageData = {
  live: {
    liveInfos: ({
      title: string | null;
      items: ({ liveItemUuid: string | null; liveItemName: string | null; date: string | null } | null)[] | null;
    } | null)[];
  } | null;
  discography: {
    discographyWithSongs: ({ discographyUuid: string; title: string | null; format: string | null; releaseDate: string | null } | null)[];
  } | null;
  /** 曲ページ・楽曲ソーターと同じ代表曲(副題違い・インストをまとめたもの) */
  songStats: { songStats: ({ songName: string | null; discographyUuid: string | null } | null)[] } | null;
};

/** 歌ってみた(カバー)の作品。曲は作品名そのもの */
const COVER_FORMAT = "歌ってみた";

type SongGroup = { label: string; songs: string[] };

const SITE_ORIGIN = "https://reol.twilightea.com";
/** これより長い URL は QR が細かくなり、暗い会場で読み取りにくい */
const QR_DENSE_LENGTH = 900;

const inputClass =
  "w-full rounded-lg border border-bx-line bg-bx-bg px-3 py-2 text-[15px] text-bx-ink placeholder:text-bx-ink3 focus:border-bx-blue focus:outline-none";

const Field: React.FC<{ label: string; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }> = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-[12px] font-extrabold tracking-[0.12em] text-bx-ink2">
      {label}
    </label>
    <div className="mt-1.5">{children}</div>
    {hint && <div className="mt-1 text-[12px] leading-relaxed text-bx-ink3">{hint}</div>}
  </div>
);

/** 曲を選ぶ欄。ほかの欄で選んだ曲は選べない。一覧に無い曲(前に手で入力した曲など)はそのまま残す */
const SongSelect: React.FC<{
  label: string;
  value: string;
  groups: SongGroup[];
  taken: string[];
  onChange: (v: string) => void;
}> = ({ label, value, groups, taken, onChange }) => {
  const known = groups.some((g) => g.songs.includes(value));
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${value ? "" : "text-bx-ink3"}`}>
      <option value="">選ばない</option>
      {value && !known && <option value={value}>{value}</option>}
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.songs.map((s) => (
            <option key={s} value={s} disabled={s !== value && taken.includes(s)}>
              {s}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-bx-ink2">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#5b8def]" />
    {label}
  </label>
);

/** 画面いっぱいにカードと QR を出す。暗い会場でも読めるよう黒地。画面が消えないようにする */
const ShowMode: React.FC<{ url: string; children: React.ReactNode; onClose: () => void }> = ({ url, children, onClose }) => {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => undefined);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lock?.release().catch(() => undefined);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="カードを見せる" className="fixed inset-0 z-[200] overflow-y-auto bg-black">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-4 py-6">
        <button type="button" onClick={onClose} className="self-end rounded-full border border-white/30 px-4 py-1.5 text-[13px] font-bold text-white">
          閉じる
        </button>
        {children}
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG value={url} level="L" marginSize={2} className="h-auto w-full" title="プロフィールカードの QR コード" />
        </div>
        <p className="pb-6 text-center text-[13px] text-white/70">スマホのカメラで読み取ると、このカードが開きます</p>
      </div>
    </div>
  );
};

const CardEditor: React.FC<{ data: CardPageData }> = ({ data }) => {
  const allLives = useMemo<LiveItemRef[]>(
    () =>
      (data.live?.liveInfos ?? []).flatMap((li) =>
        (li?.items ?? []).flatMap((it) =>
          it?.liveItemUuid ? [{ uuid: it.liveItemUuid, date: it.date, label: liveLabel(it.date, li?.title ?? null, it.liveItemName) }] : []
        )
      ),
    [data]
  );
  // オリジナル: 代表曲を、最初に入った作品ごと(新しい作品から)。カバー: 歌ってみたの作品名(新しい順)
  const { originalGroups, coverGroups } = useMemo(() => {
    const discs = (data.discography?.discographyWithSongs ?? []).flatMap((d) => (d ? [d] : []));
    const newestFirst = [...discs].sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
    const songsByDisc = new Map<string, string[]>();
    for (const s of data.songStats?.songStats ?? []) {
      const name = s?.songName?.trim();
      if (!name || !s?.discographyUuid) continue;
      songsByDisc.set(s.discographyUuid, [...(songsByDisc.get(s.discographyUuid) ?? []), name]);
    }
    const groups: SongGroup[] = newestFirst.flatMap((d) => {
      const songs = songsByDisc.get(d.discographyUuid);
      return songs?.length ? [{ label: `${(d.releaseDate ?? "").slice(0, 4)} ${d.title ?? ""}`.trim(), songs }] : [];
    });
    const covers = [...new Set(newestFirst.filter((d) => d.format === COVER_FORMAT).map((d) => d.title?.trim() ?? "").filter(Boolean))];
    return { originalGroups: groups, coverGroups: [{ label: "歌ってみた", songs: covers }] };
  }, [data]);

  const { draft, update, loaded, payload, typeCode, lives, isMember, remote, saveState, saveNow } = useCardDraft(allLives);
  const toAccount = isMember && remote === "available";
  const save = async () => {
    const ok = await saveNow();
    if (ok) toast.success(toAccount ? "アカウントに保存しました" : "この端末に保存しました");
    else toast.error("保存できませんでした。通信できる所でもう一度保存してください(この端末には残っています)");
    trackEvent("profile_card_save", { category: "engagement", label: ok ? (toAccount ? "account" : "local") : "error" });
  };
  const { iconSrc, setFromFile: setIconFile, clear: clearIcon } = useCardIcon();
  const pickIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await setIconFile(file);
    if (result === "error") toast.error("この画像は使えませんでした");
    else if (result === "unsaved") toast("この端末に保存できなかったので、画面を閉じると外れます");
    trackEvent("profile_card_icon", { category: "engagement", label: result });
  };
  const [showing, setShowing] = useState(false);
  const closeShow = useCallback(() => setShowing(false), []);
  const [saving, setSaving] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const url = payload ? cardViewUrl(SITE_ORIGIN, payload) : "";
  // スタイルの見本の色(名前が未入力でカードがまだ無い時も、タイプの色で見せる)
  const previewAccent = cardAccent({ v: 1, n: "", t: typeCode ?? undefined });
  const type = typeCode ? reolTypes[typeCode as TypeCode] : null;

  // 「好きなライヴ」の候補: 終わった公演を、ツアー・ライヴごと(新しいものから)、中は日付順。
  // 今日の日付を使うので、読み込み後だけ(静的HTMLとの食い違いを避ける)
  const liveGroups = useMemo(() => {
    if (!loaded) return [];
    const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
    return (data.live?.liveInfos ?? [])
      .flatMap((li) => {
        const items = (li?.items ?? [])
          .flatMap((it) => (it?.liveItemUuid && it.date && it.date.trim().slice(0, 10) <= today ? [it] : []))
          .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
        if (!items.length) return [];
        return [
          {
            label: li?.title ?? "",
            last: items[items.length - 1].date ?? "",
            options: items.map((it) => ({
              value: liveLabel(it.date, li?.title ?? null, it.liveItemName),
              text: liveLabel(it.date, null, it.liveItemName) || (li?.title ?? ""),
            })),
          },
        ];
      })
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [data, loaded]);
  const favoriteLiveKnown = liveGroups.some((g) => g.options.some((o) => o.value === draft.favoriteLive));

  const saveImage = async () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!payload || !canvas) return;
    setSaving(true);
    try {
      const blob = await renderCardImage(payload, canvas, await loadIconImage(iconSrc));
      const result = await shareOrDownload(blob, "profile-card.png");
      trackEvent("profile_card_image", { category: "engagement", label: result });
    } catch {
      toast.error("画像を作れませんでした");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("リンクをコピーしました");
      trackEvent("profile_card_copy", { category: "engagement" });
    } catch {
      toast.error("コピーできませんでした");
    }
  };

  const setSong = (key: "songs" | "covers", i: number, v: string) => {
    const list = [...draft[key]];
    list[i] = v;
    // 間の空いた欄は空文字で詰める(カードには空の欄は入らない)
    update({ [key]: Array.from(list, (x) => x ?? "").slice(0, key === "songs" ? CARD_LIMITS.songs : CARD_LIMITS.covers) });
  };

  return (
    <Layout title="プロフィールカード">
      <main lang="ja" className="container mx-auto max-w-5xl px-4 py-8 text-bx-ink sm:px-6">
        <nav aria-label="パンくず" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="transition-colors hover:text-bx-blue">
            HOME
          </Link>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">プロフィールカード</span>
        </nav>
        <header className="mb-6 mt-6">
          <Kicker color="text-bx-blue">PROFILE CARD</Kicker>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">プロフィールカード</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-bx-ink2">
            ライヴの開演前や打ち上げで知り合った人に、自己紹介するためのカードです。画面を見せる・QR コードを読んでもらう・画像で送る、のどれでも渡せます。
          </p>
        </header>

        {/* 保存のされ方(非会員は消えることがある。2026-10-18 ユーザー指定で明示) */}
        {loaded && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-[13px] leading-relaxed ${isMember ? "border-bx-line text-bx-ink2" : "border-bx-yellow/60 text-bx-ink"}`} role="note">
            {isMember ? (
              remote === "available" ? (
                <p>入力した内容はアカウントに保存されます。別の端末でも同じカードを使えます。</p>
              ) : (
                <p>入力した内容は、いまはこの端末にだけ保存されます(アカウントへの保存は準備中です)。</p>
              )
            ) : (
              <>
                <p className="font-bold">ログインせずに使っています。</p>
                <ul className="mt-1 list-disc pl-5 text-bx-ink2">
                  <li>入力した内容は、このブラウザにだけ保存されます。ブラウザのデータを消す・別の端末やプライベートモードで開く、などで消えることがあります。</li>
                  <li>参戦記録・Reol タイプは、この端末で記録したものだけが入ります。</li>
                  <li>残しておきたい時は「画像で保存」するか、ログインして使ってください(別の端末でも同じカードを使えます)。</li>
                </ul>
              </>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* プレビューと渡すボタン */}
          <section aria-label="カードのプレビュー" className="md:sticky md:top-20 md:self-start">
            {payload ? (
              <ProfileCardFace payload={payload} iconSrc={iconSrc} />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-bx-line p-6 text-center text-[14px] text-bx-ink3">
                名前を入れると、ここにカードができます
              </div>
            )}
            {/* スタイル(Spotify の共有カードのように選ぶ。受け取った人にも同じ見た目で出る) */}
            <div role="radiogroup" aria-label="カードのスタイル" className="mt-4 flex justify-center gap-4">
              {CARD_STYLES.map((st) => {
                const [top, bottom] = st.bg(previewAccent);
                const selected = draft.style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!loaded}
                    onClick={() => update({ style: st.id })}
                    className="flex flex-col items-center gap-1.5 text-[11px] font-bold text-bx-ink2 disabled:opacity-40"
                  >
                    <span
                      aria-hidden
                      className={`h-10 w-10 rounded-full border ring-offset-2 ring-offset-bx-bg ${selected ? "ring-2 ring-bx-blue" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${top} 0 50%, ${bottom} 50% 100%)`, borderColor: st.line }}
                    />
                    <span className={selected ? "text-bx-ink" : ""}>{st.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!payload}
                onClick={() => {
                  setShowing(true);
                  trackEvent("profile_card_show", { category: "engagement" });
                }}
                className="rounded-full bg-bx-blue px-3 py-2.5 text-[13px] font-extrabold text-bx-bg disabled:opacity-40"
              >
                見せる
              </button>
              <button
                type="button"
                disabled={!payload || saving}
                onClick={saveImage}
                className="rounded-full border border-bx-line px-3 py-2.5 text-[13px] font-bold text-bx-ink disabled:opacity-40"
              >
                {saving ? "作成中…" : "画像で保存"}
              </button>
              <button
                type="button"
                disabled={!payload}
                onClick={copyLink}
                className="rounded-full border border-bx-line px-3 py-2.5 text-[13px] font-bold text-bx-ink disabled:opacity-40"
              >
                リンクをコピー
              </button>
            </div>
            {url.length > QR_DENSE_LENGTH && (
              <p className="mt-2 text-[12px] text-bx-ink3">QR コードが細かくなっています。ひとことなどを短くすると、暗い場所でも読み取りやすくなります。</p>
            )}
            <p className="mt-3 text-[12px] leading-relaxed text-bx-ink3">
              QR コードとリンクには、カードの内容そのものが入っています(サイトには保存されません)。渡したあとに書き換えても、渡した分は変わりません。
            </p>
            {/* 画像用の QR(画面には出さない) */}
            <div ref={qrCanvasRef} className="hidden" aria-hidden>
              {url && <QRCodeCanvas value={url} size={600} level="L" marginSize={0} />}
            </div>
          </section>

          {/* 入力 */}
          <section aria-label="カードの内容" className="space-y-6">
            <Field label="名前(必須)" htmlFor="card-name">
              <input
                id="card-name"
                value={draft.name}
                maxLength={CARD_LIMITS.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="会場で呼んでほしい名前"
                className={inputClass}
                autoComplete="nickname"
              />
            </Field>

            <Field
              label="アイコン"
              hint="画像はこの端末にだけ保存し、サイトには送りません。画面で見せる時と「画像で保存」したカードには入りますが、QR コード・リンクで渡したカードには入らず、名前の頭文字になります。"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-bx-line bg-bx-surface/5 text-[20px] font-extrabold text-bx-ink3">
                  {iconSrc ? <img src={iconSrc} alt="選んだアイコン" className="h-full w-full object-cover" /> : cardInitial(draft.name)}
                </div>
                <label className="cursor-pointer rounded-full border border-bx-line px-4 py-2 text-[13px] font-bold text-bx-ink hover:border-bx-blue">
                  画像を選ぶ
                  <input type="file" accept="image/*" onChange={pickIcon} className="sr-only" />
                </label>
                {iconSrc && (
                  <button type="button" onClick={clearIcon} className="text-[13px] text-bx-ink3 underline underline-offset-4 hover:text-bx-blue">
                    外す
                  </button>
                )}
              </div>
            </Field>

            <Field label="ひとこと" htmlFor="card-bio" hint={`${Array.from(draft.bio).length} / ${CARD_LIMITS.bio}字`}>
              <textarea
                id="card-bio"
                value={draft.bio}
                rows={2}
                onChange={(e) => update({ bio: Array.from(e.target.value.replace(/\n/g, " ")).slice(0, CARD_LIMITS.bio).join("") })}
                placeholder="例: 物販列によくいます。声をかけてください"
                className={inputClass}
              />
            </Field>

            <Field label="好きな曲">
              <div className="space-y-4">
                {(
                  [
                    { key: "songs", title: "オリジナル", max: CARD_LIMITS.songs, groups: originalGroups },
                    { key: "covers", title: "カバー(歌ってみた)", max: CARD_LIMITS.covers, groups: coverGroups },
                  ] as const
                ).map(({ key, title, max, groups }) => (
                  <div key={key}>
                    <p className="text-[12px] font-bold text-bx-ink3">
                      {title}
                      <span className="ml-1.5 font-normal">{max}曲まで</span>
                    </p>
                    <div className="mt-1 space-y-2">
                      {Array.from({ length: max }, (_, i) => (
                        <SongSelect
                          key={i}
                          label={`${title} ${i + 1}`}
                          value={draft[key][i] ?? ""}
                          groups={groups}
                          taken={draft[key]}
                          onChange={(v) => setSong(key, i, v)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            <Field label="好きなライヴ" htmlFor="card-favorite-live">
              <select
                id="card-favorite-live"
                value={draft.favoriteLive}
                onChange={(e) => update({ favoriteLive: e.target.value })}
                className={`${inputClass} ${draft.favoriteLive ? "" : "text-bx-ink3"}`}
              >
                <option value="">選ばない</option>
                {draft.favoriteLive && !favoriteLiveKnown && <option value={draft.favoriteLive}>{draft.favoriteLive}</option>}
                {liveGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.text}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>

            <Field
              label="Reol タイプ"
              hint={
                type ? null : (
                  <>
                    まだ診断していません。<Link to="/quiz/reol-type/" className="underline underline-offset-4 hover:text-bx-blue">Reol タイプ診断</Link>をすると載せられます。
                  </>
                )
              }
            >
              {type ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[15px] font-bold">
                    {type.emoji} {type.name}
                    <span className="ml-2 text-[12px] font-normal text-bx-ink3">{type.songLabel}</span>
                  </span>
                  <Toggle checked={draft.showType} onChange={(v) => update({ showType: v })} label="カードに載せる" />
                </div>
              ) : null}
            </Field>

            <Field
              label="参戦記録"
              hint={
                <>
                  ライヴの一覧で、各公演の「✓」(参戦済み)を付けた公演から作ります。<Link to="/live/" className="underline underline-offset-4 hover:text-bx-blue">ライヴの一覧へ</Link>
                </>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[15px] font-bold">{lives.length > 0 ? `${lives.length} 公演` : "まだ記録がありません"}</span>
                {lives.length > 0 && <Toggle checked={draft.showLives} onChange={(v) => update({ showLives: v })} label="カードに載せる" />}
              </div>
            </Field>

            <Field label="SNS" hint="ID だけ、またはプロフィールの URL を貼っても使えます。空欄は載りません。">
              <div className="space-y-2">
                {SNS.map((s) => {
                  const v = draft.sns[s.key] ?? "";
                  const invalid = v.trim() !== "" && !normalizeSnsId(s.key, v);
                  return (
                    <div key={s.key}>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`card-sns-${s.key}`} className="w-[84px] flex-shrink-0 text-[13px] text-bx-ink2">
                          {s.label}
                        </label>
                        <input
                          id={`card-sns-${s.key}`}
                          value={v}
                          maxLength={300}
                          onChange={(e) => update({ sns: { ...draft.sns, [s.key]: e.target.value } })}
                          placeholder={s.placeholder}
                          aria-invalid={invalid}
                          className={`${inputClass} ${invalid ? "border-red-500" : ""}`}
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </div>
                      {invalid && <p className="ml-[92px] mt-1 text-[12px] text-red-500">ID の形が正しくないので、カードには載りません</p>}
                    </div>
                  );
                })}
              </div>
            </Field>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-bx-line pt-5">
              <button
                type="button"
                disabled={!loaded || saveState === "saving"}
                onClick={save}
                className="rounded-full bg-bx-blue px-6 py-2.5 text-[14px] font-extrabold text-bx-bg disabled:opacity-40"
              >
                {saveState === "saving" ? "保存中…" : "保存"}
              </button>
              <p className="text-[12px] text-bx-ink3" aria-live="polite">
                {!loaded
                  ? ""
                  : !toAccount
                    ? "この端末に保存されています"
                    : saveState === "error"
                      ? "アカウントに保存できませんでした(この端末には残っています)"
                      : saveState === "saved"
                        ? "アカウントに保存済み"
                        : "保存待ち…"}
              </p>
            </div>
            <p className="text-[12px] text-bx-ink3">
              入力は自動でも保存されます。受け取った人には <code className="text-bx-ink2">{CARD_VIEW_PATH}</code> のページでカードが開きます。
            </p>
          </section>
        </div>
      </main>
      {showing && payload && (
        <ShowMode url={url} onClose={closeShow}>
          <ProfileCardFace payload={payload} iconSrc={iconSrc} />
        </ShowMode>
      )}
    </Layout>
  );
};

/** 試験中(PROFILE_CARD_OWNER_ONLY)は運営だけ。ほかの人(とログインの確認が済むまで)は「準備中」 */
const CardPage: React.FC<PageProps<CardPageData>> = ({ data }) => {
  const { user, loading } = useAuth();
  if (canCreateProfileCard(user?.id)) return <CardEditor data={data} />;
  return (
    <Layout title="プロフィールカード">
      <main lang="ja" className="container mx-auto max-w-md px-4 py-16 text-center text-bx-ink">
        {!loading && (
          <>
            <p className="text-[15px] font-bold">このページは準備中です</p>
            <Link to="/" className="mt-4 inline-block text-[13px] text-bx-ink2 underline underline-offset-4 hover:text-bx-blue">
              HOME へ
            </Link>
          </>
        )}
      </main>
    </Layout>
  );
};

export default CardPage;

export const query = graphql`
  query ProfileCardPage {
    live {
      liveInfos {
        title
        items {
          liveItemUuid
          liveItemName
          date
        }
      }
    }
    discography {
      discographyWithSongs {
        discographyUuid
        title
        format
        releaseDate
      }
    }
    songStats {
      songStats {
        songName
        discographyUuid
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <>
    <SEO
      title="プロフィールカード"
      description="ライヴ会場で知り合った人に自己紹介するためのカード。画面を見せる・QR コード・画像で渡せます。"
      path="/card/"
      jsonLd={buildBreadcrumbList([{ name: "ホーム", path: "/" }, { name: "プロフィールカード" }])}
    />
    {/* 試験中(運営だけ)は検索に出さない */}
    {PROFILE_CARD_OWNER_ONLY && <meta name="robots" content="noindex,nofollow" />}
  </>
);
