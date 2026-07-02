import React from "react";
import { Timeline } from "flowbite-react";
import { LiveInfo } from "../../../types/live";
import EnhancedLiveTimelineItem from "./enhanced-timeline-item";
import type { FlowbiteTimelineTheme } from "flowbite-react";

type Props = {
  liveInfos: LiveInfo[];
};

// Timeline Content テーマ
export const timelineContentTheme = {
  root: {
    base: "mt-0 sm:pr-4",
  },
  body: "mb-2 text-sm font-normal text-gray-500 dark:text-gray-400",
  time: "mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500",
  title: "text-base font-semibold text-gray-900 dark:text-white",
};

// Timeline Point テーマ（アイコンと線を非表示）
export const timelinePointTheme = {
  horizontal: "hidden",
  line: "hidden",
  marker: {
    base: {
      horizontal: "hidden",
      vertical: "hidden",
    },
    icon: {
      base: "hidden",
      wrapper: "hidden",
    },
  },
  vertical: "hidden",
};

// Timeline Item テーマ
export const timelineItemTheme = {
  root: {
    horizontal: "relative mb-1 sm:mb-0",
    vertical: "mb-1 ml-6",
  },
  content: timelineContentTheme,
  point: timelinePointTheme,
};

// Timeline Root テーマ
const timelineRootTheme: FlowbiteTimelineTheme = {
  root: {
    direction: {
      horizontal: "flex flex-wrap items-start gap-x-10 gap-y-16",
      vertical: "relative",
    },
  },
  item: timelineItemTheme,
};

const EnhancedLive: React.FC<Props> = React.memo(({ liveInfos }) => {
  // 年ごとにグループ化
  const groupedByYear = liveInfos.reduce((acc, live) => {
    const year = live.date?.split('-')[0] || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(live);
    return acc;
  }, {} as Record<string, LiveInfo[]>);

  // 年でソート（降順）
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full space-y-20" style={{ borderLeft: 'none' }}>
      {sortedYears.map((year, yearIndex) => (
        <div key={year} className="space-y-8" style={{ borderLeft: 'none' }}>
          {/* 年ヘッダー */}
          <h2 
            className="text-3xl sm:text-4xl font-bold text-white px-2"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {year}
          </h2>

          {/* ライブ一覧 */}
          <div className="space-y-8" style={{ borderLeft: 'none' }}>
            {groupedByYear[year].map((live) => (
              <div key={live.liveUuid} id={`live-${live.slug}`} className="scroll-mt-24">
                <EnhancedLiveTimelineItem live={live} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default EnhancedLive;
