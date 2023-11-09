import React, { Component } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import "react-lazy-load-image-component/src/effects/blur.css";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  setNextVideo,
  setIsLoaded,
  setIsShrinked,
} from "../../redux/slices/playerSlice";
import { DiscographyWithSongs } from "../../types/discography";
import { Spinner } from "flowbite-react";
import UtilityService from "../../services/UtilityService";

const defaultOpts: Options = {
  height: "180",
  width: "320",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    // controls: 0,
    // disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    loop: 1,
    rel: 0,
    color: "white",
    // widget_referrer: "",
  },
};

type Props = {
  playlist: DiscographyWithSongs[];
  currentVideoId: string;
  setNextVideo: any;
  setIsLoaded: any;
  isLoaded: boolean;
  isShrinked: boolean;
  setIsShrinked: any;
  playerRef: any;
  onReady?: (event: YouTubeEvent) => Promise<void>;
  onPlay?: (event: YouTubeEvent) => Promise<void>;
  onEnd?: (event: YouTubeEvent) => Promise<void>;
  onError?: (event: YouTubeEvent) => Promise<void>;
};

type State = {
  isScrolled: boolean;
  onPlaying: boolean;
};

class MainVideo extends Component<Props, State> {
  isBrowser = typeof window !== "undefined";
  ref: React.RefObject<YouTube> = React.createRef<YouTube>();
  constructor(props: Props) {
    super(props);
    this.state = {
      isScrolled: this.isBrowser && window.screenY > 200,
      onPlaying: false,
    };
  }

  async componentDidMount() {
    window.addEventListener("scroll", (event) => {
      if (this.isBrowser && window.scrollY > 200) {
        this.props.setIsShrinked(true);
      } else {
        this.props.setIsShrinked(false);
      }
    });
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {}

  onReady = async (event: YouTubeEvent) => {
    try {
      if (this.props?.onReady) this.props.onReady(event);
      this.props.setIsLoaded(this.ref);
    } catch (error) {
      alert("onReady: " + error?.toString());
    }
  };

  onPlay = async (event: YouTubeEvent) => {
    try {
      if (this.props?.onPlay) this.props.onPlay(event);
      UtilityService.gtag({
        category: "youtube",
        action: "play",
        label: this.props.currentVideoId,
      });
      this.setState({
        ...this.state,
        onPlaying: true,
      });
    } catch (error) {
      alert("onPlay: " + error?.toString());
    }
  };

  onEnd = async (event: YouTubeEvent) => {
    try {
      if (this.props?.onEnd) this.props.onEnd(event);
      UtilityService.gtag({
        category: "youtube",
        action: "end",
        label: this.props.currentVideoId,
      });
      this.setState({
        ...this.state,
        onPlaying: false,
      });
    } catch (error) {
      alert("onEnd" + error?.toString());
    }
  };

  onError = (event: YouTubeEvent) => {
    if (this.props?.onError) this.props.onError(event);
    UtilityService.gtag({
      category: "youtube",
      action: "end",
      label: this.props.currentVideoId,
    });
    setTimeout(this.onEnd.bind(event), 3000, event);
  };

  render() {
    try {
      const playlist = this.props.playlist
        .filter((item) => item.xfdUrl)
        .map((item) => (item.xfdUrl ?? "").replace("https://youtu.be/", ""));
      return (
        <div
          id="PlayerContainer"
          className={`sticky z-20 top-0 w-full overflow-hidden transition-all ease-in-out duration-200 delay-300 origin-top-right ${
            this.props.isShrinked
              ? "sm:fixed sm:w-80 sm:top-1 sm:right-1 sm:-translate-x-1 sm:rounded-lg"
              : "sm:w-full sm:top-0 sm:right-0 sm:left-full sm:translate-x-0 sm:rounded-none"
          }`}
        >
          <div className={`relative aspect-video w-full sm:max-h-128`}>
            <div
              className={
                this.props.isLoaded
                  ? "hidden"
                  : "relative bg-black aspect-video sm:max-h-128 w-full"
              }
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Spinner aria-label="main video" color="failure" size="xl" />
              </div>
              <img
                className="w-full h-full object-cover object-center"
                src={`https://i.ytimg.com/vi/${
                  this.props.currentVideoId
                    ? this.props.currentVideoId
                    : playlist[0]
                }/mqdefault.jpg`}
              />
            </div>
            <YouTube
              videoId={this.props.currentVideoId}
              ref={this.ref}
              opts={{
                ...defaultOpts,
                playerVars: {
                  ...defaultOpts.playerVars,
                  playlist: playlist.join(","),
                  autoplay: this.state.onPlaying ? 1 : 0,
                },
              }}
              className={
                !this.props.isLoaded
                  ? "invisible"
                  : "absolute top-0 right-0 w-full"
              }
              iframeClassName={`aspect-video w-full h-full sm:max-h-128 ${
                this.props.isShrinked ? "" : ""
              }`}
              onReady={this.onReady}
              onPlay={this.onPlay}
              onError={this.onError}
              onEnd={this.onEnd}
            />
          </div>
        </div>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RootState) => state.player;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setNextVideo: (url: string) =>
      dispatch(setNextVideo({ videoId: url.replace("https://youtu.be/", "") })),
    setIsLoaded: (ref: React.RefObject<YouTube>) => dispatch(setIsLoaded(ref)),
    setIsShrinked: (state: boolean) => dispatch(setIsShrinked(state)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainVideo);
