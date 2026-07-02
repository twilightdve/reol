import React, { useState, useCallback } from "react";
import { Timeline, FlowbiteTimelineTheme } from "flowbite-react";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import { LiveInfo } from "../../../types/live";
import EnhancedLiveTimelineItem from "./enhanced-timeline-item";

interface LiveProps {
  data: LiveInfo[];
}

const timelinePointTheme: FlowbiteTimelinePointTheme = {
  horizontal: "flex items-center",
  line: "hidden h-0.5 w-full bg-gray-500 sm:flex",
  marker: {
    base: {
      horizontal:
        "absolute -left-1.5 h-3 w-3 rounded-full border border-white bg-gray-500",
      vertical:
        "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-500",
    },
    icon: {
      base: "h-3 w-3 text-cyan-600",
      wrapper:
        "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 ring-8 ring-gray-100 sm:ring-white",
    },
  },
  vertical: "",
};

const timelineContentTheme: FlowbiteTimelineContentTheme = {
  root: {
    base: "mt-3 sm:pr-8",
  },
  body: "mb-2 text-sm font-normal text-gray-900",
  time: "mb-1 text-xs font-normal leading-none text-gray-500",
  title: "text-base font-semibold text-gray-900",
};

const timelineItemTheme: FlowbiteTimelineItemTheme = {
  root: {
    horizontal: "relative mb-6 sm:mb-0",
    vertical: "mb-4 ml-6",
  },
  content: timelineContentTheme,
  point: timelinePointTheme,
};

const timelineRootTheme: FlowbiteTimelineTheme = {
  root: {
    direction: {
      horizontal: "items-base sm:flex",
      vertical: "relative border-l border-letter",
    },
  },
  item: timelineItemTheme,
};

const tags = {
  name: ["Reol", "REOL", "れをる"],
  year: [
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
  ],
  type: ["event", "oneman"],
};

const Live: React.FC<LiveProps> = ({ data }) => {
  const [currentList, setCurrentList] = useState<LiveInfo[]>(data);
  const [currentNames, setCurrentNames] = useState<string[]>([]);
  const [currentYears, setCurrentYears] = useState<string[]>([]);
  const [currentTypes, setCurrentTypes] = useState<string[]>([]);

  const toggleTag = useCallback(
    (currentList: string[], target: string): string[] => {
      if (currentList.includes(target)) {
        return currentList.filter((item) => item !== target);
      } else {
        return [...currentList, target];
      }
    },
    []
  );

  const filterNextList = useCallback(
    (
      nextNames?: string[],
      nextYears?: string[],
      nextTypes?: string[]
    ): LiveInfo[] => {
      let list = data;
      if (nextNames && nextNames.length > 0) {
        list = list.filter((item) => nextNames.includes(item?.name ?? ""));
      }
      if (nextYears && nextYears.length > 0) {
        list = list.filter(
          (item) =>
            (
              item?.date
                .match(/[0-9]{4}/g)
                ?.filter((year) => nextYears.includes(year)) ?? []
            ).length > 0
        );
      }
      if (nextTypes && nextTypes.length > 0) {
        list = list.filter((item) => nextTypes.includes(item?.type ?? ""));
      }

      return list;
    },
    [data]
  );

  const handleNameTagClick = useCallback(
    (tag: string) => {
      const nextNames = toggleTag(currentNames, tag);
      setCurrentNames(nextNames);
      setCurrentList(filterNextList(nextNames, currentYears, currentTypes));
    },
    [currentNames, currentYears, currentTypes, toggleTag, filterNextList]
  );

  const handleYearTagClick = useCallback(
    (tag: string) => {
      const nextYears = toggleTag(currentYears, tag);
      setCurrentYears(nextYears);
      setCurrentList(filterNextList(currentNames, nextYears, currentTypes));
    },
    [currentNames, currentYears, currentTypes, toggleTag, filterNextList]
  );

  const handleTypeTagClick = useCallback(
    (tag: string) => {
      const nextTypes = toggleTag(currentTypes, tag);
      setCurrentTypes(nextTypes);
      setCurrentList(filterNextList(currentNames, currentYears, nextTypes));
    },
    [currentNames, currentYears, currentTypes, toggleTag, filterNextList]
  );

  return (
    <div className="w-full pt-2 px-2 sm:px-10">
      <div className="flex flex-wrap gap-1 text-xs font-bold pb-4">
        {tags.name.map((tag) => {
          return (
            <span
              key={`live-tag-${tag}`}
              className={`px-2 py-1 tracking-wide rounded-md ${
                currentNames.includes(tag) ? "bg-letter" : "bg-theme"
              } text-white cursor-pointer`}
              onClick={() => handleNameTagClick(tag)}
            >
              #{tag}
            </span>
          );
        })}
        <br />
        {tags.year.map((tag) => {
          return (
            <span
              key={`live-tag-${tag}`}
              className={`px-2 py-1 tracking-wide rounded-md ${
                currentYears.includes(tag) ? "bg-letter" : "bg-theme"
              } text-white cursor-pointer`}
              onClick={() => handleYearTagClick(tag)}
            >
              #{tag}
            </span>
          );
        })}
        <br />
        {tags.type.map((tag) => {
          return (
            <span
              key={`live-tag-${tag}`}
              className={`px-2 py-1 tracking-wide rounded-md ${
                currentTypes.includes(tag) ? "bg-letter" : "bg-theme"
              } text-white cursor-pointer`}
              onClick={() => handleTypeTagClick(tag)}
            >
              #{tag === "event" ? "イベント出演" : "ワンマンライヴ"}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-right">{currentList.length}件</p>
      <div style={{ isolation: "isolate" }}>
        <Timeline theme={timelineRootTheme}>
          {currentList.map((live) => {
            return (
              <EnhancedLiveTimelineItem key={`timeline-item-${live.liveUuid}`} live={live} />
            );
          })}
        </Timeline>
      </div>
    </div>
  );
};

export default Live;
