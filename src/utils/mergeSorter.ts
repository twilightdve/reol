/**
 * 新規コンテンツ案F「楽曲ソーター」(plan/legit-improvement-plan.md 5章)用の
 * ボトムアップ・マージソート。1回の比較ごとに一時停止し、UI側の選択を
 * 受け取ってから再開できるようにするため、クラスで手動制御する
 * (Array.sort の比較関数は同期・非同期どちらにも一時停止できないため使えない)。
 *
 * 比較で勝った方(choose(true)=左)が最終結果でより上位(先頭寄り)になる。
 */
export class MergeSorter<T> {
  private queue: T[][];
  private nextLevel: T[][] = [];
  private currentPair: [T[], T[]] | null = null;
  private li = 0;
  private ri = 0;
  private mergedBuf: T[] = [];

  comparisons = 0;
  result: T[] | null = null;

  constructor(items: T[]) {
    this.queue = items.map((it) => [it]);
    this.advanceQueue();
  }

  private advanceQueue() {
    while (!this.currentPair && !this.result) {
      if (this.queue.length === 0) {
        if (this.nextLevel.length === 1) {
          this.result = this.nextLevel[0];
          return;
        }
        this.queue = this.nextLevel;
        this.nextLevel = [];
        continue;
      }
      if (this.queue.length === 1) {
        // 奇数個で余った1本はそのまま次のレベルへ持ち越す
        this.nextLevel.push(this.queue.shift() as T[]);
        continue;
      }
      const left = this.queue.shift() as T[];
      const right = this.queue.shift() as T[];
      this.currentPair = [left, right];
      this.li = 0;
      this.ri = 0;
      this.mergedBuf = [];
      this.tryAutoResolve();
    }
  }

  private tryAutoResolve() {
    while (this.currentPair) {
      const [left, right] = this.currentPair;
      if (this.li >= left.length) {
        this.mergedBuf.push(...right.slice(this.ri));
        this.finishPair();
        return;
      }
      if (this.ri >= right.length) {
        this.mergedBuf.push(...left.slice(this.li));
        this.finishPair();
        return;
      }
      return; // 両方とも要素が残っている = 実際に比較が必要
    }
  }

  private finishPair() {
    this.nextLevel.push(this.mergedBuf);
    this.currentPair = null;
    this.advanceQueue();
  }

  isDone(): boolean {
    return this.result !== null;
  }

  /** 現在比較すべき2件。完了していればnull */
  getCurrentPair(): [T, T] | null {
    if (!this.currentPair) return null;
    const [left, right] = this.currentPair;
    return [left[this.li], right[this.ri]];
  }

  /** pickLeft=true なら左(getCurrentPairの[0])を上位として採用 */
  choose(pickLeft: boolean) {
    if (!this.currentPair || this.result) return;
    const [left, right] = this.currentPair;
    this.comparisons += 1;
    if (pickLeft) {
      this.mergedBuf.push(left[this.li]);
      this.li += 1;
    } else {
      this.mergedBuf.push(right[this.ri]);
      this.ri += 1;
    }
    this.tryAutoResolve();
    if (!this.currentPair) this.advanceQueue();
  }
}

/** n件をマージソートした場合のおおよその比較回数(n log2 n - n + 1、下限は0) */
export const estimateComparisons = (n: number): number => {
  if (n <= 1) return 0;
  return Math.max(0, Math.round(n * Math.log2(n) - n + 1));
};

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
