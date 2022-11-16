import React, { Component } from "react";
import { Channel, defaultChannel, Video } from "../types/youtube-data";
import "react-lazy-load-image-component/src/effects/blur.css";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { setNextVideo } from "../redux/slices/playerSlice";
import VideoMeta from "./video-meta";

export type RankRange = { start: number; end: number };

type Props = {
  videos: Video[];
  channels: { [p: string]: Channel };
  range: RankRange;
  currentIndex: number;
  currentVideo: Video;
  isLoaded: boolean;
  setNextVideo: any;
};

type State = {};

class Thumbnails extends Component<Props, State> {
  videoRefs: React.RefObject<HTMLDivElement>[] = [];
  hideContextMenu = (e: React.MouseEvent<HTMLImageElement>) =>
    e.preventDefault();

  constructor(props: Props) {
    super(props);
    console.log(props);
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
    this.videoRefs = this.props.videos.map((v) =>
      React.createRef<HTMLDivElement>()
    );
    console.log(this.videoRefs[this.props.currentIndex]);
    this.videoRefs[this.props.currentIndex]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }

  render() {
    try {
      console.log("render");
      return (
        <div className="bg-zinc-800 text-white z-10">
          {this.props.videos
            .slice()
            .reverse()
            .map((v, i, ary) => {
              return (
                <div key={v.videoId} className="py-1" ref={this.videoRefs[i]}>
                  <div>
                    <LazyLoadImage
                      className="w-full cursor-pointer"
                      effect="blur"
                      alt={v.title}
                      height={window.innerWidth * 0.75}
                      src={v.thumbnail}
                      // width={"480px"}
                      onContextMenu={this.hideContextMenu}
                      onClick={async (e) => {
                        e.preventDefault();
                        console.log("onClick");
                        const index = i + 1;
                        this.props.setNextVideo(index, v);
                        if (index < ary.length) {
                          this.videoRefs[index].current?.scrollIntoView({
                            behavior: "smooth",
                            block: "end",
                          });
                        }
                      }}
                    />
                  </div>
                  <VideoMeta
                    rank={this.props.currentRange.end - i}
                    video={v}
                    channel={
                      this.props.channels[v.channelId] ??
                      this.props.channels[defaultChannel]
                    }
                  />
                </div>
              );
            })}
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
    setNextVideo: (index: number, video: Video) =>
      dispatch(setNextVideo({ index, video })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnails);
