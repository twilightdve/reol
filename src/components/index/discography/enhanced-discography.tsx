// discography.tsx / enhanced-timeline-item.tsx で使う共有テーマ定数。
// 以前ここにあった年グループ化のデモ用コンポーネント(EnhancedDiscography)は
// /dynamic-color-demo/ ページ専用で本番導線には未使用だったため削除し、
// 年ヘッダー機能自体は discography.tsx に実装した。

// Timeline Content テーマ
export const timelineContentTheme = {
  root: {
    base: "mt-0 sm:pr-4",
  },
  body: "mb-2 text-sm font-normal text-bx-ink2",
  time: "mb-1 text-xs font-normal leading-none text-bx-ink3",
  title: "text-base font-semibold text-bx-ink",
};

// Timeline Point テーマ（アイコンと線を非表示）
export const timelinePointTheme = {
  horizontal: "hidden",
  line: "hidden",
  marker: {
    base: {
      horizontal: "hidden",
      vertical: "hidden",
    },
    icon: {
      base: "hidden",
      wrapper: "hidden",
    },
  },
  vertical: "hidden",
};

// Timeline Item テーマ
export const timelineItemTheme = {
  root: {
    horizontal: "relative mb-16",
    vertical: "mb-16 ml-6",
  },
  content: timelineContentTheme,
  point: timelinePointTheme,
};

