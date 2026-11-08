/**
 * 縦に長い手紙企画のページ(入口の年表・届いた手紙)の「上へ戻る」ボタン(plan/64)。
 * ひと画面ぶん下へ進んだら右下に出す。動きを減らす設定の時は、すぐ上へ移る。
 */
import React, { useEffect, useState } from "react";

export const ScrollTopButton: React.FC<{ className: string }> = ({ className }) => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShown(window.scrollY > window.innerHeight * 0.9);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button type="button" className={`${className}${shown ? " is-shown" : ""}`} onClick={toTop} aria-label="ページの上へ戻る" tabIndex={shown ? 0 : -1} aria-hidden={!shown}>
      <span aria-hidden>↑</span>
      <small aria-hidden>TOP</small>
    </button>
  );
};
