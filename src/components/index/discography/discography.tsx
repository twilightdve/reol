import React, { Component } from "react";
import { Button, FlowbiteTimelineTheme, Timeline } from "flowbite-react";
import { DiscographyWithSongs } from "../../../types/discography";
import { RouteState } from "../../../redux/store";
import { connect } from "react-redux";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import EnhancedTimelineItem from "./enhanced-timeline-item";

type Props = {
  data: DiscographyWithSongs[];
  isLoaded: any;
  currentVideoId: any;
  isShrinked: any;
  playerRef: any;
};

type State = {
  expand: boolean[];
  currentList: DiscographyWithSongs[];
  currentNames: string[];
  currentYears: string[];
  currentFormats: string[];
};

const timelinePointTheme: FlowbiteTimelinePointTheme = {
  horizontal: "flex items-center",
  line: "hidden h-0.5 w-full bg-bx-line sm:flex",
  marker: {
    base: {
      horizontal:
        "absolute -left-1.5 h-3 w-3 rounded-full border border-bx-bg bg-bx-line",
      vertical:
        "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-bx-bg bg-bx-line",
    },
    icon: {
      base: "h-3 w-3 text-bx-blue",
      wrapper:
        "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-bx-blueDeep ring-8 ring-bx-bg",
    },
  },
  vertical: "",
};

const timelineContentTheme: FlowbiteTimelineContentTheme = {
  root: {
    base: "mt-3 sm:pr-8",
  },
  body: "mb-2 text-sm font-normal text-bx-ink",
  time: "mb-1 text-xs font-normal leading-none text-bx-ink2",
  title: "text-base font-semibold text-bx-ink",
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
      vertical: "relative border-l border-bx-line",
    },
  },
  item: timelineItemTheme,
};

const tags = {
  name: ["Reol", "REOL", "れをる", "あにょすぺにょすゃゃ", "FZMZ(icy)"],
  year: [
    "2026",
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
    "2013",
    "2012",
  ],
  type: [
    "SG",
    "配信SG",
    "EP",
    "miniAL",
    "fullAL",
    "DVD/BD",
    "MV",
    "歌ってみた",
    "LP"
  ],
};

class Discography extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      expand: this.props.data.map((v, i) => false),
      currentList: this.props.data,
      currentNames: [],
      currentYears: [],
      currentFormats: [],
    };
  }

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
    nextFormats?: string[]
  ) {
    let list = this.props.data;
    if (nextNames && nextNames.length > 0) {
      list = list.filter((item) => nextNames?.includes(item?.name ?? ""));
    }
    if (nextYears && nextYears.length > 0) {
      list = list.filter((item) =>
        nextYears?.includes(item?.releaseDate?.split("-")[0] ?? "")
      );
    }
    if (nextFormats && nextFormats.length > 0) {
      list = list.filter((item) => nextFormats?.includes(item?.format ?? ""));
    }

    return list;
  }

  render() {
    const list = this.state.currentList;
    return (
      <div className="w-full pt-2 px-2 sm:px-10">
        <div className="flex flex-wrap gap-1 text-xs font-bold">
          {tags.name.map((tag) => {
            return (
              <span
                key={`discography-tag-${tag}`}
                className={`px-2 py-1 tracking-wide rounded-md border transition-colors cursor-pointer ${
                  this.state.currentNames.includes(tag)
                    ? "border-bx-yellow text-bx-yellow bg-white/5"
                    : "border-bx-line text-bx-ink3 bg-white/5 hover:border-bx-blue"
                }`}
                onClick={(event) => {
                  const nextNames = this.toggleTag(
                    this.state.currentNames,
                    tag
                  );
                  this.setState({
                    ...this.state,
                    currentNames: nextNames,
                    currentList: this.filterNextList(
                      nextNames,
                      this.state.currentYears,
                      this.state.currentFormats,
                    ),
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
                key={`discography-tag-${tag}`}
                className={`px-2 py-1 tracking-wide rounded-md border transition-colors cursor-pointer ${
                  this.state.currentYears.includes(tag)
                    ? "border-bx-yellow text-bx-yellow bg-white/5"
                    : "border-bx-line text-bx-ink3 bg-white/5 hover:border-bx-blue"
                }`}
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
                      nextYears,
                      this.state.currentFormats,
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
                key={`discography-tag-${tag}`}
                className={`px-2 py-1 tracking-wide rounded-md border transition-colors cursor-pointer ${
                  this.state.currentFormats.includes(tag)
                    ? "border-bx-yellow text-bx-yellow bg-white/5"
                    : "border-bx-line text-bx-ink3 bg-white/5 hover:border-bx-blue"
                }`}
                onClick={(event) => {
                  const nextFormats = this.toggleTag(
                    this.state.currentFormats,
                    tag
                  );
                  this.setState({
                    ...this.state,
                    currentFormats: nextFormats,
                    currentList: this.filterNextList(
                      this.state.currentNames,
                      this.state.currentYears,
                      nextFormats,
                    ),
                  });
                }}
              >
                #{tag}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-right pt-2 text-bx-ink2">{list.length}件</p>
        <div style={{ isolation: "isolate" }}>
          <Timeline theme={timelineRootTheme}>
            {list.map((item, i) => {
              return (
                <div
                  key={`disco-timeline-${item.discographyUuid}`}
                  id={item.slug ? `disc-${item.slug}` : undefined}
                  className="scroll-mt-24"
                >
                  <EnhancedTimelineItem item={item} />
                </div>
              );
            })}
          </Timeline>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RouteState) => state.player;

export default connect(mapStateToProps)(Discography);
