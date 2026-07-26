import React from "react";

interface SectionSkeletonProps {
  /** 表示するメッセージ（読み込み中の文言） */
  label?: string;
  /** 高さ調整用のTailwindクラス */
  heightClassName?: string;
  /** ローディングインジケータの色合い */
  tone?: "light" | "dark";
}

/**
 * セクション/コンポーネントの遅延読み込み時に表示する共通スケルトン。
 * Suspense fallback としても使えるし、空状態の代替としても使える。
 */
const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  label = "読み込み中...",
  heightClassName = "py-8",
  tone = "light",
}) => {
  const baseClass =
    tone === "light"
      ? "bg-bx-surface/60 backdrop-blur border-gray-200 text-gray-700"
      : "bg-bx-surface/5 border-bx-line text-bx-ink2";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`rounded-lg border ${baseClass} ${heightClassName} flex items-center justify-center gap-2 text-xs`}
    >
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
};

export default SectionSkeleton;
