import React, { Component } from "react";
import { Timeline } from "flowbite-react";
import { GoChevronUp, GoLinkExternal, GoListUnordered } from "react-icons/go";
import { RouteState } from "../../../redux/store";
import { connect } from "react-redux";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import Tweets from "../../modules/tweets";
import { LiveInfo } from "../../../types/live";
import { MdLocationPin, MdTour } from "react-icons/md";
import LiveItem from "./live-item";
import UtilityService from "../../../services/UtilityService";
import YouTube from "react-youtube";
import LazyComponent from "../../modules/LazyComponent";

type Props = {
  live: LiveInfo;
  isLoaded: any;
  currentVideoId: any;
  isShrinked: any;
  playerRef: any;
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
    const live = this.props.live;
    return (
      <Timeline.Item
        theme={{
          root: {
            horizontal: "relative mb-6 sm:mb-0",
            vertical: "mb-4 ml-6",
          },
          content: timelineContentTheme,
          point: timelinePointTheme,
        }}
      >
        <Timeline.Point
          icon={live.type === "oneman" ? MdTour : MdLocationPin}
          theme={{
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
                base: `h-3 w-3 ${
                  live.type === "oneman" ? "text-yellow-800" : "text-cyan-600"
                }`,
                wrapper: `absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-gray-100 sm:ring-white ${
                  live.type === "oneman" ? "bg-yellow-400" : "bg-cyan-200"
                }`,
              },
            },
            vertical: "",
          }}
        />
        <Timeline.Content>
          <Timeline.Time
            theme={{
              time: "mb-1 text-xs sm:text-sm font-normal leading-none text-gray-600 tracking-widest",
            }}
          >
            {live.date}
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
                action: "timeline-live",
                label: live.title,
              });
              this.setState({
                ...this.state,
                isExpand: !this.state.isExpand,
              });
            }}
          >
            <div className="pt-2">
              <span className={`w-full text-sm`}>{live.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <ul className="flex justify-start list-none py-2 text-xs text-gray-500 font-thin tracking-widest">
                {live?.name && (
                  <li>
                    <span>名義:&nbsp;</span>
                    {live.name}
                  </li>
                )}
              </ul>
              <span className="w-4/12 text-sm text-gray-600">
                {this.state.isExpand ? (
                  <div className="flex justify-end items-center">
                    <GoChevronUp className="mr-1 inline" />
                    閉じる
                  </div>
                ) : (
                  <div className="flex justify-end items-center">
                    <GoListUnordered className="mr-1 inline" />
                    詳細
                  </div>
                )}
              </span>
            </div>
          </Timeline.Title>
          <Timeline.Body>
            {this.state.isExpand && (
              <div className="sm:px-5 sm:py-0">
                {live.reports.length > 0 && (
                  <div className="text-black">
                    <h4 className="text-sm tracking-widest pt-3 pb-2">
                      &lt;LIVE REPORT&gt;
                    </h4>
                    <ul className="list-disc pl-5 text-xs">
                      {live.reports.map((report) => {
                        return (
                          <li
                            key={`report-${report.liveId}-${report.liveReportNo}`}
                          >
                            <a
                              className="leading-loose"
                              href={report.liveReportUrl}
                              target="_blank"
                              onClick={() =>
                                UtilityService.gtag({
                                  category: "click",
                                  action: "link",
                                  label: report.liveReportUrl,
                                })
                              }
                            >
                              {report.liveReportName}
                              <GoLinkExternal className="ml-1 inline" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {(live.siteUrl?.startsWith("https://www.youtube.com/live/") ||
                  live.siteUrl?.startsWith("https://youtu.be/")) && (
                  <LazyComponent>
                    <YouTube
                      videoId={live.siteUrl
                        .replace("https://www.youtube.com/live/", "")
                        .replace("https://youtu.be/", "")}
                      opts={{
                        height: "180",
                        width: "320",
                        playerVars: {
                          autoplay: 0,
                          enablejsapi: 1,
                          playsinline: 1,
                          loop: 0,
                          rel: 0,
                          color: "white",
                          origin: "https://reol.twilightea.com/",
                          widget_referrer: "https://reol.twilightea.com/",
                        },
                      }}
                      iframeClassName="w-full h-48"
                    />
                  </LazyComponent>
                )}
                {live.items.length > 0 && (
                  <>
                    {1 === live.items.length ? (
                      <div
                        key={`live-item-${live.items[0].liveId}-${live.items[0].liveItemNo}`}
                      >
                        <LiveItem live={live} liveItem={live.items[0]} />
                      </div>
                    ) : (
                      <div className="relative sm:flex sm:flex-1 sm:justify-start sm:gap-5 sm:flex-row w-full h-full">
                        <div
                          className={`flex flex-wrap content-start gap-3 justify-center overflow-y-hidden mt-2 py-2 ${
                            live.posts.length > 0 ? "sm:w-1/2" : "w-full"
                          }`}
                        >
                          {live.items.map((liveItem, j, items) => {
                            return (
                              <LiveItem
                                key={`liveitem-${liveItem.liveId}-${liveItem.liveItemNo}`}
                                live={live}
                                liveItem={liveItem}
                                withDialog
                              />
                            );
                          })}
                        </div>
                        {live.posts.length > 0 && (
                          <div
                            key={`posts-live-${live.liveId}`}
                            className={`relative w-full sm:h-full sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden ${(() => {
                              const rowNum = live.items.length;
                              if (0 < rowNum && rowNum < 4) {
                                return "sm:max-h-192";
                              } else if (4 <= rowNum && rowNum < 8) {
                                return "sm:max-h-640";
                              } else if (8 <= rowNum && rowNum < 12) {
                                return "sm:max-h-800";
                              } else {
                                return "";
                              }
                            })()}`}
                          >
                            <h4 className="text-base pt-1 pb-2 text-black">
                              関連ポスト
                            </h4>
                            <Tweets
                              parentId={`${live.liveId}`}
                              posts={live.posts.reverse().map((post) => ({
                                id: post.livePostId,
                                html: post.livePostHTML,
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
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

export default connect(mapStateToProps)(TimelineItem);
