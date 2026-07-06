import React, { useEffect, useRef, useState } from "react";

/**
 * design-preview/b.tsx の CountUp を移植。ビルド時に焼き込んだ実データの
 * 最終値をカウントアップ表示する。SSR/初期表示は最終値そのもの(レイアウトシフト防止)。
 * prefers-reduced-motion 環境ではアニメーションをスキップし、即値表示のままにする。
 */
interface StatCounterProps {
  value: number;
}

const StatCounter: React.FC<StatCounterProps> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    setDisplay(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

export default StatCounter;
