import React, { Component } from "react";
import { Badge } from "flowbite-react";
import { GoLinkExternal } from "react-icons/go";
import { BsArrowsAngleExpand, BsCalendarCheck } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { LiveInfo, MergedLiveItem } from "../../../types/live";
import Tweets from "../../modules/tweets";
import ReactGA from "react-ga4";

type Props = {
  live: LiveInfo;
  liveItem: MergedLiveItem;
  withDialog?: boolean;
};

type State = {
  isExpand: boolean;
  dialogRef: React.RefObject<HTMLDialogElement> | null;
};

export default class LiveItem extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isExpand: false,
      dialogRef: this.props.withDialog
        ? React.createRef<HTMLDialogElement>()
        : null,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  renderContent() {
    const live = this.props.live;
    const liveItem = this.props.liveItem;
    const dialogRef = this.state.dialogRef;
    return (
      <div
        className={`relative sm:flex sm:flex-1 sm:justify-start sm:gap-5 sm:flex-row w-full h-full ${
          this.props.withDialog
            ? ""
            : "sm:border sm:border-theme sm:rounded-lg sm:px-5 sm:py-3"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`relative w-full sm:h-full sm:max-h-208 py-3 overflow-hidden ${
            liveItem.posts.length > 0 ? "sm:w-1/2" : ""
          }`}
        >
          <>
            {this.props.withDialog && (
              <div className="flex justify-between items-center">
                <h5 className="text-base sm:text-lg sm:font-bold tracking-tight text-black pl-2 pb-2">
                  <span className="flex justify-start items-center">
                    <Badge
                      color="yellow"
                      icon={BsCalendarCheck}
                      className="text-sm sm:text-base px-2 mr-2 tracking-widest"
                    >
                      <span className="px-1">
                        {liveItem.date.replaceAll("-", "/")}
                      </span>
                    </Badge>
                    {liveItem.liveItemName ? liveItem.liveItemName : live.title}
                  </span>
                </h5>
                <button
                  className="w-6 h-6 text-xl rounded-full ring-2 ring-gray-800 bg-white mr-3 sm:hidden"
                  onClick={(event) => {
                    ReactGA.event({
                      category: "click",
                      action: "dialog-close",
                      label: `${live.title}-${liveItem.liveItemName}`,
                    });
                    document
                      .getElementsByTagName("body")[0]
                      .classList.toggle("overflow-hidden");
                    if (dialogRef?.current) {
                      dialogRef.current.close();
                    }
                  }}
                >
                  <AiOutlineClose className="m-auto" />
                </button>
              </div>
            )}
            {liveItem.googleMapsUrl && (
              <div
                className={`relative max-w-full max-h-112 ${
                  liveItem.setList.length > 0 ? "sm:max-h-128" : "sm:max-h-192"
                }`}
              >
                <div className="mx-auto">
                  <iframe
                    src={liveItem.googleMapsUrl}
                    className="w-full aspect-video sm:aspect-video sm:max-h-96"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="text-center w-full text-sm font-normal text-gray-800 pt-2">
                  {liveItem.address && <span>{liveItem.address}</span>}
                  {liveItem.placeSite && (
                    <a
                      className="flex justify-center items-center leading-loose"
                      href={liveItem.placeSite}
                      target="_blank"
                    >
                      {liveItem.placeSite}
                      <GoLinkExternal className="ml-1 text-xs sm:text-sm" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
          <div className="relative w-full sm:h-full">
            <div key={`setlist-${liveItem.liveId}-${liveItem.liveItemNo}`}>
              <h5
                className={`underline underline-offset-4 decoration-dashed decoration-1 pt-3 pb-2 text-base tracking-widest text-gray-800`}
              >
                SET LIST
              </h5>
              {liveItem.setList.length > 0 ? (
                <ol className={`list-decimal pl-5 max-h-full`}>
                  {liveItem.setList.map((song, i, setList) => (
                    <li
                      className={`leading-relaxed text-sm`}
                      key={`setlist-${song.liveId}-${song.liveItemNo}-${song.liveItemSongNo}`}
                    >
                      <span
                        className={`underline underline-offset-4 decoration-dotted decoration-1 leading-loose text-gray-800`}
                      >
                        {song.liveItemSongName}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div>
                  セトリ不明のためご存知の方は教えてもらえると助かります…！
                </div>
              )}
            </div>
          </div>
        </div>
        {liveItem.posts.length > 0 && (
          <div className="relative w-full sm:h-full sm:max-h-208 sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden">
            <h4 className="text-base pt-1 pb-2 text-black">関連ポスト</h4>
            <div className="pb-3">
              <Tweets
                parentId={`${live.liveId}-${liveItem.liveItemNo}`}
                posts={liveItem.posts.map((post) => ({
                  id: post.liveItemPostId,
                  html: post.liveItemPostHTML,
                }))}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const live = this.props.live;
    const liveItem = this.props.liveItem;
    if (this.props.withDialog) {
      return (
        <div key={`live-item-dialog-${liveItem.liveId}-${liveItem.liveItemNo}`}>
          <div
            key={`card-live-${liveItem.liveId}-${liveItem.liveItemNo}`}
            className="w-80 bg-white border border-gray-200 rounded-lg shadow"
            onClick={(event) => {
              ReactGA.event({
                category: "click",
                action: "dialog-show",
                label: `${live.title}-${liveItem.liveItemName}`,
              });
              event.stopPropagation();
              document
                .getElementsByTagName("body")[0]
                .classList.toggle("overflow-hidden");
              this.state.dialogRef?.current &&
                this.state.dialogRef.current.showModal();
            }}
          >
            {liveItem.googleMapsUrl && (
              <iframe
                src={liveItem.googleMapsUrl}
                className="aspect-square w-full pointer-events-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            <div className="relative w-full max-h-40 p-3">
              <h4 className="text-base font-bold tracking-widest text-black">
                <div className="flex justify-between items-center">
                  <span className="flex justify-start items-center">
                    <Badge
                      color="yellow"
                      icon={BsCalendarCheck}
                      className="text-sm px-2 mr-2"
                    >
                      <span className="px-1">
                        {liveItem.date.replaceAll("-", "/")}
                      </span>
                    </Badge>
                    {liveItem.liveItemName}
                  </span>
                </div>
              </h4>
              <div className="pl-2">
                <div className="text-sm font-normal text-gray-800 pt-2 whitespace-nowrap overflow-hidden">
                  {liveItem.placeSite ? (
                    <span className="flex justify-start items-center">
                      {liveItem.place}
                    </span>
                  ) : (
                    liveItem.place
                  )}
                  <span className="text-xs">{liveItem.address}</span>
                </div>
              </div>
              <BsArrowsAngleExpand className="absolute top-2 right-2 text-sm" />
            </div>
          </div>
          <dialog
            key={`dialog-${liveItem.liveId}-${this.props.liveItem.liveItemNo}`}
            ref={this.state.dialogRef}
            className="w-screen max-w-full sm:w-5/6 h-5/6 sm:max-h-208 bg-white sm:backdrop-opacity-20 sm:backdrop-blur-xl rounded-lg border-theme mt-52 ml-0 mr-0 mb-0 sm:m-auto sm:p-3"
            onClick={(event) => {
              ReactGA.event({
                category: "click",
                action: "dialog-close",
                label: `${live.title}-${liveItem.liveItemName}`,
              });
              document
                .getElementsByTagName("body")[0]
                .classList.toggle("overflow-hidden");
              if (this.state.dialogRef?.current) {
                this.state.dialogRef.current.close();
              }
            }}
          >
            {this.renderContent()}
          </dialog>
        </div>
      );
    } else {
      return this.renderContent();
    }
  }
}
