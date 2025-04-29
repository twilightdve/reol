import React, { Component } from "react";
import YouTube from "react-youtube";
import { TYPES } from "../index/photography/posts";

type Props = {
  videoId: string;
  type: number;
};

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  isLoaded: boolean;
  observer: IntersectionObserver | null;
};

export default class LazyYoutube extends Component<Props, State> {
  classNamePatterns = {
    [TYPES.youtube]: "relative max-w-full w-full aspect-w-16 aspect-h-9",
    [TYPES.youtube_tate]: "w-full max-h-144",
  };
  iframeClassNamePatterns = {
    [TYPES.youtube]: "",
    [TYPES.youtube_tate]:
      "block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-144 w-full",
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
      observer: null,
    };
  }

  componentDidMount() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.isLoaded) {
          this.setState({ ...this.state, isLoaded: true });
          this.state.observer?.disconnect(); // ロード後は監視を解除
        }
      },
      { threshold: 0.1 }
    );
    if (this.state.ref?.current) {
      observer.observe(this.state.ref?.current);
    }
    this.setState({
      ...this.state,
      observer,
    });
  }

  componentWillUnmount() {
    if (this.state.observer) {
      this.state.observer.disconnect();
    }
  }

  render() {
    return (
      <div ref={this.state.ref}>
        {this.state.isLoaded && (
          <YouTube
            // key={`video-${postIndex}-${itemIndex}`}
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
