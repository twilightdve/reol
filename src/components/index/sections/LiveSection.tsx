import React from "react";
import { Link } from "gatsby";
import { BsSpeakerFill } from "react-icons/bs";
import { GoListUnordered } from "react-icons/go";
import { MapPin } from "lucide-react";
import Live from "../live/live";
import { LiveInfo } from "../../../types/live";
import { trackEvent } from "../../../utils/analytics";

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
  const nextLive = findNextLive(liveInfos);

  return (
    <section
      id="LIVE"
      className="bg-white/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3"
    >
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-bx-ink">
          <BsSpeakerFill className="text-lg mr-2" />
          <span>LIVE</span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
          LIVEでは過去に出演したワンマンライヴやツアー、フェスなどの情報を掲載しています。
          <br />
          ライヴごとのセトリや関連ポスト、ライヴレポートなどを載せていますので、参加できなかったライヴもどんな雰囲気だったのか少しでも感じ取れる様な情報を掲載しています。
        </div>
        {nextLive && (
          <Link
            to={`/live/#live-${nextLive.live.slug}`}
            onClick={() => {
              trackEvent("next_live_banner_click", {
                category: "engagement",
                label: nextLive.live.slug,
              });
              // 既に /live/ 上にいる場合、client-side router はページを再マウントしないため
              // ハッシュ変化だけではライブカードの自動展開(enhanced-timeline-item.tsx側)が
              // 発火しない。カスタムイベントで直接通知する。
              if (window.location.pathname === "/live/") {
                window.dispatchEvent(
                  new CustomEvent("live-deep-link", { detail: `live-${nextLive.live.slug}` })
                );
              }
            }}
            className="mt-3 flex items-center gap-3 rounded-lg border border-bx-yellow/60 bg-bx-yellow/10 px-4 py-3 hover:border-bx-yellow transition-colors"
          >
            <span className="shrink-0 text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-bx-yellow text-bx-bg">
              {nextLive.isOngoing ? "開催中" : "直近の開催予定"}
            </span>
            <span className="min-w-0 text-sm text-bx-ink truncate">
              {nextLive.live.title || nextLive.live.name}
              <span className="ml-2 text-xs text-bx-ink3">
                {formatDate(nextLive.start)}
                {nextLive.end.getTime() !== nextLive.start.getTime() && ` 〜 ${formatDate(nextLive.end)}`}
              </span>
            </span>
          </Link>
        )}
        <div className="pt-2">
          <Link
            to="/live/heatmap/"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs sm:text-sm rounded-full border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
          >
            <MapPin className="h-4 w-4" />
            参戦地マップを見る
          </Link>
        </div>
      </div>
      <Live data={liveInfos} key="live" />
      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-white/5 border border-bx-line rounded-lg">
        <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide text-bx-ink2">
          <li>
            上部に表示されたハッシュタグを押すと一覧を簡易的にフィルタすることができます
            <br />
            例）「#れをる」を押下すると「れをる」名義の情報のみが表示されます
          </li>
          <li>
            「
            <GoListUnordered className="inline" />
            &nbsp;詳細」を押すとライヴレポートや開催場所、セトリ、関連ポストなどの情報が表示されます
          </li>
        </ul>
      </div>
    </section>
  );
};

export default LiveSection;
