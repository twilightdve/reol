import React, { useMemo } from "react";
import { LangLink, useDict } from "../../../i18n/site/SiteLangContext";
import { stripLangPrefix } from "../../../utils/i18nRoutes";
import { BsSpeakerFill } from "react-icons/bs";
import { GoListUnordered } from "react-icons/go";
import Live from "../live/live";
import { LiveInfo } from "../../../types/live";
import { trackEvent } from "../../../utils/analytics";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";

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

  return (
    <section
      id="LIVE"
      className="bg-bx-surface/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3"
    >
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-bx-ink">
          <BsSpeakerFill className="text-lg mr-2" />
          <span>LIVE</span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
          {t.intro1}
          <br />
          {t.intro2}
        </div>
        <div className="mt-3 rounded-lg border border-bx-line bg-bx-bg/40 p-3">
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
          <p className="mt-1.5 text-[10px] text-bx-ink3">
            {t.attendanceHint}
          </p>
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
            className="mt-3 flex items-center gap-3 rounded-lg border border-bx-yellow/60 bg-bx-yellow/10 px-4 py-3 hover:border-bx-yellow transition-colors"
          >
            <span className="shrink-0 text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-bx-yellow text-bx-bg">
              {nextLive.isOngoing ? t.ongoing : t.upcoming}
            </span>
            <span className="min-w-0 text-sm text-bx-ink truncate">
              {nextLive.live.title || nextLive.live.name}
              <span className="ml-2 text-xs text-bx-ink3">
                {formatDate(nextLive.start)}
                {nextLive.end.getTime() !== nextLive.start.getTime() && ` 〜 ${formatDate(nextLive.end)}`}
              </span>
            </span>
          </LangLink>
        )}
      </div>
      <Live data={liveInfos} key="live" />
      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-bx-surface/5 border border-bx-line rounded-lg">
        <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide text-bx-ink2">
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
