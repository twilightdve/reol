// Reolファン16タイプ診断の翻訳データの型(plan/28 第3弾)
export type QuizTypeTranslation = {
  name: string;
  summary: string;
  sections: { title: string; body: string }[];
};

type AxisText = { left: string; right: string; name: string };
export type QuizAxisTranslation = { FB: AxisText; GE: AxisText; SQ: AxisText; AI: AxisText };
