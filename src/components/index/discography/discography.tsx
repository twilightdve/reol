import React, { Component } from "react";
import { FlowbiteTimelineTheme, Timeline } from "flowbite-react";
import { DiscographyWithSongs } from "../../../types/discography";
import { FaCirclePlay } from "react-icons/fa6";
import { RootState } from "../../../redux/store";
import { connect } from "react-redux";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import TimelineItem from "./timeline-item";

type Props = {
  data: DiscographyWithSongs[];
  isLoaded: any;
  currentVideoId: any;
  isShrinked: any;
  playerRef: any;
};

type State = {
  expand: boolean[];
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
  body: "mb-2 text-sm font-normal text-black",
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

class Discography extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      expand: this.props.data.map((v, i) => false),
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <div className="w-full pt-4 px-2 sm:px-10">
        <p className="flex text-xs whitespace-nowrap items-center">
          <FaCirclePlay />
          &nbsp;をタップすると画面上部のプレイヤーで動画を再生します
        </p>
        <div className="pt-5">
          <Timeline theme={timelineRootTheme}>
            {this.props.data.map((item, i) => {
              return (
                <TimelineItem
                  item={item}
                  key={`disco-timeline-${item.discographyId}`}
                />
              );
            })}
          </Timeline>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => state.player;

export default connect(mapStateToProps)(Discography);
