import React from "react";
import { Link } from "gatsby";

/**
 * B案「BLACKBOX / CHRONICLE」共通のダークガラスカード。
 * border(bx-line) + 半透明の白面 + rounded-xl。hoverでborderがaccent色になる。
 * 遷移先は to(Gatsby内部) / href(通常のaタグ) のどちらか一方を渡す。
 */

export type GlassCardAccent = "blue" | "blueDeep" | "blueLight" | "yellow" | "ink";

// Tailwind の JIT はクラス名を静的に検出するため、動的な文字列結合ではなく
// 完全なクラス名をこのファイル内に列挙しておく必要がある。
const ACCENT_HOVER_BORDER: Record<GlassCardAccent, string> = {
  blue: "hover:border-bx-blue",
  blueDeep: "hover:border-bx-blueDeep",
  blueLight: "hover:border-bx-blueLight",
  yellow: "hover:border-bx-yellow",
  ink: "hover:border-bx-ink",
};

interface GlassCardProps {
  accent?: GlassCardAccent;
  to?: string;
  href?: string;
  /** href使用時のみ有効。true で target="_blank" + rel を付与(外部サイト用) */
  openInNewTab?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({
  accent,
  to,
  href,
  openInNewTab = false,
  onClick,
  className = "",
  children,
}) => {
  const baseClassName = [
    "group relative block rounded-xl border border-bx-line bg-white/[0.035] transition-colors",
    accent ? ACCENT_HOVER_BORDER[accent] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={baseClassName}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={baseClassName}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <div onClick={onClick} className={baseClassName}>
      {children}
    </div>
  );
};

export default GlassCard;
