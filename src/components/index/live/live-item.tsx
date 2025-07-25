import React, { Component } from "react";
import { Badge } from "flowbite-react";
import { GoLinkExternal } from "react-icons/go";
import { BsArrowsAngleExpand, BsCalendarCheck } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { LiveInfo, MergedLiveItem } from "../../../types/live";
import Tweets from "../../modules/tweets";
import UtilityService from "../../../services/UtilityService";
import LazyComponent from "../../modules/LazyComponent";

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
                    UtilityService.gtag({
                      category: "click",
                      action: "dialog-close",
                      label: `${live.title}-${liveItem.liveItemName}`,
                    });

                    document
                      .getElementsByTagName("body")[0]
                      .classList.remove("overflow-hidden");
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
                className={`relative max-w-full ${
                  liveItem.setList.length > 0 ? "sm:max-h-128" : "sm:max-h-192"
                }`}
              >
                <div className="mx-auto">
                  <LazyComponent>
                    <iframe
                      src={liveItem.googleMapsUrl}
                      className="w-full h-48"
                      loading="eager"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </LazyComponent>
                </div>
                <div className="text-left w-full text-xs font-normal text-gray-800 pt-2 pl-2">
                  {liveItem.address && <span>{liveItem.address}</span>}
                  {liveItem.placeSite && (
                    <a
                      className="flex justify-left items-center leading-loose"
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
          <div className="relative w-full sm:h-full px-2">
            <div key={`setlist-${liveItem.liveId}-${liveItem.liveItemNo}`}>
              <h5
                className={`underline underline-offset-4 decoration-dashed decoration-1 pt-3 pb-2 text-sm tracking-widest text-gray-800`}
              >
                セットリスト
              </h5>
              {liveItem.setList.length > 0 ? (
                <ol className={`list-decimal max-h-full`}>
                  {liveItem.setList.map((song, i, setList) => (
                    <li
                      className={`leading-relaxed text-xs ml-6`}
                      key={`setlist-${song.liveId}-${song.liveItemNo}-${song.liveItemSongNo}`}
                    >
                      <span
                        className={`underline underline-offset-4 decoration-dotted decoration-1 leading-loose text-gray-800`}
                        dangerouslySetInnerHTML={{
                          __html: song.liveItemSongName,
                        }}
                      />
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
        {!this.props.withDialog && live.posts.length > 0 && (
          <div className="relative w-full h-full sm:max-h-208 sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden">
            {this.renderSpotifyPlaylist()}
            <h4 className="text-base pt-1 pb-2 pl-2 text-black">関連ポスト</h4>
            <div className="pb-3">
              <Tweets
                parentId={`${live.liveId}-${liveItem.liveItemNo}`}
                posts={live.posts.reverse().map((post) => ({
                  id: post.livePostId,
                  html: post.livePostHTML,
                }))}
              />
            </div>
          </div>
        )}
        {this.props.withDialog && liveItem.posts.length > 0 && (
          <div className="relative w-full h-full sm:max-h-208 sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden">
            {this.renderSpotifyPlaylist()}
            <h4 className="text-base pt-1 pb-2 pl-2 text-black">関連ポスト</h4>
            <div className="pb-3">
              <Tweets
                parentId={`${live.liveId}-${liveItem.liveItemNo}`}
                posts={liveItem.posts.reverse().map((post) => ({
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

  renderSpotifyPlaylist() {
    if (this.props.withDialog) {
      if (null !== this.props.liveItem.spotifyPlaylistId) {
        return (
          <LazyComponent>
            <iframe
              className="rounded-xl p-2"
              src={`https://open.spotify.com/embed/playlist/${this.props.liveItem.spotifyPlaylistId}?utm_source=generator`}
              width="100%"
              height="400"
              // frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
            />
          </LazyComponent>
        );
      }
    } else {
      if (null !== this.props.live.spotifyPlaylistId) {
        return (
          <LazyComponent>
            <iframe
              className="rounded-xl p-2"
              src={
                this.props.withDialog
                  ? `https://open.spotify.com/embed/playlist/${this.props.liveItem.spotifyPlaylistId}?utm_source=generator`
                  : `https://open.spotify.com/embed/playlist/${this.props.live.spotifyPlaylistId}?utm_source=generator`
              }
              width="100%"
              height="400"
              // frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
            />
          </LazyComponent>
        );
      }
    }
    return <></>;
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
              UtilityService.gtag({
                category: "click",
                action: "dialog-show",
                label: `${live.title}-${liveItem.liveItemName}`,
              });
              event.stopPropagation();

              document
                .getElementsByTagName("body")[0]
                .classList.add("overflow-hidden");

              this.state.dialogRef?.current &&
                this.state.dialogRef.current.showModal();
            }}
          >
            <div className="relative w-full max-h-40 p-3">
              <h4 className="text-sm font-bold tracking-widest text-black">
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
            className="w-screen max-w-full sm:w-5/6 h-full sm:max-h-208 bg-white sm:backdrop-opacity-20 sm:backdrop-blur-xl rounded-lg border-theme mt-40 ml-0 mr-0 mb-0 sm:m-auto sm:p-3"
            onClick={(event) => {
              UtilityService.gtag({
                category: "click",
                action: "dialog-close",
                label: `${live.title}-${liveItem.liveItemName}`,
              });

              document
                .getElementsByTagName("body")[0]
                .classList.remove("overflow-hidden");

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
