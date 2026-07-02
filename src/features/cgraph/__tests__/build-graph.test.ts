import { buildCGraph, type DiscographyEntry } from "../build-graph";

const fixture: DiscographyEntry[] = [
  {
    discographyUuid: "disc-uuid-1",
    slug: "test-release-a",
    title: "TestRelease A",
    format: "SG",
    releaseDate: "2020-01-01",
    songs: [
      {
        songUuid: "song-uuid-11",
        slug: "song-one",
        discographyUuid: "disc-uuid-1",
        songName: "Song One",
        lyricMember: "Reol",
        musicMember: "Giga",
        produceMember: "Reol",
      },
      {
        songUuid: "song-uuid-12",
        slug: "song-two",
        discographyUuid: "disc-uuid-1",
        songName: "Song Two",
        lyricMember: "Reol",
        musicMember: "Giga",
      },
    ],
  },
  {
    discographyUuid: "disc-uuid-2",
    slug: "test-release-b",
    title: "TestRelease B",
    format: "SG",
    releaseDate: "2021-05-01",
    songs: [
      {
        songUuid: "song-uuid-21",
        slug: "song-three",
        discographyUuid: "disc-uuid-2",
        songName: "Song Three",
        lyricMember: "Reol",
        musicMember: "NeruMochi",
      },
    ],
  },
];

describe("buildCGraph", () => {
  const graph = buildCGraph({ discography: fixture });

  test("Reol アーティストノードが必ず生成される", () => {
    const reol = graph.nodes.find((n) => n.id === "artist:Reol");
    expect(reol).toBeDefined();
    expect(reol?.kind).toBe("artist");
  });

  test("各クレジット人物がアーティストノード化される", () => {
    const ids = new Set(graph.nodes.map((n) => n.id));
    expect(ids.has("artist:Giga")).toBe(true);
    expect(ids.has("artist:NeruMochi")).toBe(true);
  });

  test("buildCGraph の出力 nodes は artist のみ (集約後)", () => {
    expect(graph.nodes.every((n) => n.kind === "artist")).toBe(true);
  });

  test("Reol からの BFS 距離 (reolDistance) が付与される", () => {
    const reol = graph.nodes.find((n) => n.id === "artist:Reol")!;
    expect((reol as any).reolDistance).toBe(0);
    const giga = graph.nodes.find((n) => n.id === "artist:Giga")!;
    expect((giga as any).reolDistance).toBe(1);
  });

  test("リンクが少なくとも 1 本以上含まれる", () => {
    expect(graph.links.length).toBeGreaterThan(0);
  });

  test("同一 source/target/role の重複リンクは集約される", () => {
    const keys = new Set(
      graph.links.map(
        (l) => `${(l as any).source}|${(l as any).target}|${(l as any).role}`
      )
    );
    expect(keys.size).toBe(graph.links.length);
  });
});
