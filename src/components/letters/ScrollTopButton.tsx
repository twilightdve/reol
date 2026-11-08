/**
 * 縦に長い手紙企画のページ(入口の年表・届いた手紙)の「上へ戻る」ボタン(plan/64)。
 * ひと画面ぶん下へ進んだら右下に出す。動きを減らす設定の時は、すぐ上へ移る。
 * hideWhileVisible の要素(手紙を書くボタンのある案内など)が画面に見えている間は出さない(ボタンに重ねない)。
 */
import React, { useEffect, useState } from "react";

export const ScrollTopButton: React.FC<{ className: string; hideWhileVisible?: string }> = ({ className, hideWhileVisible }) => {
  const [scrolled, setScrolled] = useState(false);
  const [covered, setCovered] = useState(false);
  const shown = scrolled && !covered;
  useEffect(() => {
    const target = hideWhileVisible ? document.querySelector(hideWhileVisible) : null;
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => setCovered(entries.some((e) => e.isIntersecting)), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, [hideWhileVisible]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > window.innerHeight * 0.9);
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
