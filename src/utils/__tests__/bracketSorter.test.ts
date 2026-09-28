import { BracketSorter } from "../bracketSorter";

const runToEnd = (items: string[], pickFirst: (pair: [string, string]) => boolean) => {
  const sorter = new BracketSorter(items);
  let guard = 0;
  while (!sorter.isDone() && guard++ < 1000) {
    const pair = sorter.getCurrentMatch();
    if (!pair) break;
    sorter.choose(pickFirst(pair));
  }
  return sorter;
};

describe("BracketSorter", () => {
  it("ある曲を常に選べば、その曲が優勝する", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g", "h"];
    // e を含む対戦では e を、それ以外は先に出た方を選ぶ
    const sorter = runToEnd(items, ([x, y]) => (x === "e" ? true : y === "e" ? false : true));
    expect(sorter.isDone()).toBe(true);
    expect(sorter.result).toBe("e");
  });

  it("対戦数は「曲数 - 1」(2の冪でなくても bye を除いた数)", () => {
    for (const n of [2, 5, 8, 13, 16]) {
      const items = Array.from({ length: n }, (_, i) => `s${i}`);
      const sorter = runToEnd(items, () => true);
      expect(sorter.comparisons).toBe(n - 1);
      expect(sorter.totalDecisions()).toBe(n - 1);
    }
  });

  it("最後のラウンドは決勝(残り2枠)", () => {
    const sorter = new BracketSorter(["a", "b", "c", "d"]);
    expect(sorter.currentRoundEntrants()).toBe(4);
    sorter.choose(true);
    sorter.choose(true);
    expect(sorter.currentRoundEntrants()).toBe(2);
    expect(sorter.currentRoundLabel()).toBe("決勝");
  });
});
