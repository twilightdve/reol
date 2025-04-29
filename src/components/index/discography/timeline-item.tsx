import React, { Component } from "react";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs } from "../../../types/discography";
import { GoChevronUp, GoLinkExternal, GoListUnordered } from "react-icons/go";
import { FaCompactDisc, FaCirclePlay } from "react-icons/fa6";
import { AppDispatch, RouteState } from "../../../redux/store";
import { connect } from "react-redux";
import { setNextVideo } from "../../../redux/slices/playerSlice";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import Tweets from "../../modules/tweets";
import UtilityService from "../../../services/UtilityService";
import ItemSong from "./item-song";
import LazyComponent from "../../modules/LazyComponent";

type Props = {
  item: DiscographyWithSongs;
  isLoaded: any;
  currentVideoId: any;
  isShrinked: any;
  playerRef: any;
  setNextVideo: any;
};

type State = {
  isExpand: boolean;
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

class TimelineItem extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isExpand: false,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    const item = this.props.item;
    return (
      <Timeline.Item theme={timelineItemTheme}>
        <Timeline.Point icon={FaCompactDisc} theme={timelinePointTheme} />
        <Timeline.Content>
          <Timeline.Time
            theme={{
              time: "mb-1 text-xs sm:text-sm font-normal leading-none text-gray-600 tracking-widest",
            }}
          >
            {item.releaseDate?.replaceAll("-", "/")}
          </Timeline.Time>
          <Timeline.Title
            theme={{
              title: `flex flex-col font-semibold text-gray-900${
                !this.state.isExpand ? " border-b" : ""
              }`,
            }}
            onClick={(event) => {
              // event.stopPropagation();
              UtilityService.gtag({
                category: "click",
                action: "timeline-discography",
                label: item.title,
              });

              this.setState({
                ...this.state,
                isExpand: !this.state.isExpand,
              });
            }}
          >
            <div
              className="w-5/6 mt-2 flex flex-1 justify-start items-center"
              onClick={(event) => {
                event.stopPropagation();
                if (item.xfdUrl) {
                  UtilityService.gtag({
                    category: "click",
                    action: "play",
                    label: item.xfdUrl,
                  });
                }
                if (item.xfdUrl) {
                  this.props.setNextVideo(item.xfdUrl);
                }
              }}
            >
              <FaCirclePlay className="mr-2 w-4" />
              <span className={`text-sm tracking-widest`}>{item.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <ul className="flex justify-start list-none py-2 ml-6 text-xs text-black font-thin tracking-widest">
                {item?.name && (
                  <li>
                    <span>名義:&nbsp;</span>
                    {item.name}
                  </li>
                )}
                {item?.format && (
                  <li>
                    <span>&nbsp;&#47;&nbsp;形式: </span>
                    {item.format}
                  </li>
                )}
              </ul>
              {item.songs.length > 0 && (
                <span className="w-4/12 text-sm text-gray-600">
                  {this.state.isExpand ? (
                    <div className="flex justify-end items-center">
                      <GoChevronUp className="mr-1" />
                      閉じる
                    </div>
                  ) : (
                    <div
                      className={`flex justify-end items-center${
                        item.songs.length > 0 ? "" : " hidden"
                      }`}
                    >
                      <GoListUnordered className="mr-1" />
                      開く
                    </div>
                  )}
                </span>
              )}
            </div>
          </Timeline.Title>
          <Timeline.Body>
            {this.state.isExpand && item.songs.length > 0 && (
              <div className="flex flex-wrap bg-white mt-2 px-5 pt-2 pb-5 rounded-lg border border-theme text-xs">
                <div
                  className={`${item.posts.length > 0 ? "sm:w-1/2" : "w-full"}`}
                >
                  <h4 className="text-sm font-bold leading-10 text-black">
                    収録曲
                  </h4>
                  <ol className="list-decimal list-outside pl-5 text-black font-thin tracking-widest">
                    {item.songs.map((song, i) => {
                      return (
                        <ItemSong
                          key={`songs-${item.discographyId}-${i}`}
                          song={song}
                        />
                      );
                    })}
                  </ol>
                  {item.reports && item.reports.length > 0 && (
                    <div className="text-black">
                      <h4 className="text-sm tracking-widest pt-3 pb-2">
                        &lt;インタビュー&gt;
                      </h4>
                      <ul className="list-disc pl-5 text-xs">
                        {item.reports.map((report) => {
                          return (
                            <li
                              key={`report-${report.discographyId}-${report.discographyRepoNo}`}
                            >
                              <a
                                className="leading-loose"
                                href={report.discographyReportUrl}
                                target="_blank"
                                onClick={() =>
                                  UtilityService.gtag({
                                    category: "click",
                                    action: "link",
                                    label: report.discographyReportUrl,
                                  })
                                }
                              >
                                {report.discographyReportName}
                                <GoLinkExternal className="ml-1 inline" />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                {item.posts.length > 0 && (
                  <div
                    className={`relative w-full sm:h-full sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden sm:max-h-192`}
                  >
                    <h4 className="text-sm font-bold pt-1 pb-2 text-black">
                      関連ポスト
                    </h4>
                    <Tweets
                      parentId={`${item.discographyId}`}
                      posts={item.posts.reverse().map((post) => ({
                        id: post.discographyPostId,
                        html: post.discographyPostHTML,
                      }))}
                    />
                  </div>
                )}
              </div>
            )}
          </Timeline.Body>
        </Timeline.Content>
      </Timeline.Item>
    );
  }
}

const mapStateToProps = (state: RouteState) => state.player;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setNextVideo: (url: string) =>
      dispatch(setNextVideo({ videoId: url.replace("https://youtu.be/", "") })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TimelineItem);
