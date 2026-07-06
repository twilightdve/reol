import React from "react";

/**
 * B案「BLACKBOX / CHRONICLE」共通のトラッキング見出し(EXPLORE / CHRONICLE 等)。
 */
interface KickerProps {
  children: React.ReactNode;
  /** Tailwind の文字色クラス(例: "text-bx-blue")。省略時は text-bx-ink3(12px未満の弱文字用) */
  color?: string;
  className?: string;
}

const Kicker: React.FC<KickerProps> = ({
  children,
  color = "text-bx-ink3",
  className = "",
}) => (
  <p
    className={`text-[10.5px] font-extrabold tracking-[0.3em] ${color} ${className}`.trim()}
  >
    {children}
  </p>
);

export default Kicker;
