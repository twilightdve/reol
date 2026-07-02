/**
 * /songs/<slug>/ — 曲詳細ハブページ
 *
 * gatsby-node.ts の createPages で SongStats(演奏統計 + plays)と
 * discography(クレジット等の追加メタ)を songUuid で結合し、
 * 曲ごとに context を焼き込んで静的生成している(全130曲)。
 *
 * 権利方針: 埋め込み/リンクは公式のみ(公式MV / 公式配信 / 歌ネット / Spotify埋め込み)。
 * 非公式ファンサイトのため、JSON-LD で Reol 本人を名乗る Organization/Person は作らない。
 */
import React from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import EmptyState from "../components/common/EmptyState";
import LazyComponent from "../components/modules/LazyComponent";
import { trackOfficialLinkClick } from "../utils/analytics";
import { buildBreadcrumbList, buildMusicRecording } from "../utils/jsonLd";

type Play = {
  date: string;
  place: string | null;
  liveTitle: string;
  liveSlug: string;
  liveItemSlug: string;
  liveItemName: string | null;
  liveItemSongUuid: string;
};

export interface SongPageContext {
  songUuid: string;
  slug: string;
  songName: string;
  discographyUuid: string | null;
  discographySlug: string | null;
  discographyTitle: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
  musicVideoUrl: string | null;
  downloadUrl: string | null;
  lyricUrl: string | null;
  spotifyTrackId: string | null;
  lyricMember: string | null;
  musicMember: string | null;
  plays: Play[];
}

const Card: React.FC<{ label: string; value: string; accent: "amber" | "emerald" | "sky" }> = ({
  label,
  value,
  accent,
}) => {
  const accentColors: Record<string, { bar: string; text: string }> = {
    amber: { bar: "bg-amber-500", text: "text-amber-700" },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-700" },
    sky: { bar: "bg-sky-500", text: "text-sky-700" },
  };
  const c = accentColors[accent];
  return (
    <div className="rounded-lg bg-white border border-gray-300 shadow-sm overflow-hidden">
      <div className={`h-1 ${c.bar}`} />
      <div className="px-3 py-2">
        <div className="text-[10px] sm:text-xs text-gray-600">{label}</div>
        <div className={`text-lg sm:text-xl font-bold ${c.text} tabular-nums`}>{value}</div>
      </div>
    </div>
  );
};

const SongPage: React.FC<PageProps<object, SongPageContext>> = ({ pageContext }) => {
  const {
    songName,
    discographySlug,
    discographyTitle,
    totalPlays,
    firstPlayedDate,
    lastPlayedDate,
    musicVideoUrl,
    downloadUrl,
    lyricUrl,
    spotifyTrackId,
    lyricMember,
    musicMember,
    plays,
  } = pageContext;

  const sortedPlays = [...plays].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Layout title={songName}>
      <main className="container mx-auto px-3 sm:px-4 py-4 text-gray-800 max-w-3xl">
        {/* ①曲名 + 収録アルバム + クレジット */}
        <header className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-gray-900">
            {songName}
          </h1>
          {discographyTitle && discographySlug && (
            <Link
              to={`/discography/#disc-${discographySlug}`}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              収録アルバム: {discographyTitle} →
            </Link>
          )}
          {(lyricMember || musicMember) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              {lyricMember && <span>作詞: {lyricMember}</span>}
              {musicMember && <span>作曲: {musicMember}</span>}
            </div>
          )}
        </header>

        {/* ②演奏統計カード */}
        <section className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
          <Card label="通算演奏回数" value={`${totalPlays.toLocaleString()}回`} accent="amber" />
          <Card label="初披露" value={firstPlayedDate ?? "―"} accent="emerald" />
          <Card label="最終演奏" value={lastPlayedDate ?? "―"} accent="sky" />
        </section>

        {/* ③公式導線ボタン群(あるものだけ) */}
        {(musicVideoUrl || downloadUrl || lyricUrl) && (
          <section className="mb-5 flex flex-wrap gap-2">
            {musicVideoUrl && (
              <a
                href={musicVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("youtube_mv")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
              >
                ▶ 公式MVを見る
              </a>
            )}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("streaming")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                ♪ 配信で聴く
              </a>
            )}
            {lyricUrl && (
              <a
                href={lyricUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("lyrics")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-700 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                歌詞を見る(歌ネット)
              </a>
            )}
          </section>
        )}

        {/* ④Spotify埋め込み */}
        {spotifyTrackId && (
          <section className="mb-5">
            <LazyComponent>
              <iframe
                className="rounded-xl"
                src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`}
                width="100%"
                height="152"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify - ${songName}`}
              />
            </LazyComponent>
          </section>
        )}

        {/* ⑤演奏履歴タイムライン */}
        <section className="mb-6">
          <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-amber-500 rounded" />
            演奏履歴
            <span className="text-[10px] font-normal text-gray-500">
              ({totalPlays.toLocaleString()}件)
            </span>
          </div>

          {sortedPlays.length === 0 ? (
            <EmptyState
              icon="🎤"
              title="ライブ演奏の記録はまだありません"
              description="今後のライブで披露された際にはここに演奏履歴が追加されます。"
            />
          ) : (
            <ol className="space-y-2">
              {sortedPlays.map((p) => {
                const dateParts = p.date.split("-");
                const yyyy = dateParts[0] ?? "";
                const mmdd =
                  dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : p.date;
                return (
                  <li key={p.liveItemSongUuid}>
                    <Link
                      to={`/live/#live-item-${p.liveItemSlug}`}
                      className="group flex items-stretch gap-2 sm:gap-3 rounded-md border border-gray-200 bg-white/90 hover:bg-amber-50 hover:border-amber-400 hover:shadow-sm transition-all overflow-hidden"
                    >
                      {/* 日付ブロック */}
                      <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 px-2 sm:px-3 py-2 min-w-[58px] sm:min-w-[68px] border-r border-amber-200">
                        <span className="text-[10px] text-amber-700 font-medium leading-none">
                          {yyyy}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-amber-800 font-mono leading-tight mt-0.5">
                          {mmdd}
                        </span>
                      </div>
                      {/* 情報ブロック */}
                      <div className="flex-1 min-w-0 py-2 pr-2 sm:pr-3">
                        <div className="text-sm font-medium text-gray-900 truncate group-hover:text-amber-900">
                          {p.liveTitle}
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          {p.liveItemName && (
                            <span className="inline-flex items-center text-[11px] text-gray-700">
                              <span className="text-gray-400 mr-0.5">／</span>
                              {p.liveItemName}
                            </span>
                          )}
                          {p.place && (
                            <span className="inline-flex items-center text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                              <span className="mr-0.5">📍</span>
                              {p.place}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center pr-2 text-gray-300 group-hover:text-amber-500">
                        →
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* ⑥回遊フッター */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 border-t border-gray-200 pt-4">
          <Link to="/songs/stats/" className="underline hover:text-gray-900">
            ← 楽曲統計へ
          </Link>
          <Link to="/search/" className="underline hover:text-gray-900">
            横断検索へ →
          </Link>
          <Link to="/" className="underline hover:text-gray-900 ml-auto">
            トップに戻る
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default SongPage;

/**
 * 機械生成の description(演奏統計から導出できる事実のみ)。
 * SSGでの翻訳キー露出を避けるため、Head では react-i18next の t() を使用しない。
 */
const buildDescription = (ctx: SongPageContext): string => {
  const parts = [`Reol「${ctx.songName}」のライブ演奏統計。`];
  if (ctx.totalPlays > 0) {
    parts.push(`通算${ctx.totalPlays}回演奏、初披露は${ctx.firstPlayedDate ?? "不明"}。`);
  } else {
    parts.push("ライブでの演奏記録は確認されていません。");
  }
  parts.push("演奏履歴・公式MV・配信リンクを掲載。");
  return parts.join("");
};

export const Head: HeadFC<object, SongPageContext> = ({ pageContext }) => {
  const { songName, discographyTitle, slug } = pageContext;
  return (
    <SEO
      title={`${songName}(Reol)`}
      description={buildDescription(pageContext)}
      path={`/songs/${slug}/`}
      jsonLd={[
        buildMusicRecording({ name: songName, albumName: discographyTitle }),
        buildBreadcrumbList([
          { name: "ホーム", path: "/" },
          { name: "楽曲統計", path: "/songs/stats/" },
          { name: songName },
        ]),
      ]}
    />
  );
};
