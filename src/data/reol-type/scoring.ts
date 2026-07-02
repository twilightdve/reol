// Reolファン16タイプ診断 — スコアリングロジック

import { questions, type Axis } from './questions';
import { reolTypes, type TypeCode, type AxisScore } from './types';

export type Answer = 'A' | 'B';
export type Answers = Record<number, Answer>;

/**
 * 回答からスコアを集計
 */
export function calculateScores(answers: Answers): AxisScore {
  const scores: AxisScore = { F: 0, B: 0, G: 0, E: 0, S: 0, Q: 0, A: 0, I: 0 };

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const axisMap: Record<Axis, [keyof AxisScore, keyof AxisScore]> = {
      FB: ['F', 'B'],
      GE: ['G', 'E'],
      SQ: ['S', 'Q'],
      AI: ['A', 'I'],
    };

    const [leftKey, rightKey] = axisMap[q.axis];
    if (answer === 'A') {
      scores[leftKey]++;
    } else {
      scores[rightKey]++;
    }
  }

  return scores;
}

/**
 * スコアから4文字のタイプコードを決定
 */
export function determineType(scores: AxisScore): TypeCode {
  const fb = scores.F >= scores.B ? 'F' : 'B';
  const ge = scores.G >= scores.E ? 'G' : 'E';
  const sq = scores.S >= scores.Q ? 'S' : 'Q';
  const ai = scores.A >= scores.I ? 'A' : 'I';
  return `${fb}${ge}${sq}${ai}` as TypeCode;
}

/**
 * 各軸のパーセンテージを計算（左側の割合を返す）
 */
export function getAxisPercentages(scores: AxisScore): {
  FB: number;  // F の割合 (0-100)
  GE: number;  // G の割合
  SQ: number;  // S の割合
  AI: number;  // A の割合
} {
  const pct = (a: number, b: number) => {
    const total = a + b;
    return total === 0 ? 50 : Math.round((a / total) * 100);
  };

  return {
    FB: pct(scores.F, scores.B),
    GE: pct(scores.G, scores.E),
    SQ: pct(scores.S, scores.Q),
    AI: pct(scores.A, scores.I),
  };
}

/**
 * 回答からタイプ情報を取得するワンストップ関数
 */
export function getResult(answers: Answers) {
  const scores = calculateScores(answers);
  const typeCode = determineType(scores);
  const typeInfo = reolTypes[typeCode];
  const percentages = getAxisPercentages(scores);

  return { scores, typeCode, typeInfo, percentages };
}
