import { useEffect } from "react";

/**
 * location.hash で指定された要素が描画され次第スクロールしてハイライトする。
 * 独立ページ化したセクション (/live/, /discography/, /place/) でディープリンク
 * (#live-N, #live-item-N-M, #disc-N, #place-N) を受けるために使う。
 *
 * 子要素 (例: Discography/Live/Place の各カード) が非同期に描画されることを
 * 想定して、最大 30 回 (= 約 6 秒) のリトライで要素出現を待つ。
 */
export const useDeepLinkScroll = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.location.hash.replace("#", "");
    if (!raw) return;

    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(raw);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-amber-400", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-amber-400", "ring-offset-2");
        }, 2500);
      } else if (attempt < 30) {
        setTimeout(() => tryScroll(attempt + 1), 200);
      }
    };
    setTimeout(() => tryScroll(), 300);
  }, []);
};
