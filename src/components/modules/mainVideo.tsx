import React, { useRef, useState, useCallback, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
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
    origin: "https://reol.twilightea.com/",
    widget_referrer: "https://reol.twilightea.com/",
  },
};

type Props = {
  playlist: DiscographyWithSongs[];
  onReady?: (event: YouTubeEvent) => Promise<void>;
  onPlay?: (event: YouTubeEvent) => Promise<void>;
  onEnd?: (event: YouTubeEvent) => Promise<void>;
  onError?: (event: YouTubeEvent) => Promise<void>;
};

const MainVideo: React.FC<Props> = ({
  playlist,
  onReady,
  onPlay,
  onEnd,
  onError,
}) => {
  const dispatch = useAppDispatch();
  const { currentVideoId, isLoaded, isShrinked, playerRef } = useAppSelector(
    (state) => state.player
  );

  const isBrowser = typeof window !== "undefined";
  const ref = useRef<YouTube>(null);
  const [isScrolled, setIsScrolled] = useState(
    isBrowser && window.scrollY > 200
  );
  const [onPlaying, setOnPlaying] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isBrowser && window.scrollY > 200) {
        dispatch(setIsShrinked(true));
      } else {
        dispatch(setIsShrinked(false));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBrowser, dispatch]);

  const handleReady = useCallback(
    async (event: YouTubeEvent) => {
      try {
        if (onReady) await onReady(event);
        dispatch(setIsLoaded(ref));
      } catch (error) {
        alert("onReady: " + error?.toString());
      }
    },
    [onReady, dispatch]
  );

  const handlePlay = useCallback(
    async (event: YouTubeEvent) => {
      try {
        if (onPlay) await onPlay(event);
        UtilityService.gtag({
          category: "youtube",
          action: "play",
          label: currentVideoId,
        });
        setOnPlaying(true);
      } catch (error) {
        alert("onPlay: " + error?.toString());
      }
    },
    [onPlay, currentVideoId]
  );

  const handleEnd = useCallback(
    async (event: YouTubeEvent) => {
      try {
        if (onEnd) await onEnd(event);
        UtilityService.gtag({
          category: "youtube",
          action: "end",
          label: currentVideoId,
        });
        if (!currentVideoId) {
          setCurrentPlaylistIndex((prev) => prev + 1);
        }
      } catch (error) {
        alert("onEnd" + error?.toString());
      }
    },
    [onEnd, currentVideoId]
  );

  const handleError = useCallback(
    (event: YouTubeEvent) => {
      if (onError) onError(event);
      UtilityService.gtag({
        category: "youtube",
        action: "end",
        label: currentVideoId,
      });
      setTimeout(() => handleEnd(event), 3000);
    },
    [onError, currentVideoId, handleEnd]
  );

  try {
    const playlistVideos = playlist
      .filter((item) => item.xfdUrl)
      .map((item) => (item.xfdUrl ?? "").replace("https://youtu.be/", ""));

    return (
      <div
        id="PlayerContainer"
        className={`z-20 top-0 overflow-hidden transition-all ease-in-out duration-200 delay-300 origin-top-right ${
          isShrinked
            ? "fixed w-52 top-1 right-1 -translate-x-1 rounded-lg"
            : "w-full top-0 right-0 left-full translate-x-0 rounded-none"
        }`}
      >
        <div className={`relative w-full sm:max-h-80`}>
          <div
            className={
              isLoaded
                ? "hidden"
                : "relative bg-black aspect-w-16 aspect-h-9 w-full"
            }
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Spinner aria-label="main video" color="failure" size="xl" />
            </div>
            <img
              className="w-full h-full object-cover object-center"
              src={`https://i.ytimg.com/vi/${
                currentVideoId
                  ? currentVideoId
                  : playlistVideos[currentPlaylistIndex]
              }/mqdefault.jpg`}
              alt="Video thumbnail"
            />
          </div>
          <YouTube
            videoId={
              currentVideoId
                ? currentVideoId
                : playlistVideos[currentPlaylistIndex]
            }
            ref={ref}
            opts={{
              ...defaultOpts,
              playerVars: {
                ...defaultOpts.playerVars,
                // playlist: playlistVideos.join(","),
                autoplay: onPlaying ? 1 : 0,
              },
            }}
            className={!isLoaded ? "invisible" : "aspect-w-16 aspect-h-9"}
            iframeClassName={`sm:max-h-80 ${isShrinked ? "" : ""}`}
            onReady={handleReady}
            onPlay={handlePlay}
            onError={handleError}
            onEnd={handleEnd}
          />
        </div>
      </div>
    );
  } catch (error) {
    alert("render: " + error?.toString());
    return null;
  }
};

export default MainVideo;
