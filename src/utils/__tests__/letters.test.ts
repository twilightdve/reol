import { bodyLength, fromEditorJson, isValidBody, stripInvisible, toEditorJson, trimBody } from "../letters/body";
import { buildAddress, buildLetterEvents, eraOfName, splitAddress } from "../letters/timeline";

describe("手紙の本文(plan/64)", () => {
  const doc = {
    type: "doc",
    content: [
      { type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "お誕生日", marks: [{ type: "bold" }] }, { type: "text", text: "おめでとう", marks: [{ type: "bold" }] }] },
      {
        type: "paragraph",
        attrs: { textAlign: "center" },
        content: [
          { type: "text", text: "ずっと", marks: [{ type: "letterColor", attrs: { color: "rose" } }, { type: "letterSize", attrs: { size: "l" } }] },
          { type: "hardBreak" },
          { type: "text", text: "聴いています", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }, { type: "letterColor", attrs: { color: "red" } }] },
        ],
      },
      { type: "heading", content: [{ type: "text", text: "見出しは通さない" }] },
      { type: "paragraph" },
    ],
  };

  test("エディターの JSON から、許した装飾だけを取り出す", () => {
    const body = fromEditorJson(doc);
    expect(body).toEqual([
      { r: [{ t: "お誕生日おめでとう", b: true }] },
      { a: "c", r: [{ t: "ずっと", c: "rose", s: "l" }, { t: "\n聴いています" }] },
      { r: [] },
    ]);
    expect(isValidBody(trimBody(body))).toBe(true);
  });

  test("往復しても変わらない", () => {
    const body = trimBody(fromEditorJson(doc));
    expect(trimBody(fromEditorJson(toEditorJson(body)))).toEqual(body);
  });

  test("見えない文字・向きを変える文字は落とす(絵文字のゼロ幅接合子は残す)", () => {
    const body = fromEditorJson({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Re\u202Eol\u200B👨\u200D👩\uFEFF" }] }] });
    expect(body[0].r[0].t).toBe("Reol👨\u200D👩");
    expect(isValidBody([{ r: [{ t: "a\u2066b" }] }])).toBe(false);
    expect(stripInvisible("\u00ADれをる\u200F")).toBe("れをる");
  });

  test("貼り付けの制御文字は落とし、タブは空白に", () => {
    const body = fromEditorJson({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "a\tb\u0007c" }] }] });
    expect(body[0].r[0].t).toBe("a bc");
  });

  test("DB と同じ決まりで不正な本文をはじく", () => {
    expect(isValidBody([{ r: [{ t: "   " }] }])).toBe(false);
    expect(isValidBody([{ r: [{ t: "a", c: "red" }] }])).toBe(false);
    expect(isValidBody([{ r: [{ t: "a", x: 1 }] }])).toBe(false);
    expect(isValidBody([{ a: "r", r: [{ t: "a" }] }])).toBe(false);
    expect(isValidBody([{ r: [{ t: "あ".repeat(1201) }] }])).toBe(false);
    expect(isValidBody([{ r: [{ t: "あ".repeat(1200) }] }])).toBe(true);
    expect(bodyLength([{ r: [{ t: "ab" }, { t: "c" }] }, { r: [{ t: "d" }] }])).toBe(4);
  });
});

describe("宛先の年表(plan/64)", () => {
  test("名義から宛名を作る(3 つの名義以外は当てはめない)", () => {
    expect(eraOfName("れをる")).toBe("reoru");
    expect(eraOfName("REOL")).toBe("unit");
    expect(eraOfName("Reol")).toBe("reol");
    expect(eraOfName("あにょすぺにょすゃゃ")).toBe("other");
    expect(buildAddress("極彩色", "reoru")).toBe("極彩色のれをる様へ");
    expect(buildAddress("エンドレスライン", "unit")).toBe("エンドレスラインのREOLへ");
    expect(buildAddress("白夜", "reol")).toBe("白夜のReolへ");
    expect(buildAddress("No title-", "other")).toBe("No title-のあなたへ");
    expect(buildAddress("とても長いライヴの名前とても長いライヴの名前とても長い", "reol", "あのライヴの")).toBe("あのライヴのReolへ");
  });

  test("宛名をカードで 2 行に分ける", () => {
    expect(splitAddress("極彩色のれをる様へ")).toEqual(["極彩色の", "れをる様へ"]);
    expect(splitAddress("白夜のReolへ")).toEqual(["白夜の", "Reolへ"]);
    expect(splitAddress("Reolさんへ")).toEqual(["Reolさんへ"]);
  });

  test("作品とライヴを新しい順に並べ、締切後の出来事は入れない", () => {
    const events = buildLetterEvents(
      [
        { discographyUuid: "a", slug: "gokusaishiki", title: "極彩色", releaseDate: "2015-07-29", name: "れをる", format: "fullAL", songs: [{ songName: "ハーメルン" }] },
        { discographyUuid: "b", slug: "x", title: "歌", releaseDate: "2013-01-25", name: "れをる", format: "歌ってみた", songs: [] },
        { discographyUuid: "c", slug: "y", title: "未来", releaseDate: "2027-01-01", name: "Reol", format: "SG", songs: [] },
      ],
      [{ liveUuid: "l", title: "極彩色HighFidelity", name: "れをる", date: "2015-10-23〜2016-01-09", type: "oneman", items: [{ slug: "s1", date: "2015-10-23", place: "A" }, { slug: "s2", date: "2016-01-09", place: "B" }] }]
    );
    expect(events.map((e) => e.key)).toEqual(["live:l", "release:a", "release:b"]);
    expect(events[1].sub).toBe("れをる / フルアルバム");
    expect(events[1].searchText).toContain("ハーメルン");
    expect(events[2].kind).toBe("cover");
    expect(events[0].sub).toBe("れをる / ワンマンライヴ / 2公演");
    expect(events[0].href).toBe("/live/s1/");
  });

  test("曲は時代ごとに、いちばん早く出た 1 つにまとめる。3 つの名義以外は近い日付の時代へ", () => {
    const events = buildLetterEvents(
      [
        { discographyUuid: "a", slug: "a", title: "極彩色", releaseDate: "2015-07-29", name: "れをる", format: "fullAL", songs: [{ songUuid: "s-a1", songName: "ハーメルン" }, { songUuid: "s-a2", songName: "極彩色" }] },
        { discographyUuid: "b", slug: "b", title: "ハーメルン", releaseDate: "2015-05-01", name: "れをる", format: "SG", songs: [{ songUuid: "s-b1", songName: "ハーメルン" }] },
        { discographyUuid: "c", slug: "c", title: "ゆめ", releaseDate: "2015-06-01", name: "あにょすぺにょすゃゃ", format: "SG", songs: [{ songUuid: "s-c1", songName: "ゆめ" }] },
        { discographyUuid: "d", slug: "d", title: "歌", releaseDate: "2014-01-01", name: "れをる", format: "歌ってみた", songs: [{ songUuid: "s-d1", songName: "歌" }] },
        { discographyUuid: "e", slug: "e", title: "金字塔", releaseDate: "2020-01-01", name: "Reol", format: "fullAL", songs: [{ songUuid: "s-e1", songName: "ハーメルン" }] },
      ],
      []
    );
    const songs = events.filter((e) => e.kind === "song");
    expect(songs.map((e) => e.key).sort()).toEqual(["song:s-a2", "song:s-b1", "song:s-c1", "song:s-e1"]);
    const hameln = songs.find((e) => e.key === "song:s-b1")!;
    expect(hameln.defaultAddress).toBe("ハーメルンのれをる様へ");
    expect(hameln.sub).toBe("シングル");
    expect(songs.find((e) => e.key === "song:s-a2")!.sub).toBe("フルアルバム");
    expect(songs.find((e) => e.key === "song:s-e1")!.defaultAddress).toBe("ハーメルンのReolへ");
    const other = events.find((e) => e.key === "song:s-c1")!;
    expect(other.era).toBe("reoru");
    expect(other.defaultAddress).toBe("ゆめのれをる様へ");
    expect(events.some((e) => e.key === "song:s-d1")).toBe(false);
  });
});
