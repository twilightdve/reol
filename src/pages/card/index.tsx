/**
 * /card/ — プロフィールカードを作る・見せる(plan/48)。
 * ライヴ会場(開演前・打ち上げなど)で知り合った人に、画面を見せる/QR を読んでもらう/画像を送る、で自己紹介する。
 *
 * - 会員・非会員とも使える。非会員はこの端末だけに保存(消えることがある。画面に明記)。会員はアカウントにも保存。
 * - QR はカードの内容そのもの(/card/view/#…)。サーバーには置かない(codec.ts)。
 * - 静的HTMLは説明と空のフォームだけ。入力・保存は JS が動いた後。
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
import { ProfileCardFace } from "../../components/profileCard/ProfileCardFace";
import { LiveItemRef, liveLabel, useCardDraft } from "../../components/profileCard/useCardDraft";
import { renderCardImage, shareOrDownload } from "../../components/profileCard/cardImage";
import { CARD_LIMITS, CARD_VIEW_PATH, SNS, cardViewUrl, normalizeSnsId } from "../../utils/profileCard/codec";
import { reolTypes, TypeCode } from "../../data/reol-type/types";

type CardPageData = {
  live: {
    liveInfos: ({
      title: string | null;
      items: ({ liveItemUuid: string | null; liveItemName: string | null; date: string | null } | null)[] | null;
    } | null)[];
  } | null;
  discography: { discographyWithSongs: ({ songs: ({ songName: string | null } | null)[] | null } | null)[] } | null;
};

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

const CardPage: React.FC<PageProps<CardPageData>> = ({ data }) => {
  const allLives = useMemo<LiveItemRef[]>(
    () =>
      (data.live?.liveInfos ?? []).flatMap((li) =>
        (li?.items ?? []).flatMap((it) =>
          it?.liveItemUuid ? [{ uuid: it.liveItemUuid, date: it.date, label: liveLabel(it.date, li?.title ?? null, it.liveItemName) }] : []
        )
      ),
    [data]
  );
  const songNames = useMemo(
    () => [...new Set((data.discography?.discographyWithSongs ?? []).flatMap((d) => (d?.songs ?? []).map((s) => s?.songName?.trim() ?? "")))].filter(Boolean),
    [data]
  );

  const { draft, update, loaded, payload, typeCode, lives, isMember, remote } = useCardDraft(allLives);
  const [showing, setShowing] = useState(false);
  const closeShow = useCallback(() => setShowing(false), []);
  const [saving, setSaving] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const url = payload ? cardViewUrl(SITE_ORIGIN, payload) : "";
  const type = typeCode ? reolTypes[typeCode as TypeCode] : null;

  // 「今日のライヴ」の候補: 前後3日の公演(今の時刻を使うので、読み込み後だけ)
  const nearLives = useMemo(() => {
    if (!loaded) return [];
    const now = Date.now();
    return allLives.filter((l) => l.date && Math.abs(Date.parse(l.date.trim().slice(0, 10)) - now) < 3.5 * 86400_000).map((l) => l.label.replace(/^\S+ /, ""));
  }, [allLives, loaded]);

  const saveImage = async () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!payload || !canvas) return;
    setSaving(true);
    try {
      const blob = await renderCardImage(payload, canvas);
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

  const setSong = (i: number, v: string) => {
    const songs = [...draft.songs];
    songs[i] = v;
    update({ songs: songs.slice(0, CARD_LIMITS.songs) });
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
              <ProfileCardFace payload={payload} />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-bx-line p-6 text-center text-[14px] text-bx-ink3">
                名前を入れると、ここにカードができます
              </div>
            )}
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

            <Field label="今日のライヴ" htmlFor="card-event" hint="カードの右上に出ます。どこで会ったかの手がかりに。">
              <input
                id="card-event"
                value={draft.event}
                maxLength={CARD_LIMITS.event}
                list="card-near-lives"
                onChange={(e) => update({ event: e.target.value })}
                placeholder="公演名(任意)"
                className={inputClass}
              />
              <datalist id="card-near-lives">
                {nearLives.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </Field>

            <Field label="好きな曲(3曲まで)">
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    aria-label={`好きな曲 ${i + 1}`}
                    value={draft.songs[i] ?? ""}
                    maxLength={CARD_LIMITS.song}
                    list="card-songs"
                    onChange={(e) => setSong(i, e.target.value)}
                    placeholder={`曲名 ${i + 1}`}
                    className={inputClass}
                  />
                ))}
                <datalist id="card-songs">
                  {songNames.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
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

            <p className="text-[12px] text-bx-ink3">
              入力は自動で保存されます。受け取った人には <code className="text-bx-ink2">{CARD_VIEW_PATH}</code> のページでカードが開きます。
            </p>
          </section>
        </div>
      </main>
      {showing && payload && (
        <ShowMode url={url} onClose={closeShow}>
          <ProfileCardFace payload={payload} />
        </ShowMode>
      )}
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
        songs {
          songName
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="プロフィールカード"
    description="ライヴ会場で知り合った人に自己紹介するためのカード。画面を見せる・QR コード・画像で渡せます。"
    path="/card/"
    jsonLd={buildBreadcrumbList([{ name: "ホーム", path: "/" }, { name: "プロフィールカード" }])}
  />
);
