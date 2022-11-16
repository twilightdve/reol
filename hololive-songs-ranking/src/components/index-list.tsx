import React, { Component, MouseEvent } from "react";
import { Video } from "../types/youtube-data";
import "react-lazy-load-image-component/src/effects/blur.css";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";

export type RankRange = { start: number; end: number };

type Props = {
  onClick: (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    range: RankRange,
    i: number
  ) => Promise<void>;
  chunks: Video[][];
  currentIndex: number;
  currentVideo: Video;
  isLoaded: boolean;
};

type State = {};

class IndexList extends Component<Props, State> {
  indexes: RankRange[] = [];

  constructor(props: Props) {
    super(props);
    console.log(props);
    this.state = {};
    this.indexes = props.chunks.slice(1).reduce(
      (previous, current, index) => {
        const start = previous[index].end + 1;
        return [
          ...previous,
          {
            start,
            end: previous[index].end + current.length,
          },
        ];
      },
      [
        {
          start: 1,
          end: props.chunks[0].length,
        },
      ]
    );
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

  currentRange = (index: RankRange) => {
    const base = ["w-full", "text-center", "leading-6"];
    if (
      index.start - 1 <= this.props.currentIndex &&
      this.props.currentIndex <= index.end - 1
    ) {
      console.log(index.start, this.props.currentIndex, index.end);
      base.push("bg-[#49c8f0]");
      base.push("text-base");
      base.push("font-bold");
      base.push("text-zinc-700");
    } else {
      base.push("bg-zinc-700");
      base.push("text-sm");
    }
    return base.join(" ");
  };

  render() {
    try {
      console.log("render");
      return (
        <div className="text-white px-2 py-1">
          <div className="w-full grid grid-cols-3 gap-1 place-content-center">
            {this.indexes.map((range, i) => {
              return (
                <div
                  key={`chunk-${i}`}
                  className={this.currentRange(range)}
                  onClick={(e) => this.props.onClick(e, range, i)}
                >
                  {range.end} → {range.start}
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RootState) => state.player;

const mapDispatchToProps = (dispatch: AppDispatch) => {};

export default connect(mapStateToProps, mapDispatchToProps)(IndexList);
