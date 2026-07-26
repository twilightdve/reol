import React, { useRef, useState, useCallback, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import "react-lazy-load-image-component/src/effects/blur.css";
// body.tsx と同様、wrapRootElement 配下(Router外)からでもルート変化を検知するため
// useLocation() ではなく globalHistory を直接購読する。
import { globalHistory } from "@gatsbyjs/reach-router";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  setNextVideo,
  setIsLoaded,
  setIsShrinked,
} from "../../redux/slices/playerSlice";
import { DiscographyWithSongs } from "../../types/discography";
import { Spinner } from "flowbite-react";
import { IoClose, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import UtilityService from "../../services/UtilityService";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// "/live/xxxx/" のような2階層目(詳細ページ)かどうかを判定する。
// 例: "/" → [] (0階層) / "/live/" → ["live"] (1階層) / "/live/xxxx/" → ["live","xxxx"] (2階層)
const isSecondLevelPath = (pathname: string): boolean => {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2;
};

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
  const { currentVideoId, isLoaded, isShrinked, playerRef } = useAppSelector(
    (state) => state.player
  );

  const isBrowser = typeof window !== "undefined";
  const ref = useRef<YouTube>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(
    isBrowser && window.scrollY > 200
  );
  const [onPlaying, setOnPlaying] = useState(false);
  // ファサード方式: タップされるまで iframe 自体を差し込まない。
  // YouTube iframeは読み込まれた時点でタイトルバー等のネイティブUIを表示するため、
  // 明示的なユーザー操作があるまで iframe を生成しないことで白い矩形の表示を防ぐ。
  const [activated, setActivated] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // ユーザーが一度ミュート解除した意志を保持する。
  // playerVars.mute=1 のため videoId 切り替え時にプレイヤー側がミュートに戻るので、
  // このフラグを見て onPlay 時に再度 unMute() を呼び直す。
  const hasUserUnmutedRef = useRef(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  // "/live/xxxx/" のような2階層目(詳細ページ)では、常に縮小表示(ミニプレイヤー)に固定する。
  const [pathname, setPathname] = useState(
    isBrowser ? window.location.pathname : ""
  );
  useEffect(() => {
    const unlisten = globalHistory.listen(({ location }: { location: { pathname: string } }) => {
      setPathname(location.pathname);
    });
    return () => unlisten();
  }, []);
  const forceMini = isSecondLevelPath(pathname);
  // 実際に「縮小表示として描画するか」。スクロール連動の縮小(isShrinked && onPlaying)
  // に加え、2階層目のページでは常にミニ表示を強制する。
  const isMini = (isShrinked && onPlaying) || forceMini;

  useEffect(() => {
    if (!isBrowser) return;
    // 「視覚効果を減らす」設定時はスクロール連動の縮小を無効化
    if (reducedMotion) {
      if (isShrinked) dispatch(setIsShrinked(false));
      return;
    }
    // 一度縮小したら、ページ遷移やスクロールでは元に戻さない(ユーザーがタップして
    // 明示的に戻すまで固定)。isShrinked が true の間はリスナー自体を張らない。
    // 2階層目のページは常にミニ表示を強制するため、この自動縮小ロジック自体が不要
    // (かつ isShrinked を実際に true にしてしまうと、他ページへ遷移した際に
    // Redux state が残って意図せずミニ表示になってしまう)。
    if (isShrinked || forceMini) return;

    // 展開した時点(このeffectが張られた時点)のスクロール位置を基準に、そこから
    // さらに一定量下にスクロールしたら縮小する。動画の本来のドキュメント位置
    // (rect.bottom)を基準にすると、タップで手動展開した直後に「その時点で既に
    // ページを深くスクロール済み」だった場合、動画は画面よりずっと上(document上)
    // にあるため rect.bottom が大きく負になり、閾値が現在のスクロール位置より
    // 小さく計算されて即座に再縮小してしまう(タップしても展開したように
    // 見えない不具合の原因)。現在のスクロール位置を基準にすることでこれを防ぐ。
    let ticking = false;
    const baseline = window.scrollY;
    const threshold = baseline + 200;

    const update = () => {
      if (window.scrollY > threshold) {
        dispatch(setIsShrinked(true));
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isBrowser, dispatch, reducedMotion, isShrinked, forceMini]);

  // 縮小表示(ミニプレイヤー)をタップすると横幅フル表示に戻す
  const handleExpand = useCallback(() => {
    dispatch(setIsShrinked(false));
  }, [dispatch]);

  // 縮小表示中、ヘッダー(h-16=64px)とまだ重なる可能性がある間はヘッダーの下に、
  // ヘッダーがスクロールで画面外に出たら本来のビューポート右上端に寄せる。
  const HEADER_HEIGHT_PX = 64;
  const [nearTop, setNearTop] = useState(
    isBrowser ? window.scrollY < HEADER_HEIGHT_PX : true
  );

  useEffect(() => {
    if (!isBrowser || !isMini) return;

    let ticking = false;
    const update = () => {
      setNearTop(window.scrollY < HEADER_HEIGHT_PX);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBrowser, isMini]);

  const handleActivate = useCallback(() => {
    setActivated(true);
    setOnPlaying(true);
  }, []);

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
        // fixed⇔static(position自体の切り替え)はCSSでは滑らかに補間できず、
        // transitionを掛けると「幅/位置だけ新状態に近づき、position:fixedのままの
        // 期間」が発生してヘッダー裏に隠れる不具合になるため、この切り替えは
        // アニメーションさせず即時反映する。
        className={`z-20 top-0 overflow-hidden origin-top-right ${
          isMini
            ? // position:fixedはビューポート基準のため、ヘッダー(h-16=4rem, z-40)が
              // まだ画面上部にある間(nearTop)はその下に、スクロールでヘッダーが
              // 画面外に出たら本来の右上端(top-1)に寄せる。
              `fixed w-[min(30vw,13rem)] ${nearTop ? "top-[4.25rem]" : "top-1"} right-1 -translate-x-1 rounded-lg`
            : "w-full top-0 right-0 left-full translate-x-0 rounded-none"
        }`}
      >
        {/* 「フル表示に戻す」導線(✕・タップ展開)は、2階層目ページの強制ミニ表示
            (forceMini)では出さない。スクロール連動で縮小した場合のみ展開できる。 */}
        {isShrinked && onPlaying && (
          <button
            onClick={handleExpand}
            className="absolute top-1 right-1 z-30 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-all"
            aria-label="動画を横幅フル表示に戻す"
          >
            <IoClose className="text-white text-xl" />
          </button>
        )}
        {isLoaded && onPlaying && (
          <button
            onClick={handleToggleMute}
            className={`absolute z-30 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-all ${
              isMini ? "bottom-1 left-1" : "bottom-2 left-2"
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
        {isShrinked && onPlaying && (
          <button
            type="button"
            onClick={handleExpand}
            aria-label="動画を横幅フル表示に戻す"
            className="absolute inset-0 z-[25] w-full h-full cursor-pointer"
          />
        )}
        <div ref={playerWrapperRef} className={`relative w-full sm:max-h-80`}>
          {!activated ? (
            <button
              type="button"
              onClick={handleActivate}
              aria-label="動画を再生"
              // aspect-w/aspect-h(paddingハック)はsm:max-h-80との併用時に
              // 実際の高さより大きい箱を作ってしまい、中央寄せの再生ボタンが
              // クリップされた可視範囲の外に落ちる。実CSSのaspect-ratioを使うことで
              // max-heightと正しく連動させる。
              className="group relative block w-full sm:max-h-80 overflow-hidden bg-black"
              style={{ aspectRatio: "16 / 9" }}
            >
              <img
                className="w-full h-full object-cover object-center"
                src={`https://i.ytimg.com/vi/${playlistVideos[currentPlaylistIndex]}/mqdefault.jpg`}
                alt="Video thumbnail"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-bx-yellow/90 group-hover:bg-bx-yellow transition-colors shadow-lg">
                  <span
                    aria-hidden
                    className="ml-1 border-y-[10px] border-y-transparent border-l-[16px] border-l-bx-bg"
                  />
                </span>
              </span>
            </button>
          ) : (
            <>
              <div
                className={
                  isLoaded
                    ? "hidden"
                    : "relative bg-black w-full sm:max-h-80 overflow-hidden"
                }
                style={isLoaded ? undefined : { aspectRatio: "16 / 9" }}
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
                    autoplay: 1,
                  },
                }}
                className={!isLoaded ? "invisible" : "aspect-w-16 aspect-h-9"}
                iframeClassName={`sm:max-h-80 ${isShrinked ? "" : ""}`}
                onReady={handleReady}
                onPlay={handlePlay}
                onError={handleError}
                onEnd={handleEnd}
              />
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    alert("render: " + error?.toString());
    return null;
  }
};

export default MainVideo;
