import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { playMedia, stopMedia } from "../../redux/slices/playerSlice";
import { useDict } from "../../i18n/site/SiteLangContext";

/**
 * 枠を置かずに、押すと右上の小窓ですぐ流す小さいボタン(plan/60)。
 * 曲の一覧の行など、16:9 の枠を置く場所が無い所に使う。流れている間にもう一度押すと止める。
 */
type Props = {
  videoId: string;
  /** 小窓に出す題。ボタンの読み上げにも使う */
  title: string;
  /** ボタンの文字(MV など) */
  label: string;
  onStart?: () => void;
  className?: string;
};

const PlayButton: React.FC<Props> = ({ videoId, title, label, onStart, className = "" }) => {
  const dispatch = useAppDispatch();
  const dict = useDict();
  const slotId = `button|${videoId}`;
  // 同じ動画の枠のあるページでは枠の方に重なる(adoptSlot)ので、枠ではなく動画で見る
  const playing = useAppSelector((state) => state.player.current?.videoId === videoId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (playing) {
          dispatch(stopMedia());
          return;
        }
        onStart?.();
        dispatch(playMedia({ videoId, title, slotId }));
      }}
      aria-pressed={playing}
      aria-label={`${playing ? dict.video.close : dict.video.play}: ${title}`}
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold transition-colors ${
        playing
          ? "border-bx-yellow bg-bx-yellow text-bx-bg"
          : "border-bx-line text-bx-ink2 hover:border-bx-yellow hover:text-bx-yellow"
      } ${className}`}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
          <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
          <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
        </svg>
      )}
      {label}
    </button>
  );
};

export default PlayButton;
