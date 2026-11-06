import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import YouTube from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import { IoClose } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { playMedia, stopMedia } from "../../redux/slices/playerSlice";
import { useDict } from "../../i18n/site/SiteLangContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { stripLangPrefix } from "../../utils/i18nRoutes";
import UtilityService from "../../services/UtilityService";
import { getSlot, listSlots, subscribeSlots, type SlotMedia } from "./slotRegistry";

/**
 * サイト全体で1つだけの動画プレイヤー(plan/60)。MainVideo の代わり。
 * 2026-11-04 ユーザー「再生中の動画はスクロールしたり画面遷移しても右上隅で継続再生されるようにしたい」
 *
 * - Body(wrapRootElement)に置き、ページを移っても外さない。中身は document.body 直下に1回だけ portal で置く。
 * - iframe は DOM の中で動かすと読み込み直しになって止まるので、DOM の位置は変えず、CSS の position だけ切り替える:
 *   - 再生を始めた枠(PlayerSlot)が画面に見えている間は、枠の上にぴったり重ねる(absolute。ページの座標に置くので、
 *     スクロールは JS で追わなくてもずれない)。
 *   - 枠が画面の外に出た・別のページへ移った時は、右上隅の小窓(fixed)にして流し続ける。
 *   - fixed⇔absolute の切り替えにアニメーションは付けない(position は補間できず、途中の状態が見えるため)。
 * - 再生は利用者が枠を押した時だけ。音を消して自動で流すことはしない。
 * - iPhone・iPad・Mac の Safari では、押した後に作ったプレイヤーは音ありで流れず、ページ側からの再生の指示も通らない
 *   (2026-11-06 ユーザー「現状2回再生ボタン押さないといけない」)。これらでは、画面に見えている枠の上に、
 *   押す前から見えないプレイヤーを1つ用意しておき、押す指が YouTube のプレイヤーそのものに届くようにする。
 *   用意したプレイヤーは autoplay を付けず、押されるまで流さない。流れ始めたら、その枠で再生を始めたことにする。
 */

// 下の判定は body.tsx と同じ(相関図・開催地マップは自前のツールバーがあるので、小窓をその下に出す)
const isFullscreenVizPath = (path: string) =>
  path === "/cgraph" || path.startsWith("/cgraph/") || path === "/live/heatmap" || path.startsWith("/live/heatmap/");
// Relive は独自の再生室なので、二重に鳴らないよう止める
const isRelivePath = (path: string) => path === "/relive" || path.startsWith("/relive/");

// 要素とその親に掛かっている回転を足し合わせる(ラジアン)。回転していなければ 0
const rotationOf = (el: HTMLElement): number => {
  let angle = 0;
  for (let e: HTMLElement | null = el; e && e !== document.body; e = e.parentElement) {
    const t = getComputedStyle(e).transform;
    if (t && t !== "none") {
      const m = new DOMMatrixReadOnly(t);
      angle += Math.atan2(m.b, m.a);
    }
  }
  return Math.abs(angle) < 0.001 ? 0 : angle;
};

// 押す前にプレイヤーを用意しておくブラウザ。iPhone・iPad(iPadOS は Mac と名乗るので、タッチの点の数で見分ける)と
// Mac の Safari。iPhone の Chrome なども中身は Safari と同じなので、iPhone・iPad はブラウザを問わない
const needsArmedPlayer = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\/|Firefox\/|Android/.test(ua);
  return ios || safari;
};
// 用意したプレイヤーを押せる範囲。YouTube の上の帯(題・チャンネル・共有)と下の端は見えないまま押されないよう切り抜く。
// 外れた所を押すと下の枠(サムネイル)に届き、前と同じく押した後にプレイヤーを作る
const ARMED_HIT_AREA = "inset(56px 12% 44px 12%)";
// 枠がこの割合以上見えたら、その枠に用意する。用意した枠は、この半分を下回るまで替えない
const ARM_RATIO = 0.6;
type Armed = { slotId: string; el: HTMLElement; media: SlotMedia };
const mediaKey = (m: SlotMedia) => `${m.videoId ?? m.list ?? ""}|${m.start ?? 0}`;
// YouTube の PlayerState.PLAYING
const PLAYING = 1;
type YTTarget = {
  playVideo: () => unknown;
  getPlayerState: () => number | Promise<number>;
  getIframe: () => HTMLIFrameElement | Promise<HTMLIFrameElement>;
};

// ヘッダー(h-16)が画面に残っている間は、小窓をその下に出す
const HEADER_HEIGHT_PX = 64;
// 枠がこの割合以上見えている間は枠の上に重ねる
const DOCK_RATIO = 0.4;

const GlobalPlayer: React.FC<{ pathname: string }> = ({ pathname }) => {
  const dispatch = useAppDispatch();
  const dict = useDict();
  const reducedMotion = useReducedMotion();
  const current = useAppSelector((state) => state.player.current);
  const boxRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  // Gatsby は Head API の描画でも wrapRootElement(= Body)を、文書に付いていない別の div にもう一度描く。
  // そちらのプレイヤーまで document.body に出ると2つ重なるので、本体(#___gatsby の中)にいる時だけ出す
  const [mounted, setMounted] = useState(false);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  const [slotVisible, setSlotVisible] = useState(false);
  const [nearTop, setNearTop] = useState(true);
  const path = stripLangPrefix(pathname || "/").path;

  useEffect(() => setMounted(markerRef.current?.closest("#___gatsby") != null), []);

  // 押す前にプレイヤーを用意する枠(iPhone など。上の needsArmedPlayer)
  const [armEnabled, setArmEnabled] = useState(false);
  const [armed, setArmed] = useState<Armed | null>(null);
  // 押す前に作った iframe の鍵。これと同じ鍵の再生は、その iframe のまま流す(autoplay を付け直すと作り直しになるため)
  const [armedKey, setArmedKey] = useState<string | null>(null);
  // 再生を止めるたびに増やす。止めた後に用意するプレイヤーを、流れていたものとは別に作り直すため
  const [gen, setGen] = useState(0);
  const playerRef = useRef<YTTarget | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;
  useEffect(() => setArmEnabled(needsArmedPlayer()), []);

  const idle = !current;
  useEffect(() => {
    if (!mounted || !armEnabled || !idle || isRelivePath(path) || typeof IntersectionObserver === "undefined") {
      setArmed(null);
      return;
    }
    const ratios = new Map<Element, number>();
    let timer = 0;
    // 見えている割合が一番大きい枠を選ぶ。スクロールの途中で何度も作り直さないよう、少し待ってから選ぶ
    const choose = () =>
      setArmed((prev) => {
        const slots = listSlots();
        const kept = prev ? slots.find((x) => x.slotId === prev.slotId && x.el === prev.el) : undefined;
        if (kept && (ratios.get(kept.el) ?? 0) >= ARM_RATIO / 2) return prev;
        let best: Armed | null = null;
        let bestRatio = ARM_RATIO;
        for (const x of slots) {
          const r = ratios.get(x.el) ?? 0;
          if (r >= bestRatio) {
            best = x;
            bestRatio = r;
          }
        }
        if (best) return kept && best.slotId === kept.slotId ? prev : best;
        return kept ? prev : null;
      });
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(choose, 300);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
        schedule();
      },
      { threshold: [0, ARM_RATIO / 2, ARM_RATIO, 1] }
    );
    const observe = () => {
      io.disconnect();
      ratios.clear();
      listSlots().forEach((x) => io.observe(x.el));
      schedule();
    };
    observe();
    const unsubscribe = subscribeSlots(observe);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      unsubscribe();
    };
  }, [mounted, armEnabled, idle, path]);

  // 再生を止めたら、次に用意するプレイヤーは作り直す(描く前に。止めた iframe を見えないまま残さない)
  const hadCurrent = useRef(false);
  useLayoutEffect(() => {
    if (current) hadCurrent.current = true;
    else if (hadCurrent.current) {
      hadCurrent.current = false;
      setGen((g) => g + 1);
    }
  }, [current]);

  const armedMediaKey = armed ? `${mediaKey(armed.media)}|${gen}` : null;
  useEffect(() => {
    if (!current) setArmedKey(armedMediaKey);
  }, [armedMediaKey, current]);

  useEffect(() => {
    if (mounted && current && isRelivePath(path)) dispatch(stopMedia());
  }, [mounted, current, path, dispatch]);

  // 再生を始めた枠が今のページにあるか(ページを移ると枠が外れる。同じ動画の枠のあるページに戻ると、
  // その枠が adoptSlot で付き直す: PlayerSlot)
  const slotId = current?.slotId;
  useEffect(() => {
    const sync = () => setSlotEl(getSlot(slotId));
    sync();
    return subscribeSlots(sync);
  }, [slotId]);

  // 枠が画面に見えているか
  useEffect(() => {
    if (!slotEl || typeof IntersectionObserver === "undefined") {
      setSlotVisible(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setSlotVisible(e.intersectionRatio >= DOCK_RATIO), {
      threshold: [0, DOCK_RATIO, 1],
    });
    io.observe(slotEl);
    return () => io.disconnect();
  }, [slotEl]);

  const docked = !!current && !!slotEl && slotVisible;
  // 押す前に用意したプレイヤーを出すか。鍵が揃ってから出す(揃う前に出すと autoplay 付きで作ってしまう)
  const showArmed = !current && !!armed && armedKey !== null && armedKey === armedMediaKey;
  const playerKey = current ? `${mediaKey(current)}|${gen}` : showArmed ? armedKey : null;
  const fromArmed = playerKey !== null && playerKey === armedKey;
  // プレイヤーを重ねる枠
  const placeEl = docked ? slotEl : showArmed ? armed.el : null;

  // 枠の上に重ねる。枠の大きさ・ページの高さが変わった時(カードの開閉など)に置き直す
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (!placeEl) {
      box.style.top = box.style.left = box.style.width = box.style.height = box.style.borderRadius = box.style.transform = "";
      return;
    }
    const place = () => {
      const r = placeEl.getBoundingClientRect();
      // 記事のデザインで枠が傾けてある時(ハルシアンの写真など)は、同じだけ傾けて重ねる。
      // 傾いた枠の getBoundingClientRect は外接する四角なので、大きさは傾ける前の幅・高さ、位置は中心で合わせる
      const angle = rotationOf(placeEl);
      const cs = angle ? getComputedStyle(placeEl) : null;
      const w = cs ? parseFloat(cs.width) : r.width;
      const h = cs ? parseFloat(cs.height) : r.height;
      box.style.top = `${r.top + r.height / 2 - h / 2 + window.scrollY}px`;
      box.style.left = `${r.left + r.width / 2 - w / 2 + window.scrollX}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      box.style.transform = angle ? `rotate(${angle}rad)` : "";
      // 枠の角丸に合わせる(記事ごとのデザインの角丸も写す)
      box.style.borderRadius = getComputedStyle(placeEl).borderRadius;
    };
    place();
    let raf = 0;
    // ふつうはスクロールしてもずれない。枠が横スクロールの中にある時などのために、スクロールでも測り直す
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(placeEl);
    ro?.observe(document.body);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [placeEl]);

  // 小窓の時だけ、ヘッダーが画面に残っているかを見る
  useEffect(() => {
    if (!current || docked) return;
    let raf = 0;
    const update = () => setNearTop(window.scrollY < HEADER_HEIGHT_PX);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [current, docked]);

  const handleClose = useCallback(() => dispatch(stopMedia()), [dispatch]);
  const handleBack = useCallback(() => {
    slotEl?.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }, [slotEl, reducedMotion]);

  const playing = current ?? armed?.media;
  const label = playing?.videoId ?? playing?.list ?? "";
  const handlePlay = useCallback(() => {
    UtilityService.gtag({ category: "youtube", action: "play", label });
  }, [label]);
  const handleEnd = useCallback(() => {
    UtilityService.gtag({ category: "youtube", action: "end", label });
  }, [label]);
  const handleReady = useCallback((e: { target: YTTarget }) => {
    playerRef.current = e.target;
    if (currentRef.current) {
      // 押した後に作ったプレイヤーは、読み込めた時点で API からも再生を指示する(autoplay が通らないブラウザ向け)
      e.target.playVideo();
    } else {
      // 押す前に用意したプレイヤーは見えないので、Tab で入らず読み上げもしない(操作は下の枠のボタンで)
      void Promise.resolve(e.target.getIframe()).then((f) => {
        f?.setAttribute("tabindex", "-1");
        f?.setAttribute("aria-hidden", "true");
      });
    }
  }, []);
  // 用意したプレイヤーが押されて流れ始めたら、その枠で再生を始めたことにする
  const handleStateChange = useCallback(
    (e: { data: number }) => {
      if (e.data !== PLAYING || currentRef.current || !armed) return;
      setSlotEl(armed.el);
      setSlotVisible(true);
      dispatch(playMedia({ ...armed.media, slotId: armed.slotId }));
    },
    [armed, dispatch]
  );
  // 用意したプレイヤーのまま再生に移った時。見えるようにして、まだ流れていなければ(枠のボタンをキーボードで押した時など)流す
  useEffect(() => {
    const player = playerRef.current;
    if (!current || !fromArmed || !player) return;
    void Promise.resolve(player.getIframe()).then((f) => {
      f?.removeAttribute("tabindex");
      f?.removeAttribute("aria-hidden");
    });
    void Promise.resolve(player.getPlayerState()).then((state) => {
      if (state !== PLAYING) player.playVideo();
    });
  }, [current, fromArmed]);

  const marker = <span ref={markerRef} hidden />;
  const media = current ?? (showArmed ? armed.media : null);
  if (!mounted || !media || playerKey === null) return marker;

  const opts = {
    width: "100%",
    height: "100%",
    // プライバシーポリシーの記載どおり youtube-nocookie.com から読み込む
    host: "https://www.youtube-nocookie.com",
    playerVars: {
      // 押す前に用意したプレイヤーは、押されるまで流さない(流れ始めた後も同じ値のまま。変えると作り直しになる)
      autoplay: fromArmed ? 0 : 1,
      playsinline: 1,
      rel: 0,
      ...(media.start ? { start: Math.floor(media.start) } : {}),
      ...(media.list ? { listType: "playlist", list: media.list } : {}),
    },
  } as unknown as Options;

  const miniTop = isFullscreenVizPath(path) ? "top-[7.5rem]" : nearTop ? "top-[4.25rem]" : "top-2";

  const panel = (
    <div
      ref={boxRef}
      id="GlobalPlayer"
      data-mode={docked ? "docked" : showArmed ? "armed" : "mini"}
      role={showArmed ? undefined : "region"}
      aria-label={showArmed ? undefined : dict.video.region}
      aria-hidden={showArmed || undefined}
      className={
        docked
          ? "absolute z-10 overflow-hidden bg-black"
          : showArmed
          ? // 押す前に用意したプレイヤー。見えないまま枠の上に重ね、押せる範囲だけ切り抜く
            "absolute z-10 overflow-hidden opacity-0"
          : `fixed right-2 ${miniTop} z-30 w-[min(46vw,20rem)] overflow-hidden rounded-lg border border-bx-line bg-bx-bg shadow-2xl shadow-black/60`
      }
      style={showArmed ? { clipPath: ARMED_HIT_AREA } : undefined}
    >
      <div
        className={docked || showArmed ? "h-full w-full" : "relative w-full"}
        style={docked || showArmed ? undefined : { aspectRatio: "16 / 9" }}
      >
        <YouTube
          // 別の動画を選んだ時は iframe を作り直す(押した直後に作るので、そのまま再生が始まる)。
          // 同じ動画のまま重ねる枠だけ替わった時や、用意したプレイヤーが押されて流れ始めた時は作り直さない(流れ続ける)
          key={playerKey}
          videoId={media.videoId}
          opts={opts}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          title={media.title}
          onReady={handleReady}
          onStateChange={handleStateChange}
          onPlay={handlePlay}
          onEnd={handleEnd}
        />
      </div>
      {!docked && !showArmed && current && (
        <div className="flex items-center gap-1 py-1 pl-2 pr-1">
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-bx-ink2">{media.title}</span>
          {slotEl && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold text-bx-ink2 transition-colors hover:text-bx-yellow"
            >
              {dict.video.back}
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label={dict.video.close}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-bx-ink2 transition-colors hover:bg-bx-line/60 hover:text-bx-ink"
          >
            <IoClose className="text-lg" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {marker}
      {createPortal(panel, document.body)}
    </>
  );
};

export default GlobalPlayer;
