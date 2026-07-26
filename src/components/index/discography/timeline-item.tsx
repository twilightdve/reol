import React, { useState, useCallback } from "react";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs } from "../../../types/discography";
import { GoChevronUp, GoLinkExternal, GoListUnordered } from "react-icons/go";
import { FaCompactDisc, FaCirclePlay } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setNextVideo } from "../../../redux/slices/playerSlice";
import { FlowbiteTimelinePointTheme } from "flowbite-react/lib/esm/components/Timeline/TimelinePoint";
import { FlowbiteTimelineContentTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineContent";
import { FlowbiteTimelineItemTheme } from "flowbite-react/lib/esm/components/Timeline/TimelineItem";
import Tweets from "../../modules/tweets";
import UtilityService from "../../../services/UtilityService";
import ItemSong from "./item-song";
import LazyComponent from "../../modules/LazyComponent";
import YouTube from "react-youtube";

type Props = {
  item: DiscographyWithSongs;
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

const TimelineItem: React.FC<Props> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { isLoaded, currentVideoId, isShrinked, playerRef } = useAppSelector(
    (state) => state.player
  );

  const [isExpand, setIsExpand] = useState(false);

  const handleTitleClick = useCallback(() => {
    UtilityService.gtag({
      category: "click",
      action: "timeline-discography",
      label: item.title,
    });

    setIsExpand((prev) => !prev);
  }, [item.title]);

  const handlePlayClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (item.xfdUrl) {
        UtilityService.gtag({
          category: "click",
          action: "play",
          label: item.xfdUrl,
        });
        dispatch(
          setNextVideo({
            videoId: item.xfdUrl.replace("https://youtu.be/", ""),
          })
        );
      }
    },
    [item.xfdUrl, dispatch]
  );

  return (
    <Timeline.Item theme={timelineItemTheme}>
      <Timeline.Point icon={FaCompactDisc} theme={timelinePointTheme} />
      <Timeline.Content>
        <Timeline.Time
          theme={{
            time: "mb-1 text-xs sm:text-sm font-normal leading-none text-bx-ink2 tracking-widest",
          }}
        >
          {item.releaseDate?.replaceAll("-", "/")}
        </Timeline.Time>
        <Timeline.Title
          theme={{
            title: `flex flex-col font-semibold text-bx-ink${
              !isExpand ? " border-b border-bx-line" : ""
            }`,
          }}
          onClick={handleTitleClick}
        >
          <div
            className="w-5/6 mt-2 flex flex-1 justify-start items-center"
            onClick={handlePlayClick}
          >
            <FaCirclePlay className="mr-2 w-4" />
            <span className={`text-sm tracking-widest`}>{item.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <ul className="flex justify-start list-none py-2 ml-6 text-xs text-bx-ink font-thin tracking-widest">
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
              <span className="w-4/12 text-sm text-bx-ink2">
                {isExpand ? (
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
          {isExpand && item.songs.length > 0 && (
            <div className="flex flex-wrap bg-bx-surface/5 mt-2 px-5 pt-2 pb-5 rounded-lg border border-bx-line text-xs">
              <div
                className={`${item.posts.length > 0 ? "sm:w-1/2" : "w-full"}`}
              >
                <h4 className="text-sm font-bold leading-10 text-bx-ink">
                  収録曲
                </h4>
                <ol className="list-decimal list-outside pl-5 text-bx-ink font-thin tracking-widest">
                  {item.songs.map((song, i) => {
                    return (
                      <ItemSong
                        key={`songs-${item.discographyUuid}-${i}`}
                        song={song}
                      />
                    );
                  })}
                </ol>
                {item.reports && item.reports.length > 0 && (
                  <div className="text-bx-ink">
                    <h4 className="text-sm tracking-widest pt-3 pb-2">
                      &lt;インタビュー&gt;
                    </h4>
                    <ul className="list-disc pl-5 text-xs">
                      {item.reports.map((report) => {
                        return (
                          <li
                            key={`report-${report.discographyUuid}-${report.discographyRepoUuid}`}
                          >
                            <a
                              className="leading-loose"
                              href={report.discographyReportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
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
                  <h4 className="text-sm font-bold pt-1 pb-2 text-bx-ink">
                    関連ポスト
                  </h4>
                  <Tweets
                    parentId={`${item.discographyUuid}`}
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
};

export default TimelineItem;
