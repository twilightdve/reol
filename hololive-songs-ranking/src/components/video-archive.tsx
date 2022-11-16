import React, { Component } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { Channel, defaultChannel, Video } from "../types/youtube-data";
import "react-lazy-load-image-component/src/effects/blur.css";
import { connect } from "react-redux";
import { fetchArchive } from "../redux/slices/archiveSlice";
import { AppDispatch, RootState } from "../redux/store";
import Player from "./player";
import { setNextChunk, setNextVideo } from "../redux/slices/playerSlice";
import IndexList, { RankRange } from "./index-list";
import Thumbnails from "./thumbnails";

type Props = {
  archiveName: string;
  channelArchiveName: string;
  startIndex: number;
  fetchArchive: any;
  channels: { [p: string]: Channel };
  videos: Video[];
  status: "idle" | "loading" | "failed";
  isLoaded: boolean;
  currentIndex: number;
  currentVideo: Video;
  currentChunkIndex: number;
  setNextVideo: any;
  setNextChunk: any;
};

type State = {};

export const DEFALUT_START_INDEX = 50;

class VideoArchive extends Component<Props, State> {
  startIndex: number = DEFALUT_START_INDEX;
  videoIndex: number = DEFALUT_START_INDEX;
  archiveOrderedByDesc: Video[] = [];
  archiveOrderedByAsc: Video[] = [];
  chunks: Video[][] = [];
  playerRef: React.RefObject<YouTube> = React.createRef<YouTube>();
  chunk = <T extends any[]>(arr: T, size: number): any[][] => {
    return arr.reduce(
      (newarr, _, i) =>
        i % size ? newarr : [...newarr, arr.slice(i, i + size)],
      [] as T[][]
    );
  };

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    console.log("componentDidMount");
    await this.props.fetchArchive(this.props.archiveName);
    console.log(this.props);

    this.archiveOrderedByDesc = this.props.videos;
    this.archiveOrderedByAsc = this.archiveOrderedByDesc.slice().reverse();

    this.chunks = this.chunk(this.archiveOrderedByDesc, 50);
    console.log(this.chunks);

    this.startIndex = this.props.startIndex;
    // クエリパラメータは1始まり想定なので配列のインデックスに変換
    if (this.startIndex < 0) {
      this.startIndex = this.archiveOrderedByDesc.length - 1;
    } else if (this.startIndex > this.archiveOrderedByDesc.length) {
      this.startIndex = this.archiveOrderedByDesc.length - 1;
    } else {
      this.startIndex--;
    }
    const currentVideo = this.archiveOrderedByDesc[this.startIndex];
    this.props.setNextVideo(this.startIndex, currentVideo);
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    console.log("componentDidUpdate");
    console.log(this.props);
  }

  onReady = async (event: YouTubeEvent) => {
    try {
    } catch (error) {
      alert("onReady: " + error?.toString());
    }
  };

  onPlay = async (event: YouTubeEvent) => {};

  onEnd = async (event: YouTubeEvent) => {
    try {
      let nextIndex = this.props.currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = this.startIndex;
      }
      console.log(nextIndex);
      const nextVideo = this.archiveOrderedByDesc[nextIndex];
      this.props.setNextVideo(nextIndex, nextVideo);
    } catch (error) {
      alert("onEnd" + error?.toString());
    }
  };

  onError = async (event: YouTubeEvent) => {
    console.log("onError", event.data);
    setTimeout(this.onEnd.bind(event), 3000, event);
  };

  render() {
    try {
      console.log("render");
      if (!this.props.isLoaded) {
        return <div className="bg-zinc-900">loading...</div>;
      } else {
        const currentVideo = this.props.currentVideo;
        const currentChunk = this.chunks[this.props.currentChunkIndex];
        return (
          <>
            <div className="sticky top-0 bg-zinc-900 z-10">
              <Player
                rank={this.props.currentIndex + 1}
                video={currentVideo}
                channel={
                  this.props.channels[currentVideo.channelId] ??
                  this.props.channels[defaultChannel]
                }
                onReady={this.onReady}
                onPlay={this.onPlay}
                onEnd={this.onEnd}
                onError={this.onError}
              />
              <IndexList
                chunks={this.chunks}
                onClick={async (event, range: RankRange, i: number) => {
                  event.preventDefault();
                  console.log("onClick");
                  const nextIndex = range.end - 1;
                  const nextVideo = this.archiveOrderedByAsc[nextIndex];
                  this.props.setNextVideo(nextIndex, nextVideo);

                  console.log(i);
                  this.props.setNextChunk(i, range);
                }}
              />
              <div className="w-full pt-1 bg-[#49c8f0]"></div>
            </div>
            <Thumbnails videos={currentChunk} channels={this.props.channels} />
          </>
        );
      }
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  ...state.archives,
  ...state.player,
});

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    fetchArchive: (dateString: string) => dispatch(fetchArchive(dateString)),
    setNextVideo: (index: number, video: Video) =>
      dispatch(setNextVideo({ index, video })),
    setNextChunk: (index: number, range: RankRange) =>
      dispatch(setNextChunk({ index, range })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoArchive);
