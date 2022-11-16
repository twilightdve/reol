import React, { Component } from "react";
import { Channel, Video } from "../types/youtube-data";
import "react-lazy-load-image-component/src/effects/blur.css";
import { GoLinkExternal } from "react-icons/go";
import UtilityService from "../services/UtilityService";

export const CHANNEL_BASE_PATH = "https://www.youtube.com/channel/";

type Props = {
  rank: number;
  video: Video;
  channel: Channel;
};

type State = {};

class VideoMeta extends Component<Props, State> {
  videoRefs: React.RefObject<HTMLDivElement>[] = [];
  hideContextMenu = (e: React.MouseEvent<HTMLImageElement>) =>
    e.preventDefault();

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    console.log("componentDidMount");
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    console.log("componentDidUpdate");
  }

  render() {
    try {
      console.log("render");
      return (
        <div className="text-white px-2 py-1">
          <h2 className="text-sm font-bold leading-loose">
            {this.props.rank}. {this.props.video.title}
          </h2>
          <p className="flex text-xs">
            <span>
              {UtilityService.formatViewCount(this.props.video.viewCount)}
              回視聴
            </span>
            <span>・</span>
            <span>
              {UtilityService.formatTimeDiff(this.props.video.publishedAt)}
            </span>
          </p>
          <div className="flex pt-2 pb-1 h-9 items-center">
            <img
              className="h-full rounded-full"
              src={this.props.channel.thumbnail}
            />
            <a
              className="flex justify-between items-center text-sm px-2"
              href={`${CHANNEL_BASE_PATH}${this.props.video.channelId}`}
              target="_blank"
            >
              {this.props.video.channelTitle}
              <GoLinkExternal className="ml-1" />
            </a>
          </div>
        </div>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

export default VideoMeta;
