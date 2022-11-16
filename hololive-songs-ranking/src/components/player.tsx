import React, { Component } from "react";
import { GoLinkExternal } from "react-icons/go";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import { Channel, Video } from "../types/youtube-data";
import "react-lazy-load-image-component/src/effects/blur.css";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import VideoMeta from "./video-meta";

const defaultOpts: Options = {
  height: "390",
  width: "640",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
    // controls: 0,
    // disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    rel: 0,
  },
};

type Props = {
  rank: number;
  video: Video;
  channel: Channel;
  onReady: (event: YouTubeEvent) => Promise<void>;
  onPlay: (event: YouTubeEvent) => Promise<void>;
  onEnd: (event: YouTubeEvent) => Promise<void>;
  onError: (event: YouTubeEvent) => Promise<void>;
};

type State = {
  options: Options;
  previousPlayerState: number;
};

class Player extends Component<Props, State> {
  ref: React.RefObject<YouTube> = React.createRef<YouTube>();

  constructor(props: Props) {
    super(props);
    console.log(props);
    this.state = {
      options: defaultOpts,
      previousPlayerState: -1,
    };
  }

  async componentDidMount() {
    console.log("componentDidMount");
    console.log(this.props);
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    console.log(prevProps, this.props);
    if (prevProps.video !== this.props.video) {
      const player = this.ref.current?.getInternalPlayer();
      if (!player) return;
      this.loadVideoById(player, this.props.video);
    }
  }

  async loadVideoById(player: YouTubePlayer, video: Video) {
    await player.loadVideoById({
      videoId: video.videoId,
      startSeconds: video.start,
      endSeconds: video.end,
    });
  }

  onReady = async (event: YouTubeEvent) => {
    try {
      console.log("onReady");
      this.props.onReady(event);
      await this.loadVideoById(event.target, this.props.video);
    } catch (error) {
      alert("onReady: " + error?.toString());
    }
  };

  onPlay = async (event: YouTubeEvent) => {
    console.log("onPlay");
    this.props.onPlay(event);
    this.setState({
      ...this.state,
      previousPlayerState: event.data,
    });
  };

  onEnd = async (event: YouTubeEvent) => {
    console.log("onEnd");
    try {
      // onPlay発火前にonEndが2回発火され１曲スキップしてしまうため、連続したStateの場合は以下処理を実行しない
      if (this.state.previousPlayerState === event.data) return;
      this.props.onEnd(event);
      this.setState({
        ...this.state,
        previousPlayerState: event.data,
      });
    } catch (error) {
      alert("onEnd" + error?.toString());
    }
  };

  onError = (event: YouTubeEvent) => {
    console.log("onError", event.data);
    this.props.onError(event);
    setTimeout(this.onEnd.bind(event), 3000, event);
  };

  render() {
    try {
      console.log("render");
      const video = this.props.video;
      const channel = this.props.channel;
      return (
        <>
          <YouTube
            ref={this.ref}
            opts={this.state.options}
            className="relative"
            style={{
              paddingTop: "30px",
              paddingBottom: "50%",
            }}
            iframeClassName="absolute w-full h-full top-0 left-0"
            onReady={this.onReady}
            onPlay={this.onPlay}
            onError={this.onError}
            onEnd={this.onEnd}
          ></YouTube>
          <VideoMeta
            rank={this.props.rank}
            video={this.props.video}
            channel={this.props.channel}
          />
        </>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RootState) => state.archives;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
