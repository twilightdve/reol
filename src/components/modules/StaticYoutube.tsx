import React, { Component } from "react";
import YouTube from "react-youtube";
import { TYPES } from "../index/photography/posts";
import { Button } from "flowbite-react";
import { FaYoutube } from "react-icons/fa6";
import LazyComponent from "./LazyComponent";

type Props = {
  videoId: string;
  type: number;
};

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  isLoaded: boolean;
};

export default class StaticYoutube extends Component<Props, State> {
  classNamePatterns = {
    [TYPES.youtube]: "relative w-full mb-4",
    [TYPES.youtube_tate]: "relative w-full max-h-144 mb-4",
  };
  previewClassNamePatterns = {
    [TYPES.youtube]: "relative w-full mb-4",
    [TYPES.youtube_tate]: "relative h-full object-cover blur-[0.5px]",
  };
  iframeClassNamePatterns = {
    [TYPES.youtube]: "relative w-full",
    [TYPES.youtube_tate]: "relative max-h-144 w-full",
  };
  widthPatterns = {
    [TYPES.youtube]: "528",
    [TYPES.youtube_tate]: "390",
  };
  heightPatterns = {
    [TYPES.youtube]: "297",
    [TYPES.youtube_tate]: "640",
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      ref: React.createRef<HTMLDivElement>(),
      isLoaded: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <div
        ref={this.state.ref}
        className={this.classNamePatterns[this.props.type]}
      >
        {!this.state.isLoaded ? (
          <div
            onClick={() => this.setState({ ...this.state, isLoaded: true })}
            className="mb-2"
          >
            <img
              src={`https://i.ytimg.com/vi/${this.props.videoId}/sddefault.jpg`}
              className={this.previewClassNamePatterns[this.props.type]}
              loading="lazy"
            />
            <div className="w-full h-full">
              <Button
                pill
                className="absolute top-0 bottom-0 left-0 right-0 m-auto w-20 h-20 bg-theme"
              >
                <FaYoutube className="text-4xl" />
              </Button>
            </div>
          </div>
        ) : (
          <YouTube
            videoId={this.props.videoId}
            className={this.classNamePatterns[this.props.type]}
            iframeClassName={this.iframeClassNamePatterns[this.props.type]}
            loading="eager"
            opts={{
              width: this.widthPatterns[this.props.type],
              height: this.heightPatterns[this.props.type],
              playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: 0,
                // controls: 0,
                // disablekb: 1,
                enablejsapi: 0,
                playsinline: 1,
                loop: 0,
                rel: 0,
                color: "white",
                origin: "https://reol.twilightea.com/",
                widget_referrer: "https://reol.twilightea.com/",
              },
            }}
          />
        )}
      </div>
    );
  }
}
