import React, { useRef, useState, useCallback, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  setNextVideo,
  setIsLoaded,
  setIsShrinked,
  setIsPlayerHidden,
} from "../../redux/slices/playerSlice";
import { DiscographyWithSongs } from "../../types/discography";
import { Spinner } from "flowbite-react";
import { IoClose, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import UtilityService from "../../services/UtilityService";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const defaultOpts: Options = {
  height: "180",
  width: "320",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    mute: 1,
    // controls: 0,
    // disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    loop: 1,
    rel: 0,
    color: "white",
    origin: "https://reol.twilightea.com/",
    widget_referrer: "https://reol.twilightea.com/",
  } as Options["playerVars"],
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
  const { currentVideoId, isLoaded, isShrinked, isPlayerHidden, playerRef } = useAppSelector(
    (state) => state.player
  );

  const isBrowser = typeof window !== "undefined";
  const ref = useRef<YouTube>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(
    isBrowser && window.scrollY > 200
  );
  const [onPlaying, setOnPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // ユーザーが一度ミュート解除した意志を保持する。
  // playerVars.mute=1 のため videoId 切り替え時にプレイヤー側がミュートに戻るので、
  // このフラグを見て onPlay 時に再度 unMute() を呼び直す。
  const hasUserUnmutedRef = useRef(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isBrowser) return;
    // 「視覚効果を減らす」設定時はスクロール連動の拡大/縮小を無効化
    if (reducedMotion) {
      dispatch(setIsShrinked(false));
      return;
    }

    // プレイヤーが画面外に出る位置を閾値に。
    // ヒステリシス: 縮小は到達時、展開は閾値 - HYSTERESIS で行うことで往復ちらつきを防ぐ。
    const HYSTERESIS = 60;
    let threshold = 200;
    let ticking = false;
    let currentShrinked = false;

    const computeThreshold = () => {
      // プレイヤーの本来位置の bottom を閾値とする（fixed 化前のレイアウト位置）
      const el = playerWrapperRef.current;
      if (el && !currentShrinked) {
        const rect = el.getBoundingClientRect();
        // 画面上端 + ヘッダー余白(48px) を越えたら縮小したい
        threshold = Math.max(rect.bottom + window.scrollY - 48, 80);
      } else {
        // shrink 中はプレイヤー自体が fixed なので画面幅から推定
        const w = window.innerWidth;
        const estimated = Math.min((w * 9) / 16, 320);
        threshold = Math.max(estimated - 48, 80);
      }
    };

    const update = () => {
      const y = window.scrollY;
      const shouldShrink = currentShrinked
        ? y > threshold - HYSTERESIS
        : y > threshold;
      if (shouldShrink !== currentShrinked) {
        currentShrinked = shouldShrink;
        dispatch(setIsShrinked(shouldShrink));
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    const handleResize = () => {
      computeThreshold();
      handleScroll();
    };

    computeThreshold();
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isBrowser, dispatch, reducedMotion]);

  const handleClosePlayer = useCallback(() => {
    dispatch(setIsPlayerHidden(true));
  }, [dispatch]);

  const handleToggleMute = useCallback(() => {
    try {
      const player = ref.current?.internalPlayer;
      if (player) {
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
          hasUserUnmutedRef.current = true;
        } else {
          player.mute();
          setIsMuted(true);
          // ユーザーが明示的にミュートし直した場合は意志をリセット
          hasUserUnmutedRef.current = false;
        }
      }
    } catch (_) { /* ignore */ }
  }, [isMuted]);

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
        // 一度ユーザーがミュート解除していた場合、次以降の動画でも自動で解除
        if (hasUserUnmutedRef.current) {
          try {
            await event.target.unMute();
            setIsMuted(false);
          } catch (_) { /* ignore */ }
        }
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
          isShrinked && !isPlayerHidden
            ? "fixed w-52 top-1 right-1 -translate-x-1 rounded-lg"
            : "w-full top-0 right-0 left-full translate-x-0 rounded-none"
        }`}
      >
        {isShrinked && !isPlayerHidden && (
          <button
            onClick={handleClosePlayer}
            className="absolute top-1 right-1 z-30 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-all"
            aria-label="動画を非表示"
          >
            <IoClose className="text-white text-xl" />
          </button>
        )}
        {isLoaded && onPlaying && (
          <button
            onClick={handleToggleMute}
            className={`absolute z-30 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-all ${
              isShrinked && !isPlayerHidden ? "bottom-1 left-1" : "bottom-2 left-2"
            }`}
            aria-label={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? (
              <IoVolumeMute className="text-white text-lg" />
            ) : (
              <IoVolumeHigh className="text-white text-lg" />
            )}
          </button>
        )}
        <div ref={playerWrapperRef} className={`relative w-full sm:max-h-80`}>
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
