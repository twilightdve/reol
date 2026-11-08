import { bodyLength, fromEditorJson, isValidBody, stripInvisible, toEditorJson, trimBody } from "../letters/body";
import { MOTIF_IDS, MOTIFS } from "../letters/constants";
import { buildAddress, buildLetterEvents, composeAddress, eraOfName, parseAddress, splitAddress } from "../letters/timeline";

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
      { type: "paragraph", attrs: { textAlign: "right" }, content: [{ type: "text", text: "より" }] },
      { type: "heading", content: [{ type: "text", text: "見出しは通さない" }] },
      { type: "paragraph" },
    ],
  };

  test("エディターの JSON から、許した装飾だけを取り出す", () => {
    const body = fromEditorJson(doc);
    expect(body).toEqual([
      { r: [{ t: "お誕生日おめでとう", b: true }] },
      { a: "c", r: [{ t: "ずっと", c: "rose", s: "l" }, { t: "\n聴いています" }] },
      { a: "r", r: [{ t: "より" }] },
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
    expect(isValidBody([{ a: "r", r: [{ t: "a" }] }])).toBe(true);
    expect(isValidBody([{ a: "j", r: [{ t: "a" }] }] as never)).toBe(false);
    expect(isValidBody([{ r: [{ t: "あ".repeat(1201) }] }])).toBe(false);
    expect(isValidBody([{ r: [{ t: "あ".repeat(1200) }] }])).toBe(true);
    expect(bodyLength([{ r: [{ t: "ab" }, { t: "c" }] }, { r: [{ t: "d" }] }])).toBe(4);
  });
});

describe("宛先の年表(plan/64)", () => {
  test("名義から宛名を作る(時代の名義以外は当てはめない)", () => {
    expect(eraOfName("れをる")).toBe("reoru");
    expect(eraOfName("REOL")).toBe("unit");
    expect(eraOfName("Reol")).toBe("reol");
    expect(eraOfName("あにょすぺにょすゃゃ")).toBe("anyo");
    expect(eraOfName("FZMZ(icy)")).toBe("other");
    expect(buildAddress("No title-", "anyo")).toBe("No title-のあにょすぺにょすゃゃへ");
    expect(buildAddress("極彩色", "reoru")).toBe("極彩色のれをる氏へ");
    expect(buildAddress("エンドレスライン", "unit")).toBe("エンドレスラインのREOLへ");
    expect(buildAddress("白夜", "reol")).toBe("白夜のReolへ");
    expect(buildAddress("Danger Danger", "other")).toBe("Danger Dangerのあなたへ");
    expect(buildAddress("とても長いライヴの名前とても長いライヴの名前とても長い", "reol", "あのライヴの")).toBe("あのライヴのReolへ");
  });

  test("宛名を前につける言葉・名義・呼び方に分けて、組み直す", () => {
    expect(parseAddress("極彩色のれをる氏へ")).toEqual({ prefix: "極彩色の", name: "れをる", honorific: "氏" });
    expect(parseAddress("今のReolへ")).toEqual({ prefix: "今の", name: "Reol", honorific: "" });
    expect(parseAddress("Reolさんへ")).toEqual({ prefix: "", name: "Reol", honorific: "さん" });
    expect(parseAddress("大好きな人へ")).toBeNull();
    expect(composeAddress({ prefix: "あの頃の", name: "しぇりー", honorific: "様" })).toBe("あの頃のしぇりー様へ");
  });

  test("宛名をカードで 2 行に分ける", () => {
    expect(splitAddress("極彩色のれをる氏へ")).toEqual(["極彩色の", "れをる氏へ"]);
    expect(splitAddress("白夜のReolへ")).toEqual(["白夜の", "Reolへ"]);
    expect(splitAddress("Reolさんへ")).toEqual(["Reolさんへ"]);
    expect(splitAddress("あの頃のしぇりーへ")).toEqual(["あの頃の", "しぇりーへ"]);
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

  test("曲は時代ごとに、いちばん早く出た 1 つにまとめる。時代の名義以外は近い日付の れをる / REOL / Reol へ", () => {
    const events = buildLetterEvents(
      [
        { discographyUuid: "a", slug: "a", title: "極彩色", releaseDate: "2015-07-29", name: "れをる", format: "fullAL", songs: [{ songUuid: "s-a1", songName: "ハーメルン" }, { songUuid: "s-a2", songName: "極彩色" }] },
        { discographyUuid: "b", slug: "b", title: "ハーメルン", releaseDate: "2015-05-01", name: "れをる", format: "SG", songs: [{ songUuid: "s-b1", songName: "ハーメルン" }] },
        { discographyUuid: "c", slug: "c", title: "ゆめ", releaseDate: "2015-06-01", name: "FZMZ(icy)", format: "SG", songs: [{ songUuid: "s-c1", songName: "ゆめ" }] },
        { discographyUuid: "f", slug: "f", title: "No title-", releaseDate: "2015-06-02", name: "あにょすぺにょすゃゃ", format: "fullAL", songs: [{ songUuid: "s-f1", songName: "ないものねだり" }] },
        { discographyUuid: "d", slug: "d", title: "歌", releaseDate: "2014-01-01", name: "れをる", format: "歌ってみた", songs: [{ songUuid: "s-d1", songName: "歌" }] },
        { discographyUuid: "e", slug: "e", title: "金字塔", releaseDate: "2020-01-01", name: "Reol", format: "fullAL", songs: [{ songUuid: "s-e1", songName: "ハーメルン" }] },
      ],
      []
    );
    const songs = events.filter((e) => e.kind === "song");
    expect(songs.map((e) => e.key).sort()).toEqual(["song:s-a2", "song:s-b1", "song:s-c1", "song:s-e1", "song:s-f1"]);
    expect(songs.find((e) => e.key === "song:s-f1")!.era).toBe("anyo");
    const hameln = songs.find((e) => e.key === "song:s-b1")!;
    expect(hameln.defaultAddress).toBe("ハーメルンのれをる氏へ");
    expect(hameln.sub).toBe("シングル");
    expect(songs.find((e) => e.key === "song:s-a2")!.sub).toBe("フルアルバム");
    expect(songs.find((e) => e.key === "song:s-e1")!.defaultAddress).toBe("ハーメルンのReolへ");
    const other = events.find((e) => e.key === "song:s-c1")!;
    expect(other.era).toBe("reoru");
    expect(other.defaultAddress).toBe("ゆめのれをる氏へ");
    expect(events.some((e) => e.key === "song:s-d1")).toBe(false);
  });
});

describe("カードの絵柄(plan/64)", () => {
  test("画面の絵柄と DB が受け付ける絵柄が同じ", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sql: string = require("fs").readFileSync(require("path").join(__dirname, "../../../supabase/features/supabase-birthday-letters.sql"), "utf8");
    const m = sql.match(/v_motif NOT IN \(([^)]*)\)/);
    const inDb = (m?.[1] ?? "").split(",").map((x) => x.trim().replace(/'/g, ""));
    expect(inDb).toEqual([...MOTIF_IDS]);
    expect(MOTIFS.map((x) => x.id)).toEqual([...MOTIF_IDS]);
  });
});

describe("この一年の宛先(plan/64)", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { YEAR_EVENTS, YEAR_ERA_EVENT, shortTitle } = require("../letters/yearEvents");
  test("キーは DB の決まりに合い、重ならず、日付は期間の中", () => {
    const all = [YEAR_ERA_EVENT, ...YEAR_EVENTS];
    for (const e of all) expect(e.key).toMatch(/^(song|release|live|era):[A-Za-z0-9-]{1,64}$/);
    expect(new Set(all.map((e: { key: string }) => e.key)).size).toBe(all.length);
    for (const e of YEAR_EVENTS) {
      expect(e.date >= "2025-11-09" && e.date <= "2026-11-08").toBe(true);
      expect(e.era).toBe("reol");
      expect(e.defaultAddress.length).toBeLessThanOrEqual(30);
    }
    expect(YEAR_EVENTS.filter((e: { tab: string }) => e.tab === "live")).toHaveLength(29);
    expect(YEAR_EVENTS.filter((e: { tab: string }) => e.tab === "release")).toHaveLength(5);
    expect(YEAR_EVENTS.filter((e: { tab: string }) => e.tab === "mv")).toHaveLength(3);
  });
  test("宛名は短い名前から", () => {
    expect(shortTitle("美辞学 (Rhetoric)")).toBe("美辞学");
    expect(shortTitle("天井の街 - CEILING YOU")).toBe("天井の街");
    expect(shortTitle("DEAD CENTER feat. LiSA")).toBe("DEAD CENTER");
    const live = YEAR_EVENTS.find((e: { key: string }) => e.key === "live:live-20260314");
    expect(live.defaultAddress).toBe("宇都宮のReolへ");
  });
});
