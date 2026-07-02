/**
 * アナリティクスへ任意イベントを送信する薄いラッパー。
 * gatsby-plugin-google-gtag が global に gtag を生やしている前提で、
 * 未ロード時や SSR 時には何もしない（プライバシー配慮 / 落ちないこと優先）。
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface EventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

export function trackEvent(action: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", action, {
        event_category: params.category,
        event_label: params.label,
        value: params.value,
        ...params,
      });
    }
  } catch (_) {
    // 計測失敗はサイレント
  }
}

/** セクション切り替え用ヘルパー */
export const trackSectionView = (section: string): void =>
  trackEvent("section_view", { category: "navigation", label: section });

/** フィルタ操作用ヘルパー */
export const trackFilterChange = (
  section: string,
  filterKey: string,
  value: string
): void =>
  trackEvent("filter_change", {
    category: section,
    label: `${filterKey}:${value}`,
  });

/**
 * 公式サイト・公式SNS等への送客クリック用ヘルパー。
 * サイトの最重要指標(公式への送客)を計測する。
 */
export const trackOfficialLinkClick = (linkType: string): void =>
  trackEvent("official_link_click", {
    category: "outbound",
    label: linkType,
    link_type: linkType,
  });
