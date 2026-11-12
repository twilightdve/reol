import React, { useEffect, useRef, useState } from "react";

interface MapEmbedProps {
  /** Google マップの埋め込み用 URL(https://www.google.com/maps/embed?pb=…) */
  src: string;
  /** iframe の題(読み上げ用)。「◯◯の地図」など */
  title: string;
  /** 枠の大きさ(高さ、または padding で作る比率)と余白 */
  className?: string;
}

// 画面からこの距離まで近づいたら地図を置き、離れたら外す
const NEAR_MARGIN = "800px 0px";

/**
 * Google マップの埋め込み。
 * - 枠の大きさは先に取っておく(地図が出ても下の内容が動かない)
 * - iframe は画面の近くにある間だけ置く。一覧に何十も並ぶページで、開いたままの地図が増え続けないようにする
 */
const MapEmbed: React.FC<MapEmbedProps> = ({ src, title, className = "h-48" }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: NEAR_MARGIN,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-map-embed={near ? "on" : "off"}
      className={`relative overflow-hidden rounded-lg border border-bx-line bg-bx-surface/5 ${className}`}
    >
      {near && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
};

export default MapEmbed;
