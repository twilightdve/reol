import React, { Component } from "react";
import { FlowbiteTimelineTheme, Timeline } from "flowbite-react";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import { LiveInfo } from "../../../types/live";
import TimelineItem from "./timeline-item";

type Props = {
  data: LiveInfo[];
};

type State = {
  currentList: LiveInfo[];
  currentNames: string[];
  currentYears: string[];
  currentTypes: string[];
};

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

export default class Live extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentList: this.props.data,
      currentNames: [],
      currentYears: [],
      currentTypes: [],
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  toggleTag(currentList: string[], target: string) {
    let list = currentList;
    if (list.includes(target)) {
      list = currentList.filter((item) => item !== target);
    } else {
      list.push(target);
    }
    return list;
  }

  filterNextList(
    nextNames?: string[],
    nextYears?: string[],
    nextTypes?: string[]
  ) {
    let list = this.props.data;
    if (nextNames && nextNames.length > 0) {
      list = list.filter((item) => nextNames?.includes(item?.name ?? ""));
    }
    if (nextYears && nextYears.length > 0) {
      list = list.filter(
        (item) =>
          (
            item?.date
              .match(/[0-9]{4}/g)
              ?.filter((year) => nextYears?.includes(year)) ?? []
          ).length > 0
      );
    }
    if (nextTypes && nextTypes.length > 0) {
      list = list.filter((item) => nextTypes?.includes(item?.type ?? ""));
    }

    return list;
  }

  render() {
    const list = this.state.currentList;
    return (
      <div className="w-full pt-2 px-2 sm:px-10">
        <div className="flex flex-wrap gap-1 text-xs font-bold pb-4">
          {tags.name.map((tag) => {
            return (
              <span
                key={`live-tag-${tag}`}
                className={`px-2 py-1 tracking-wide rounded-md ${
                  this.state.currentNames.includes(tag)
                    ? "bg-letter"
                    : "bg-theme"
                } text-white`}
                onClick={(event) => {
                  const nextNames = this.toggleTag(
                    this.state.currentNames,
                    tag
                  );
                  this.setState({
                    ...this.state,
                    currentNames: nextNames,
                    currentList: this.filterNextList(nextNames),
                  });
                }}
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
                  this.state.currentYears.includes(tag)
                    ? "bg-letter"
                    : "bg-theme"
                } text-white`}
                onClick={(event) => {
                  const nextYears = this.toggleTag(
                    this.state.currentYears,
                    tag
                  );
                  this.setState({
                    ...this.state,
                    currentYears: nextYears,
                    currentList: this.filterNextList(
                      this.state.currentNames,
                      nextYears
                    ),
                  });
                }}
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
                  this.state.currentTypes.includes(tag)
                    ? "bg-letter"
                    : "bg-theme"
                } text-white`}
                onClick={(event) => {
                  const nextTypes = this.toggleTag(
                    this.state.currentTypes,
                    tag
                  );
                  this.setState({
                    ...this.state,
                    currentTypes: nextTypes,
                    currentList: this.filterNextList(
                      this.state.currentNames,
                      this.state.currentYears,
                      nextTypes
                    ),
                  });
                }}
              >
                #{tag === "event" ? "イベント出演" : "ワンマンライブ"}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-right">{list.length}件</p>
        <Timeline theme={timelineRootTheme}>
          {list.map((live, i) => {
            return (
              <TimelineItem key={`timeline-item-${live.liveId}`} live={live} />
            );
          })}
        </Timeline>
      </div>
    );
  }
}
