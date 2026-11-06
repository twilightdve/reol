import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import YouTube from "react-youtube";
import type { Options } from "youtube-player/dist/types";
import { IoClose } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { stopMedia } from "../../redux/slices/playerSlice";
import { useDict } from "../../i18n/site/SiteLangContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { stripLangPrefix } from "../../utils/i18nRoutes";
import UtilityService from "../../services/UtilityService";
import { getSlot, subscribeSlots } from "./slotRegistry";

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

  // 枠の上に重ねる。枠の大きさ・ページの高さが変わった時(カードの開閉など)に置き直す
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (!docked || !slotEl) {
      box.style.top = box.style.left = box.style.width = box.style.height = box.style.borderRadius = box.style.transform = "";
      return;
    }
    const place = () => {
      const r = slotEl.getBoundingClientRect();
      // 記事のデザインで枠が傾けてある時(ハルシアンの写真など)は、同じだけ傾けて重ねる。
      // 傾いた枠の getBoundingClientRect は外接する四角なので、大きさは傾ける前の幅・高さ、位置は中心で合わせる
      const angle = rotationOf(slotEl);
      const cs = angle ? getComputedStyle(slotEl) : null;
      const w = cs ? parseFloat(cs.width) : r.width;
      const h = cs ? parseFloat(cs.height) : r.height;
      box.style.top = `${r.top + r.height / 2 - h / 2 + window.scrollY}px`;
      box.style.left = `${r.left + r.width / 2 - w / 2 + window.scrollX}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      box.style.transform = angle ? `rotate(${angle}rad)` : "";
      // 枠の角丸に合わせる(記事ごとのデザインの角丸も写す)
      box.style.borderRadius = getComputedStyle(slotEl).borderRadius;
    };
    place();
    let raf = 0;
    // ふつうはスクロールしてもずれない。枠が横スクロールの中にある時などのために、スクロールでも測り直す
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(slotEl);
    ro?.observe(document.body);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [docked, slotEl]);

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

  const label = current?.videoId ?? current?.list ?? "";
  const handlePlay = useCallback(() => {
    UtilityService.gtag({ category: "youtube", action: "play", label });
  }, [label]);
  const handleEnd = useCallback(() => {
    UtilityService.gtag({ category: "youtube", action: "end", label });
  }, [label]);
  // iPhone の Safari などは、押した後に作った iframe の autoplay を音ありでは通さず、YouTube 側の再生ボタンを
  // もう一度押させる。読み込めた時点で API からも再生を指示して、押すのを1回で済ませる(lite-youtube-embed と同じ)
  const handleReady = useCallback((e: { target: { playVideo: () => void } }) => {
    e.target.playVideo();
  }, []);

  const marker = <span ref={markerRef} hidden />;
  if (!mounted || !current) return marker;

  const opts = {
    width: "100%",
    height: "100%",
    // プライバシーポリシーの記載どおり youtube-nocookie.com から読み込む
    host: "https://www.youtube-nocookie.com",
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      rel: 0,
      ...(current.start ? { start: Math.floor(current.start) } : {}),
      ...(current.list ? { listType: "playlist", list: current.list } : {}),
    },
  } as unknown as Options;

  const miniTop = isFullscreenVizPath(path) ? "top-[7.5rem]" : nearTop ? "top-[4.25rem]" : "top-2";

  const panel = (
    <div
      ref={boxRef}
      id="GlobalPlayer"
      data-mode={docked ? "docked" : "mini"}
      role="region"
      aria-label={dict.video.region}
      className={
        docked
          ? "absolute z-10 overflow-hidden bg-black"
          : `fixed right-2 ${miniTop} z-30 w-[min(46vw,20rem)] overflow-hidden rounded-lg border border-bx-line bg-bx-bg shadow-2xl shadow-black/60`
      }
    >
      <div className={docked ? "h-full w-full" : "relative w-full"} style={docked ? undefined : { aspectRatio: "16 / 9" }}>
        <YouTube
          // 別の動画を選んだ時は iframe を作り直す(押した直後に作るので、そのまま再生が始まる)。
          // 同じ動画のまま重ねる枠だけ替わった時は作り直さない(流れ続ける)
          key={`${label}|${current.start ?? 0}`}
          videoId={current.videoId}
          opts={opts}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          title={current.title}
          onReady={handleReady}
          onPlay={handlePlay}
          onEnd={handleEnd}
        />
      </div>
      {!docked && (
        <div className="flex items-center gap-1 py-1 pl-2 pr-1">
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-bx-ink2">{current.title}</span>
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
