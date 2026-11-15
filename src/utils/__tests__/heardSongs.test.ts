import { displaySongName, heardKeysOf, isNonSongEntry, tallyLiveSongs, type TallyLive } from "../heardSongs";

const lives: TallyLive[] = [
  {
    title: "ツアーB",
    items: [
      {
        liveItemUuid: "b1",
        slug: "b1-slug",
        date: "2025-04-18〜2025-04-20",
        setList: [
          { songUuid: "s1", liveItemSongName: "第六感", type: "song" },
          { songUuid: "s2", liveItemSongName: "宵々古今", type: "song" },
          { songUuid: null, liveItemSongName: "-MC-", type: "song" },
          { songUuid: null, liveItemSongName: "港のヨーコ・ヨコハマ・ヨコスカ", type: "cover" },
        ],
      },
    ],
  },
  {
    title: "ツアーA",
    items: [
      {
        liveItemUuid: "a1",
        slug: "a1-slug",
        date: "2023-01-10",
        setList: [
          { songUuid: "s1", liveItemSongName: "第六感 (THE SIXTH SENSE)", type: "song" },
          { songUuid: "s3", liveItemSongName: "煽げや尊し", type: "song" },
          { songUuid: null, liveItemSongName: "MC", type: "segment" },
          { songUuid: null, liveItemSongName: "-", type: null },
          { songUuid: null, liveItemSongName: "港のヨーコ ヨコハマ ヨコスカ", type: "cover" },
        ],
      },
      { liveItemUuid: "a2", slug: "a2-slug", date: "2023-01-11", setList: [] },
    ],
  },
];

describe("tallyLiveSongs", () => {
  const tally = tallyLiveSongs(lives);

  it("songUuid(無ければ正規化した曲名)で同じ曲をまとめ、演奏回数を数える", () => {
    expect(tally.songs.size).toBe(4);
    expect(tally.songs.get("song:s1")?.plays).toBe(2);
    expect(tally.songs.get("song:s1")?.songUuid).toBe("s1");
    const cover = Array.from(tally.songs.values()).find((s) => !s.songUuid);
    expect(cover?.plays).toBe(2);
  });

  it("MC・空欄・segment は曲に数えない(種別が song のままの MC も外す)", () => {
    const names = Array.from(tally.songs.values()).map((s) => s.name);
    expect(names).not.toContain("-MC-");
    expect(names).not.toContain("MC");
    expect(names).not.toContain("-");
  });

  it("最後に演奏された公演を持つ(複数日の公演は最後の日)", () => {
    expect(tally.songs.get("song:s1")?.last).toEqual({ date: "2025-04-20", itemSlug: "b1-slug", liveTitle: "ツアーB" });
    expect(tally.songs.get("song:s3")?.last).toEqual({ date: "2023-01-10", itemSlug: "a1-slug", liveTitle: "ツアーA" });
  });

  it("参戦済みの公演のセットリストの曲を「聴いた曲」にする", () => {
    const heard = heardKeysOf(["a1", "a2", "知らない公演"], tally);
    expect(heard.has("song:s1")).toBe(true);
    expect(heard.has("song:s3")).toBe(true);
    expect(heard.has("song:s2")).toBe(false);
    expect(heard.size).toBe(3);
    const unheard = Array.from(tally.songs.keys()).filter((k) => !heard.has(k));
    expect(unheard).toEqual(["song:s2"]);
  });

  it("1公演も参戦済みにしていなければ、全曲が「まだ聴いていない曲」", () => {
    expect(heardKeysOf([], tally).size).toBe(0);
  });
});

describe("isNonSongEntry", () => {
  it.each(["-MC-", "（MC）", "MC", "質問コーナー", "抽選会", "演奏者・ダンサー紹介", "悪天候のため中止", "体調不良のため出演キャンセル"])(
    "%s は曲ではない",
    (name) => expect(isNonSongEntry(name)).toBe(true)
  );

  it.each(["第六感", "MONSTER", "Introduction", "REOL MASH UP Remix TIME", "McDonald Romance"])("%s は曲", (name) =>
    expect(isNonSongEntry(name)).toBe(false)
  );
});

describe("displaySongName", () => {
  it("<br/> や改行の入った名前は最初の行だけにする", () => {
    expect(displaySongName("REOL Σ_Mushupppppコーナー<br/>\n-BWW SCREAM-<br/>\n～ちるちる")).toBe("REOL Σ_Mushupppppコーナー");
    expect(displaySongName("第六感")).toBe("第六感");
  });
});
