import React, { useCallback, useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa6";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface BackToTopButtonProps {
  /** 表示し始めるスクロール量 (px) */
  threshold?: number;
  /** 追加クラス（位置調整など） */
  className?: string;
}

/**
 * 画面下にフローティング表示する「TOPへ戻る」ボタン。
 * - 一定スクロール以上で表示
 * - prefers-reduced-motion を尊重して smooth/auto を切替
 * - 最低 44x44px のタップ領域を確保
 */
const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  threshold = 400,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="ページの先頭へ戻る"
      className={`fixed right-3 bottom-20 z-[55] min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-bx-yellow text-bx-bg flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none hover:opacity-90 active:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-2 ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } ${className}`}
    >
      <FaChevronUp aria-hidden="true" />
    </button>
  );
};

export default BackToTopButton;
