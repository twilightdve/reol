import React, { useRef, useCallback } from "react";
import { Badge } from "flowbite-react";
import { GoLinkExternal } from "react-icons/go";
import { BsArrowsAngleExpand, BsCalendarCheck } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from "gatsby";
import { LiveInfo, MergedLiveItem } from "../../../types/live";
import Tweets from "../../modules/tweets";
import UtilityService from "../../../services/UtilityService";
import LazyComponent from "../../modules/LazyComponent";
import RelatedLives from "./related-lives";

interface LiveItemProps {
  live: LiveInfo;
  liveItem: MergedLiveItem;
  withDialog?: boolean;
}

const LiveItem: React.FC<LiveItemProps> = ({
  live,
  liveItem,
  withDialog = false,
}) => {
  const dialogRef = withDialog ? useRef<HTMLDialogElement>(null) : null;

  const handleDialogClose = useCallback(() => {
    UtilityService.gtag({
      category: "click",
      action: "dialog-close",
      label: `${live.title}-${liveItem.liveItemName}`,
    });

    document.body.classList.remove("overflow-hidden");

    if (dialogRef?.current) {
      dialogRef.current.close();
    }
  }, [live.title, liveItem.liveItemName, dialogRef]);

  const handleDialogShow = useCallback(
    (event: React.MouseEvent) => {
      UtilityService.gtag({
        category: "click",
        action: "dialog-show",
        label: `${live.title}-${liveItem.liveItemName}`,
      });
      event.stopPropagation();
      document.body.classList.add("overflow-hidden");

      if (dialogRef?.current) {
        dialogRef.current.showModal();
      }
    },
    [live.title, liveItem.liveItemName, dialogRef]
  );

  const renderSpotifyPlaylist = useCallback(() => {
    if (withDialog) {
      if (liveItem.spotifyPlaylistId !== null) {
        return (
          <LazyComponent>
            <iframe
              className="rounded-xl p-2"
              src={`https://open.spotify.com/embed/playlist/${liveItem.spotifyPlaylistId}?utm_source=generator`}
              width="100%"
              height="400"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
            />
          </LazyComponent>
        );
      }
    } else {
      if (live.spotifyPlaylistId !== null) {
        return (
          <LazyComponent>
            <iframe
              className="rounded-xl p-2"
              src={
                withDialog
                  ? `https://open.spotify.com/embed/playlist/${liveItem.spotifyPlaylistId}?utm_source=generator`
                  : `https://open.spotify.com/embed/playlist/${live.spotifyPlaylistId}?utm_source=generator`
              }
              width="100%"
              height="400"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
            />
          </LazyComponent>
        );
      }
    }
    return <></>;
  }, [withDialog, liveItem.spotifyPlaylistId, live.spotifyPlaylistId]);

  const renderContent = useCallback(
    () => (
      <div
        className={`relative sm:flex sm:flex-1 sm:justify-start sm:gap-5 sm:flex-row w-full h-full ${
          withDialog
            ? ""
            : "sm:border sm:border-bx-line sm:rounded-lg sm:px-5 sm:py-3"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`relative w-full sm:h-full sm:max-h-208 py-3 overflow-hidden ${
            liveItem.posts.length > 0 ? "sm:w-1/2" : ""
          }`}
        >
          <>
            {withDialog && (
              <div className="flex justify-between items-center">
                <h5 className="text-base sm:text-lg sm:font-bold tracking-tight text-bx-ink pl-2 pb-2">
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
                  className="w-6 h-6 text-xl rounded-full ring-2 ring-bx-line bg-bx-bg text-bx-ink mr-3 sm:hidden"
                  onClick={handleDialogClose}
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
                <div className="text-left w-full text-xs font-normal text-bx-ink pt-2 pl-2">
                  {liveItem.address && <span>{liveItem.address}</span>}
                  {liveItem.placeSite && (
                    <a
                      className="flex justify-left items-center leading-loose"
                      href={liveItem.placeSite}
                      target="_blank"
                      rel="noopener noreferrer"
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
            <div key={`setlist-${liveItem.liveItemUuid}`}>
              <h5
                className={`underline underline-offset-4 decoration-dashed decoration-1 pt-3 pb-2 text-sm tracking-widest text-bx-ink`}
              >
                セットリスト
              </h5>
              {liveItem.setList.length > 0 ? (
                <ol className={`list-decimal max-h-full`}>
                  {liveItem.setList.map((song) => {
                    const sanitized = UtilityService.sanitizeHTML(
                      song.liveItemSongName
                    );
                    const linkable =
                      song.songUuid !== undefined && song.songUuid !== null;
                    return (
                      <li
                        className={`leading-relaxed text-xs ml-6`}
                        key={song.liveItemSongUuid}
                      >
                        {linkable ? (
                          <Link
                            to={`/songs/stats/?songUuid=${song.songUuid}#song-${song.songUuid}`}
                            className="underline underline-offset-4 decoration-dotted decoration-1 leading-loose text-bx-ink hover:opacity-80"
                            title="楽曲統計ページで演奏履歴を見る"
                          >
                            <span
                              dangerouslySetInnerHTML={{ __html: sanitized }}
                            />
                          </Link>
                        ) : (
                          <span
                            className={`underline underline-offset-4 decoration-dotted decoration-1 leading-loose text-bx-ink`}
                            dangerouslySetInnerHTML={{ __html: sanitized }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div>
                  セトリ不明のためご存知の方は教えてもらえると助かります…！
                </div>
              )}
            </div>
            <RelatedLives liveUuid={live.liveUuid} />
          </div>
        </div>
        {!withDialog && live.posts.length > 0 && (
          <div className="relative w-full h-full sm:max-h-208 sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden">
            {renderSpotifyPlaylist()}
            <h4 className="text-base pt-1 pb-2 pl-2 text-bx-ink">関連ポスト</h4>
            <div className="pb-3">
              <Tweets
                parentId={`${live.liveUuid}-${liveItem.liveItemUuid}`}
                posts={live.posts.reverse().map((post) => ({
                  id: post.livePostId,
                  html: post.livePostHTML,
                }))}
              />
            </div>
          </div>
        )}
        {withDialog && liveItem.posts.length > 0 && (
          <div className="relative w-full h-full sm:max-h-208 sm:w-1/2 pt-2 sm:pt-2 sm:pb-2 sm:px-3 overflow-x-hidden">
            {renderSpotifyPlaylist()}
            <h4 className="text-base pt-1 pb-2 pl-2 text-bx-ink">関連ポスト</h4>
            <div className="pb-3">
              <Tweets
                parentId={`${live.liveUuid}-${liveItem.liveItemUuid}`}
                posts={liveItem.posts.reverse().map((post) => ({
                  id: post.liveItemPostId,
                  html: post.liveItemPostHTML,
                }))}
              />
            </div>
          </div>
        )}
      </div>
    ),
    [withDialog, liveItem, live, handleDialogClose, renderSpotifyPlaylist]
  );

  if (withDialog) {
    return (
      <div key={`live-item-dialog-${liveItem.liveItemUuid}`}>
        <div
          key={`card-live-${liveItem.liveItemUuid}`}
          className="w-80 bg-bx-surface/5 border border-bx-line rounded-lg"
          onClick={handleDialogShow}
        >
          <div className="relative w-full max-h-40 p-3">
            <h4 className="text-sm font-bold tracking-widest text-bx-ink">
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
              <div className="text-sm font-normal text-bx-ink pt-2 whitespace-nowrap overflow-hidden">
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
          key={`dialog-${liveItem.liveItemUuid}`}
          ref={dialogRef}
          className="w-screen max-w-full sm:w-5/6 h-full sm:max-h-208 bg-bx-bg text-bx-ink sm:backdrop-opacity-20 rounded-lg border border-bx-line mt-40 ml-0 mr-0 mb-0 sm:m-auto sm:p-3"
          onClick={handleDialogClose}
        >
          {renderContent()}
        </dialog>
      </div>
    );
  } else {
    return renderContent();
  }
};

export default LiveItem;
