import React from "react";

interface EmptyStateProps {
  /** 主要メッセージ */
  title?: string;
  /** 補足説明 */
  description?: string;
  /** 「条件をクリア」など、回復行動を促すボタンのラベル */
  actionLabel?: string;
  /** ボタンクリック時のハンドラ */
  onAction?: () => void;
  /** 装飾用の絵文字 / アイコン (省略可) */
  icon?: React.ReactNode;
  /** 配置先テーマに合わせた色調（ErrorRetry と同様） */
  tone?: "light" | "dark";
}

/**
 * 検索結果0件 / マーカー0件などの空状態に表示する共通コンポーネント。
 * やさしい一言＋回復アクションを提示する。
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = "該当する情報が見つかりませんでした",
  description = "条件を緩めるか、別のキーワードでお試しください。",
  actionLabel,
  onAction,
  icon = "🔎",
  tone = "light",
}) => {
  const containerClass =
    tone === "light"
      ? "border-gray-200 bg-bx-surface/60 backdrop-blur"
      : "border-bx-line bg-bx-surface/5";
  const titleClass = tone === "light" ? "text-gray-800" : "text-bx-ink";
  const descriptionClass = tone === "light" ? "text-gray-700" : "text-bx-ink3";
  const buttonClass =
    tone === "light"
      ? "bg-theme text-white focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      : "bg-bx-yellow text-bx-bg focus-visible:ring-bx-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-bx-bg";

  return (
    <div
      role="status"
      className={`rounded-lg border ${containerClass} py-8 px-4 text-center`}
    >
      <div className="text-3xl mb-2" aria-hidden="true">
        {icon}
      </div>
      <p className={`text-sm font-bold ${titleClass}`}>{title}</p>
      {description && (
        <p className={`mt-1 text-xs ${descriptionClass} leading-relaxed`}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-3 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full text-xs font-bold ${buttonClass} hover:opacity-90 active:opacity-75 focus:outline-none focus-visible:ring-2 transition-opacity motion-reduce:transition-none`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
