import { ParsedQuery } from "query-string";
import React, { Component } from "react";
import { GoGear } from "react-icons/go";
import { ImLoop } from "react-icons/im";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import VideoArchive, { DEFALUT_START_INDEX } from "./video-archive";
import { open, close } from "../redux/slices/modalSlice";

type Props = {
  videoArchiveNames: string[];
  channelArchiveNames: string[];
  queries: ParsedQuery;
  open: VoidFunction;
  close: VoidFunction;
  isOpen: boolean;
};

type State = {};

export class IndexPageContent extends Component<Props, State> {
  static MODAL_HEIGHT = 384;
  gearRef = React.createRef<HTMLDivElement>();
  settingRef = React.createRef<HTMLDivElement>();
  layerRef = React.createRef<HTMLDivElement>();
  videoArchiveWrapperRef = React.createRef<HTMLDivElement>();
  latestVideoArchive: string;
  latestChannelArchive: string;
  startIndex: number;

  constructor(props: Props) {
    super(props);
    console.log(props);

    this.state = {};
    this.latestVideoArchive = this.props.videoArchiveNames
      .map((v) => v.replace("videos/", ""))
      .sort((a, b) => +b - +a)[0];
    this.latestChannelArchive = this.props.channelArchiveNames
      .map((v) => v.replace("channels/", ""))
      .sort((a, b) => +b - +a)[0];
    const { r } = this.props.queries;
    this.startIndex = "string" === typeof r ? +r : DEFALUT_START_INDEX;
  }

  switchModalState = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this.props.isOpen) {
      this.layerRef?.current?.classList.add("hidden");
      this.settingRef?.current?.classList.add("hidden");
      this.props.close();
    } else {
      this.layerRef?.current?.classList.remove("hidden");
      this.settingRef?.current?.classList.remove("hidden");
      this.props.open();
    }
  };

  render() {
    try {
      return (
        <>
          <div
            ref={this.layerRef}
            className="fixed w-screen h-screen bg-black bg-opacity-75 z-30 overflow-y-hidden hidden"
            onClick={(event) => {
              event.preventDefault();
              this.switchModalState(event);
            }}
          ></div>
          <div ref={this.videoArchiveWrapperRef}>
            <VideoArchive
              archiveName={this.latestVideoArchive}
              channelArchiveName={this.latestChannelArchive}
              startIndex={this.startIndex}
            ></VideoArchive>
          </div>
          <div
            ref={this.settingRef}
            className={[
              "fixed",
              "left-1/2",
              "top-1/2",
              "-translate-x-2/4",
              "-translate-y-2/4",
              "w-10/12",
              "z-40",
              "bg-white",
              "hidden",
            ].join(" ")}
          >
            <div className="w-full">
              <div className="w-full h-24">
                <ImLoop />
              </div>
            </div>
          </div>
          <div
            id="setting-modal-button"
            className="fixed bottom-6 right-6 rounded-full z-50 bg-[#49c8f0] w-12 h-12 shadow-inner shadow-white"
          >
            <div
              ref={this.gearRef}
              onClick={(event) => {
                event.preventDefault();
                console.log("setting on click");
                console.log(event);
                this.switchModalState(event);
              }}
              className="w-full h-full flex items-center justify-center text-white text-3xl"
            >
              <GoGear />
            </div>
          </div>
        </>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RootState) => state.modal;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    open: () => dispatch(open()),
    close: () => dispatch(close()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexPageContent);
