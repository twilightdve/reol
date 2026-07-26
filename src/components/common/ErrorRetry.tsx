import React from "react";

interface ErrorRetryProps {
  /** 主要メッセージ */
  title?: string;
  /** 補足説明（エラー詳細など） */
  description?: string;
  /** 再試行ボタンのラベル */
  actionLabel?: string;
  /** 再試行ボタンクリック時のハンドラ */
  onRetry: () => void;
  /** 装飾用の絵文字 / アイコン (省略可) */
  icon?: React.ReactNode;
  /** 配置先テーマに合わせた色調（SectionSkeleton と同様） */
  tone?: "light" | "dark";
}

/**
 * データ取得失敗時に表示する共通コンポーネント。
 * EmptyState（0件表示）と対になる「回復導線つきエラー表示」を提供する。
 */
const ErrorRetry: React.FC<ErrorRetryProps> = ({
  title = "データの読み込みに失敗しました",
  description,
  actionLabel = "再試行",
  onRetry,
  icon = "⚠️",
  tone = "light",
}) => {
  const containerClass =
    tone === "light"
      ? "border-red-300 bg-bx-surface/90"
      : "border-red-500/40 bg-bx-surface/5";
  const titleClass = tone === "light" ? "text-red-700" : "text-red-300";
  const descriptionClass = tone === "light" ? "text-gray-700" : "text-gray-300";
  const buttonClass =
    tone === "light"
      ? "bg-theme text-white focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      : "bg-bx-yellow text-bx-bg focus-visible:ring-bx-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-bx-bg";

  return (
    <div
      role="alert"
      className={`rounded-lg border ${containerClass} py-6 px-4 text-center shadow-sm`}
    >
      <div className="text-3xl mb-2" aria-hidden="true">
        {icon}
      </div>
      <p className={`text-sm font-bold ${titleClass}`}>{title}</p>
      {description && (
        <p className={`mt-1 text-xs ${descriptionClass} break-all leading-relaxed`}>
          {description}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className={`mt-3 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full text-xs font-bold ${buttonClass} hover:opacity-90 active:opacity-75 focus:outline-none focus-visible:ring-2 transition-opacity motion-reduce:transition-none`}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default ErrorRetry;
