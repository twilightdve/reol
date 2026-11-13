import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { adoptSlot, playMedia } from "../../redux/slices/playerSlice";
import { useDict } from "../../i18n/site/SiteLangContext";
import { getSlot, registerSlot } from "./slotRegistry";

/**
 * ページの中の動画の枠(plan/60)。サムネイルと再生ボタンだけを持ち、押すとサイト全体で1つのプレイヤー
 * (GlobalPlayer)で流す。プレイヤーはこの枠が画面に見えている間は枠の上に重なり、外れると右上隅の小窓に移る。
 *
 * - 枠の大きさは padding で比率を作る(@tailwindcss/aspect-ratio 導入済みで aspect-video が使えないため)。
 *   再生中は 16:9 にする(縦の動画は activeRatio で縦のままにできる)。
 * - 再生前の見た目を自前で持つ所(記事の公式MV)は、下の usePlayerSlot を直接使う。
 */
export type PlayerSlotProps = {
  videoId?: string;
  /** 再生リストのID。videoId と両方ある時は videoId から始める */
  list?: string;
  start?: number;
  /** 小窓に出す題。再生ボタンの読み上げにも使う */
  title: string;
  /** 再生前のサムネイル。無ければ hqdefault */
  thumbnail?: string;
  /** thumbnail が YouTube に無かった時に代わりに出すもの(無い時も 120×90 の灰色の画像が返るので、大きさで見分ける) */
  thumbnailFallback?: string;
  /** 再生前の枠の比率(幅に対する高さ)。既定は 16:9 */
  idleRatio?: string;
  /** 再生中の枠の比率。既定は 16:9。縦の動画(9:16)を縦のまま流す時に指定する */
  activeRatio?: string;
  /** 枠に付けるクラス(角丸・枠線など) */
  className?: string;
  /** 出した時にすぐ流す(「映像を見る」を押して開く枠など、利用者が押した直後に出るもの) */
  autoStart?: boolean;
  /** 再生を始めた時(計測用) */
  onStart?: () => void;
};

const VIDEO_RATIO = "56.25%";
/** YouTube は、無いサムネイルにも幅 120 の灰色の画像を返す */
const MISSING_THUMB_WIDTH = 120;

/**
 * 要素を動画の枠として登録する。PlayerSlot の中身。自前の枠の見た目を持つ所(記事の公式MV)は、これを直接使う。
 * - 返す ref は、枠の内側いっぱいに置いた要素(`absolute inset-0 rounded-[inherit]`)に付ける。
 *   プレイヤーはその要素にぴったり重なり、角丸もその要素から写す(枠線を覆わないように、枠そのものには付けない)。
 * - active の間は枠を 16:9 にする。
 */
export const usePlayerSlot = ({
  videoId,
  list,
  start,
  title,
  autoStart = false,
  onStart,
}: Pick<PlayerSlotProps, "videoId" | "list" | "start" | "title" | "autoStart" | "onStart">) => {
  const dispatch = useAppDispatch();
  // 同じ動画が1ページに2つあっても区別できるよう、置き場所(useId)と中身の両方で決める
  const reactId = useId();
  const slotId = `${reactId}|${videoId ?? ""}|${list ?? ""}|${start ?? 0}`;
  const active = useAppSelector((state) => state.player.current?.slotId === slotId);
  const current = useAppSelector((state) => state.player.current);

  const startPlayback = useCallback(() => {
    onStart?.();
    dispatch(playMedia({ videoId, list, start, title, slotId }));
  }, [dispatch, onStart, videoId, list, start, title, slotId]);
  // 登録する start は描画のたびに替えない(onStart が描画ごとに作られても、登録し直さない)
  const startRef = useRef(startPlayback);
  startRef.current = startPlayback;

  // 再生前と再生中で付く要素が入れ替わっても登録し直せるよう、callback ref にする
  const unregister = useRef<(() => void) | null>(null);
  const ref = useCallback(
    (el: HTMLElement | null) => {
      unregister.current?.();
      unregister.current = el ? registerSlot(slotId, el, { videoId, list, start, title }, () => startRef.current()) : null;
    },
    [slotId, videoId, list, start, title]
  );

  useEffect(() => {
    if (autoStart && !active) startPlayback();
    // 出した時に1回だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 小窓で流れている動画と同じものの枠が出てきたら(元のページに戻ってきた時など)、その枠の上に戻す。
  // 元の枠がまだ画面のどこかにある間は替えない
  useEffect(() => {
    if (!current || active || getSlot(current.slotId)) return;
    if ((current.videoId ?? "") === (videoId ?? "") && (current.list ?? "") === (list ?? "") && (current.start ?? 0) === (start ?? 0)) {
      dispatch(adoptSlot(slotId));
    }
  }, [current, active, videoId, list, start, slotId, dispatch]);

  return { ref, active, start: startPlayback };
};

const PlayerSlot: React.FC<PlayerSlotProps> = ({
  videoId,
  list,
  start,
  title,
  thumbnail,
  thumbnailFallback,
  idleRatio = VIDEO_RATIO,
  activeRatio = VIDEO_RATIO,
  className = "",
  autoStart = false,
  onStart,
}) => {
  const dict = useDict();
  const { ref, active, start: handleStart } = usePlayerSlot({ videoId, list, start, title, autoStart, onStart });

  const [thumbMissing, setThumbMissing] = useState(false);
  // 画面を組み立てる前に読み終わっている時(ref)と、後から読み終わる時(onLoad)の両方で確かめる
  const checkThumb = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0 && img.naturalWidth <= MISSING_THUMB_WIDTH) setThumbMissing(true);
  }, []);
  const useFallback = thumbMissing && !!thumbnailFallback;
  const thumb = useFallback ? thumbnailFallback : thumbnail ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined);

  return (
    <div
      data-player-slot={active ? "active" : "idle"}
      className={`relative w-full overflow-hidden bg-black ${className}`}
      style={{ paddingBottom: active ? activeRatio : idleRatio, height: 0 }}
    >
      <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" />
      {active ? (
        // ふだんはプレイヤーが上に重なって見えない。小窓に移っている間だけ見える
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-white/60">
          {dict.video.playing}
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            // カードの中の枠でも、カードの開閉などに伝わらないように
            e.stopPropagation();
            handleStart();
          }}
          aria-label={`${dict.video.play}: ${title}`}
          className="group absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-bx-yellow"
        >
          {thumb && (
            <img
              ref={useFallback ? undefined : checkThumb}
              onLoad={useFallback ? undefined : (e) => checkThumb(e.currentTarget)}
              src={thumb}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bx-yellow/90 shadow-lg transition-colors group-hover:bg-bx-yellow">
              <span aria-hidden="true" className="ml-1 border-y-[10px] border-y-transparent border-l-[16px] border-l-bx-bg" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
};

export default PlayerSlot;
