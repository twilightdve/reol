import React, { useMemo } from "react";
import { LangLink, useDict } from "../../../i18n/site/SiteLangContext";
import { stripLangPrefix } from "../../../utils/i18nRoutes";
import { GoListUnordered } from "react-icons/go";
import Live from "../live/live";
import { LiveInfo } from "../../../types/live";
import { trackEvent } from "../../../utils/analytics";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";
import { heardKeysOf, tallyLiveSongs } from "../../../utils/heardSongs";
import HeardSongsShare from "../live/HeardSongsShare";

interface LiveSectionProps {
  liveInfos: LiveInfo[];
}

// "YYYY-MM-DD" 表記を日付文字列から抽出する(複数日程・区切り文字表記ゆれに対応)。
// isOngoingTour (enhanced-timeline-item.tsx) と同じ抽出方針。
const extractDates = (s: string | null | undefined): Date[] =>
  (s ?? "").match(/\d{4}-\d{2}-\d{2}/g)?.map((m) => new Date(m)).filter((d) => !isNaN(d.getTime())) ?? [];

type NextLive = { live: LiveInfo; start: Date; end: Date; isOngoing: boolean };

// 今日以降にも公演日が残っているライブのうち、開始日が最も近いものを返す。
const findNextLive = (liveInfos: LiveInfo[]): NextLive | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let best: NextLive | null = null;
  for (const live of liveInfos) {
    const dates = [
      ...extractDates(live.date),
      ...(live.items ?? []).flatMap((item) => extractDates(item.date)),
    ];
    if (dates.length === 0) continue;
    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.getTime())));
    if (end.getTime() < today.getTime()) continue; // 完全に終了済み
    if (!best || start.getTime() < best.start.getTime()) {
      best = { live, start, end, isOngoing: start.getTime() <= today.getTime() };
    }
  }
  return best;
};

const formatDate = (d: Date): string =>
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;

const LiveSection: React.FC<LiveSectionProps> = ({ liveInfos }) => {
  const t = useDict().live;
  const nextLive = findNextLive(liveInfos);

  // 新規コンテンツ案K「参戦履歴トラッカー」寄りの機能。個別の参戦済みチェックは
  // 各公演カード(enhanced-timeline-item.tsx)側、ここでは全体の参戦率だけを
  // まとめて表示する。DISCOGRAPHYの「コレクション台帳」と同じ仕組み(namespace違い)。
  const { owned: attended, mounted } = useCollectionOwned("attended");
  const allItemUuids = useMemo(
    () => liveInfos.flatMap((live) => (live.items ?? []).map((it) => it.liveItemUuid)),
    [liveInfos]
  );
  const attendedCount = mounted
    ? allItemUuids.filter((uuid) => attended.has(uuid)).length
    : 0;
  const totalItemCount = allItemUuids.length;
  const attendedRate =
    totalItemCount > 0 ? Math.round((attendedCount / totalItemCount) * 100) : 0;

  const tally = useMemo(() => tallyLiveSongs(liveInfos), [liveInfos]);
  const heardKeys = useMemo(
    () => (mounted ? heardKeysOf(attended, tally) : new Set<string>()),
    [attended, mounted, tally]
  );
  const allSongs = useMemo(
    () => Array.from(tally.songs.values()).sort((a, b) => b.plays - a.plays),
    [tally]
  );
  const heardSongs = allSongs.filter((s) => heardKeys.has(s.key));
  const unheardSongs = allSongs.filter((s) => !heardKeys.has(s.key));
  const heardRate = allSongs.length > 0 ? Math.round((heardSongs.length / allSongs.length) * 100) : 0;

  // シェアカード用: 参戦開始年と、参戦した公演で多く聴いた曲 TOP3
  const shareStats = useMemo(() => {
    const countByKey = new Map<string, number>();
    let sinceYear: number | null = null;
    let shows = 0;
    if (mounted) {
      for (const uuid of attended) {
        const keys = tally.keysByItem.get(uuid);
        if (!keys) continue;
        shows += 1;
        const y = tally.yearByItem.get(uuid);
        if (y !== undefined && (sinceYear === null || y < sinceYear)) sinceYear = y;
        for (const k of keys) countByKey.set(k, (countByKey.get(k) ?? 0) + 1);
      }
    }
    const topSongs = Array.from(countByKey.entries())
      .sort((a, b) => b[1] - a[1] || (tally.songs.get(b[0])?.plays ?? 0) - (tally.songs.get(a[0])?.plays ?? 0))
      .slice(0, 3)
      .map(([k, count]) => ({ name: tally.songs.get(k)?.name ?? "", count }));
    return { heard: heardKeys.size, total: tally.songs.size, shows, sinceYear, topSongs };
  }, [attended, mounted, tally, heardKeys]);

  return (
    <section
      id="LIVE"
      className="mx-auto w-full max-w-4xl px-2 sm:px-4 py-8 sm:py-12"
    >
      {/* 枠で囲まず、見出し・説明・罫線で区切る(plan/71) */}
      <div className="pb-4">
        <h2 className="text-[28px] sm:text-[36px] font-extrabold leading-tight tracking-[0.04em] text-bx-ink">LIVE</h2>
        <div className="mt-3 max-w-2xl break-words text-[14px] sm:text-[15px] leading-[1.9] text-bx-ink2">
          {t.intro1}
          <br />
          {t.intro2}
        </div>
        <div className="mt-6 border-y border-bx-line py-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-bx-ink3">{t.attendanceLabel}</span>
            <span className="text-sm font-bold text-bx-blue tabular-nums">
              {attendedCount} / {totalItemCount} ・ {attendedRate}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-bx-line/50 overflow-hidden">
            <div
              className="h-full bg-bx-blue transition-all"
              style={{ width: `${attendedRate}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-bx-ink3">
            {t.attendanceHint}
          </p>
          <div className="mt-3 pt-3 border-t border-bx-line">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-bx-ink3">{t.heardLabel}</span>
              <span className="text-sm font-bold text-bx-yellow tabular-nums">
                {heardSongs.length} / {allSongs.length} ・ {heardRate}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bx-line/50 overflow-hidden">
              <div className="h-full bg-bx-yellow transition-all" style={{ width: `${heardRate}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-bx-ink3">{t.heardHint}</p>
            {mounted && heardSongs.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <details>
                  <summary className="cursor-pointer text-[11px] font-bold text-bx-ink2">
                    {t.heardList(heardSongs.length)}
                  </summary>
                  <ul className="mt-1.5 flex flex-wrap gap-1">
                    {heardSongs.map((s) => (
                      <li key={s.key} className="px-2 py-0.5 rounded-full text-[11px] bg-bx-yellow/15 text-bx-ink">
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </details>
                <HeardSongsShare stats={shareStats} />
              </div>
            )}
            {/* まだ聴いていない曲は一覧のページで見せる(plan/74)。1公演も印を付けていなくても入口は出す */}
            <LangLink
              to="/live/unheard/"
              onClick={() => trackEvent("unheard_songs_link_click", { category: "engagement", label: "live" })}
              className="group mt-3 flex items-center justify-between gap-3 border-t border-bx-line pt-3 text-[13px] font-bold text-bx-ink"
            >
              <span className="min-w-0 transition-colors group-hover:text-bx-blueLight">
                {t.unheardLink}
                {mounted && (
                  <span className="ml-1.5 font-normal tabular-nums text-bx-ink3">{t.songCount(unheardSongs.length)}</span>
                )}
              </span>
              <span aria-hidden="true" className="flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-blueLight">
                →
              </span>
            </LangLink>
          </div>
        </div>
        {nextLive && (
          <LangLink
            to={`/live/#live-${nextLive.live.slug}`}
            onClick={() => {
              trackEvent("next_live_banner_click", {
                category: "engagement",
                label: nextLive.live.slug,
              });
              // 既に /live/ 上にいる場合、client-side router はページを再マウントしないため
              // ハッシュ変化だけではライブカードの自動展開(enhanced-timeline-item.tsx側)が
              // 発火しない。カスタムイベントで直接通知する。
              if (stripLangPrefix(window.location.pathname).path === "/live/") {
                window.dispatchEvent(
                  new CustomEvent("live-deep-link", { detail: `live-${nextLive.live.slug}` })
                );
              }
            }}
            className="group flex items-center gap-3 border-b border-bx-line py-4"
          >
            <span className="shrink-0 text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-bx-yellow text-bx-bg">
              {nextLive.isOngoing ? t.ongoing : t.upcoming}
            </span>
            <span className="min-w-0 truncate text-sm font-bold text-bx-ink transition-colors group-hover:text-bx-yellow">
              {nextLive.live.title || nextLive.live.name}
              <span className="ml-2 text-xs font-normal text-bx-ink3">
                {formatDate(nextLive.start)}
                {nextLive.end.getTime() !== nextLive.start.getTime() && ` 〜 ${formatDate(nextLive.end)}`}
              </span>
            </span>
          </LangLink>
        )}
      </div>
      <Live data={liveInfos} key="live" />
      <div className="mt-12 border-t border-bx-line pt-5">
        <ul className="list-disc space-y-1 pl-5 text-[12px] leading-relaxed text-bx-ink3">
          <li>
            {t.helpFilter}
            <br />
            {t.helpFilterExample}
          </li>
          <li>
            {t.helpDetailBefore}
            <GoListUnordered className="inline" />
            {t.helpDetailAfter}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default LiveSection;
