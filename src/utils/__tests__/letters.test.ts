import { bodyLength, fromEditorJson, isValidBody, toEditorJson, trimBody } from "../letters/body";
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
});
