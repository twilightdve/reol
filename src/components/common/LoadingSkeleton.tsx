import React from "react";

interface LoadingSkeletonProps {
  /** スケルトン行の数 */
  rows?: number;
  /** 各行の高さ調整用 Tailwind クラス */
  rowHeightClassName?: string;
  /** 行間のギャップ調整用 Tailwind クラス */
  gapClassName?: string;
  /** 行の背景/枠線調整用 Tailwind クラス（ダークテーマ等で上書き） */
  rowClassName?: string;
  /** スクリーンリーダー向けの読み上げラベル */
  label?: string;
}

/**
 * リスト/カードなど複数行のコンテンツを遅延読み込みする際に表示する共通プレースホルダー。
 * 単一ボックス＋スピナーが欲しい場合は SectionSkeleton を使う。
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  rowHeightClassName = "h-16",
  gapClassName = "space-y-2",
  rowClassName = "border border-gray-200 bg-white/70",
  label = "読み込み中...",
}) => {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={gapClassName}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`rounded-lg ${rowClassName} ${rowHeightClassName} animate-pulse motion-reduce:animate-none`}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSkeleton;
