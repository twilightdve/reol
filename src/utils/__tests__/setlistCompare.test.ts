import { compareSetlists, type SetlistSongInput } from "../setlistCompare";

const song = (name: string, uuid: string | null = null, type: string | null = null): SetlistSongInput => ({
  liveItemSongUuid: `${name}-${Math.random()}`,
  liveItemSongName: name,
  songUuid: uuid,
  type,
});

describe("compareSetlists", () => {
  it("共通曲・片方だけの曲・曲順の変化を集計する", () => {
    const a = [song("A", "a"), song("B", "b"), song("C", "c")];
    const b = [song("B", "b"), song("A", "a"), song("D", "d")];
    const { summary, songs } = compareSetlists(a, b);
    expect(summary.commonCount).toBe(2);
    expect(summary.onlyACount).toBe(1);
    expect(summary.onlyBCount).toBe(1);
    expect(summary.jaccardSimilarity).toBeCloseTo(2 / 4);
    const songA = songs.find((s) => s.songUuid === "a");
    expect(songA?.status).toBe("common");
    expect(songA?.positionDiff).toBe(1);
  });

  it("MC などの segment と空欄は比較対象にしない", () => {
    const a = [song("A", "a"), song("MC", null, "segment"), song("", null)];
    const b = [song("A", "a")];
    const { summary } = compareSetlists(a, b);
    expect(summary.aCount).toBe(1);
    expect(summary.jaccardSimilarity).toBe(1);
  });
});
