/**
 * /songs/sorter/ 用の、真のシングルエリミネーション方式トーナメント。
 * MusicCup(https://musiccup.app/)のようなブラケット共有カードを描くには、
 * 「誰が誰と当たり、誰が勝ち上がったか」という実際の対戦ノードが必要になる。
 * ボトムアップ・マージソート(旧実装)は全曲の完全順位を出せる代わりに
 * 対称な対戦組み合わせを持たないため、この用途には使えない。
 *
 * 左右2ブロックに分けて別々に勝ち上がらせ、両ブロックの優勝者同士を決勝で
 * 当てる標準的な観戦・共有向けブラケット構成(1回戦 → … → 準決勝 → 決勝)。
 * 2の冪でない人数は、実曲を左右に交互配分してからそれぞれ2の冪へ切り上げ、
 * 各サイドの対戦の先頭側から1枠ずつbye(不戦勝)を割り当てる
 * (1対戦に2枠ともbyeが重ならないよう、サイドごとのbye数は対戦数を超えない)。
 *
 * 1回の対戦ごとに一時停止し、UI側の選択を受け取ってから再開する(choose())。
 */
export type BracketSide = "left" | "right" | "final";

export type BracketMatch<T> = {
  side: BracketSide;
  round: number; // 0始まり。final は totalRounds-1
  p1: T | null;
  p2: T | null;
  winner: T | null;
};

const bracketRoundLabel = (overallEntrants: number): string => {
  if (overallEntrants <= 2) return "決勝";
  if (overallEntrants === 4) return "準決勝";
  if (overallEntrants === 8) return "準々決勝";
  return `ベスト${overallEntrants}`;
};

export class BracketSorter<T> {
  readonly pow2: number;
  readonly half: number;
  readonly roundsInSide: number;
  readonly totalRounds: number;
  readonly leftRounds: BracketMatch<T>[][] = [];
  readonly rightRounds: BracketMatch<T>[][] = [];
  finalMatch: BracketMatch<T> | null = null;

  private roundIndex = 0;
  private sideCursor: "left" | "right" = "left";
  private matchIndex = 0;

  comparisons = 0;
  result: T | null = null;

  constructor(items: T[]) {
    const n = items.length;
    this.pow2 = n <= 1 ? 2 : 1 << Math.ceil(Math.log2(n));
    this.half = this.pow2 / 2;
    this.roundsInSide = Math.log2(this.half);
    this.totalRounds = Math.log2(this.pow2);

    // 実曲を左右に交互配分する(先頭から交互に振り分けるだけで、事前のシード付けはしない)。
    const leftReal: T[] = [];
    const rightReal: T[] = [];
    items.forEach((it, i) => (i % 2 === 0 ? leftReal : rightReal).push(it));

    this.leftRounds.push(this.buildFirstRound(leftReal, "left"));
    this.rightRounds.push(this.buildFirstRound(rightReal, "right"));

    this.settle();
  }

  private buildFirstRound(real: T[], side: "left" | "right"): BracketMatch<T>[] {
    if (this.half === 1) {
      const p1 = real[0] ?? null;
      return [{ side, round: 0, p1, p2: null, winner: p1 }];
    }
    const matchCount = this.half / 2;
    const byes = this.half - real.length; // 交互配分により常に 0 <= byes <= matchCount
    const matches: BracketMatch<T>[] = [];
    let cursor = 0;
    for (let i = 0; i < matchCount; i++) {
      const isByeMatch = i < byes;
      const p1 = real[cursor++] ?? null;
      const p2 = isByeMatch ? null : real[cursor++] ?? null;
      matches.push({
        side,
        round: 0,
        p1,
        p2,
        // 相手不在(bye)は不戦勝で即決着
        winner: p1 && !p2 ? p1 : p2 && !p1 ? p2 : null,
      });
    }
    return matches;
  }

  // 現在のラウンドを左→右の順に自動解決(bye)しつつ進め、実際の判断が
  // 必要な対戦が見つかるか、トーナメント全体が終わるまで進める。
  private settle() {
    for (;;) {
      if (this.roundIndex < this.roundsInSide) {
        const rounds = this.sideCursor === "left" ? this.leftRounds : this.rightRounds;
        const round = rounds[this.roundIndex];
        while (this.matchIndex < round.length && round[this.matchIndex].winner !== null) {
          this.matchIndex++;
        }
        if (this.matchIndex < round.length) return; // 判断待ち

        if (this.sideCursor === "left") {
          this.sideCursor = "right";
          this.matchIndex = 0;
          continue;
        }

        // 両サイドとも現ラウンド完了 → 次ラウンドへ
        this.sideCursor = "left";
        this.matchIndex = 0;
        this.roundIndex += 1;

        if (this.roundIndex < this.roundsInSide) {
          for (const side of ["left", "right"] as const) {
            const sr = side === "left" ? this.leftRounds : this.rightRounds;
            const prev = sr[this.roundIndex - 1];
            const winners = prev.map((m) => m.winner as T);
            const nextRound: BracketMatch<T>[] = [];
            for (let i = 0; i < winners.length; i += 2) {
              nextRound.push({
                side,
                round: this.roundIndex,
                p1: winners[i],
                p2: winners[i + 1],
                winner: null,
              });
            }
            sr.push(nextRound);
          }
        }
        continue;
      }

      // 両サイドの優勝者が確定している(roundsInSide===0 の初期状態も含む) → 決勝
      if (!this.finalMatch) {
        const leftChamp = this.leftRounds[this.leftRounds.length - 1][0].winner;
        const rightChamp = this.rightRounds[this.rightRounds.length - 1][0].winner;
        this.finalMatch = {
          side: "final",
          round: this.totalRounds - 1,
          p1: leftChamp,
          p2: rightChamp,
          winner: leftChamp && !rightChamp ? leftChamp : rightChamp && !leftChamp ? rightChamp : null,
        };
        continue;
      }

      if (!this.finalMatch.winner) return; // 判断待ち
      this.result = this.finalMatch.winner;
      return;
    }
  }

  isDone(): boolean {
    return this.result !== null;
  }

  getCurrentMatch(): [T, T] | null {
    if (this.roundIndex < this.roundsInSide) {
      const rounds = this.sideCursor === "left" ? this.leftRounds : this.rightRounds;
      const m = rounds[this.roundIndex]?.[this.matchIndex];
      if (!m || !m.p1 || !m.p2 || m.winner) return null;
      return [m.p1, m.p2];
    }
    if (this.finalMatch && !this.finalMatch.winner && this.finalMatch.p1 && this.finalMatch.p2) {
      return [this.finalMatch.p1, this.finalMatch.p2];
    }
    return null;
  }

  /** pickFirst=true なら getCurrentMatch()の[0]を勝者として採用 */
  choose(pickFirst: boolean) {
    const pair = this.getCurrentMatch();
    if (!pair) return;
    this.comparisons += 1;
    if (this.roundIndex < this.roundsInSide) {
      const rounds = this.sideCursor === "left" ? this.leftRounds : this.rightRounds;
      const m = rounds[this.roundIndex][this.matchIndex];
      m.winner = pickFirst ? m.p1 : m.p2;
    } else if (this.finalMatch) {
      this.finalMatch.winner = pickFirst ? this.finalMatch.p1 : this.finalMatch.p2;
    }
    this.settle();
  }

  /** 実際にユーザーの判断が必要な対戦の総数(bye分は含まない) */
  totalDecisions(): number {
    if (this.roundsInSide === 0) {
      // pow2===2 の退化ケース(1回戦=決勝そのもの): 対戦は決勝1回のみ
      return this.leftRounds[0][0].p1 && this.rightRounds[0][0].p1 ? 1 : 0;
    }
    let byes = 0;
    for (const m of this.leftRounds[0]) if (!m.p1 || !m.p2) byes++;
    for (const m of this.rightRounds[0]) if (!m.p1 || !m.p2) byes++;
    return this.pow2 - 1 - byes;
  }

  /** 1始まりの現在ラウンド番号(投票画面の "ROUND n / 総数" 表示用) */
  currentRoundNumber(): number {
    return Math.min(this.roundIndex + 1, this.totalRounds);
  }

  /** 現在のラウンドに残っている枠数(決勝=2)。表示言語ごとのラウンド名の組み立てに使う */
  currentRoundEntrants(): number {
    if (this.roundIndex >= this.roundsInSide) return 2;
    return this.pow2 / 2 ** this.roundIndex;
  }

  /** 現在のラウンド名(1回戦/準々決勝/準決勝/決勝など) */
  currentRoundLabel(): string {
    return bracketRoundLabel(this.currentRoundEntrants());
  }
}

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
