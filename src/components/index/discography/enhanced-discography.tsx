import React from "react";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs } from "../../../types/discography";
import EnhancedTimelineItem from "./enhanced-timeline-item";
import type { FlowbiteTimelineTheme } from "flowbite-react";

type Props = {
  discographyWithSongs: DiscographyWithSongs[];
};

// Timeline Content テーマ
export const timelineContentTheme = {
  root: {
    base: "mt-0 sm:pr-4",
  },
  body: "mb-2 text-sm font-normal text-bx-ink2",
  time: "mb-1 text-xs font-normal leading-none text-bx-ink3",
  title: "text-base font-semibold text-bx-ink",
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
    horizontal: "relative mb-16",
    vertical: "mb-16 ml-6",
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

const EnhancedDiscography: React.FC<Props> = React.memo(({ discographyWithSongs }) => {
  // 年ごとにグループ化
  const groupedByYear = discographyWithSongs.reduce((acc, item) => {
    const year = item.releaseDate?.split('-')[0] || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as Record<string, DiscographyWithSongs[]>);

  // 年でソート（降順）
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full space-y-20" style={{ borderLeft: 'none' }}>
      {sortedYears.map((year, yearIndex) => (
        <div key={year} className="space-y-8" style={{ borderLeft: 'none' }}>
          {/* 年ヘッダー */}
          <h2 className="text-3xl sm:text-4xl font-bold text-bx-ink px-2">
            {year}
          </h2>

          {/* カード一覧 */}
          <div className="space-y-8" style={{ borderLeft: 'none' }}>
            {groupedByYear[year].map((item) => (
              <div key={item.discographyUuid} id={`disc-${item.slug}`} className="scroll-mt-24">
                <EnhancedTimelineItem item={item} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default EnhancedDiscography;
