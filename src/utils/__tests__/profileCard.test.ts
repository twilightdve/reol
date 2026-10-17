/**
 * @jest-environment node
 */
import { decodeCard, encodeCard, normalizeSnsId, sanitizePayload, CardPayload } from "../profileCard/codec";

describe("プロフィールカードの中身(plan/48)", () => {
  const card: CardPayload = {
    v: 1,
    n: "ぽち",
    s: ["ギャフンと鳴かせて", "第六感"],
    t: "FGSA",
    a: { c: 12, f: "2018.06.10 ハーメルンの大合唱", l: "2025.08.16 無題" },
    x: { x: "reol_official", bs: "name.bsky.social" },
    b: "物販列によくいます",
    e: "美辞学 東京公演",
  };

  it("文字列にして戻すと同じ中身になる(日本語を含む)", () => {
    const s = encodeCard(card);
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeCard(`#${s}`)).toEqual(card);
  });

  it("壊れた・形の違う中身は null", () => {
    expect(decodeCard("")).toBeNull();
    expect(decodeCard("#!!!")).toBeNull();
    expect(decodeCard("#" + encodeCard({ ...card, v: 2 } as unknown as CardPayload))).toBeNull();
    expect(sanitizePayload({ v: 1, n: "   " })).toBeNull();
  });

  it("長すぎる文字は切り詰め、改行や制御文字は空白にする", () => {
    const p = sanitizePayload({ v: 1, n: "あ".repeat(40), b: "一行目\n二行目\u0000" });
    expect(Array.from(p!.n)).toHaveLength(24);
    expect(p!.b).toBe("一行目 二行目");
  });

  it("SNS は ID の形を満たすものだけ残す(URL・スクリプトは入らない)", () => {
    const p = sanitizePayload({ v: 1, n: "a", x: { x: "javascript:alert(1)", ig: "ok_name", zz: "x" } });
    expect(p!.x).toEqual({ ig: "ok_name" });
  });

  it("タイプコード・参戦数は決まった形だけ", () => {
    const p = sanitizePayload({ v: 1, n: "a", t: "XXXX", a: { c: -1 } });
    expect(p!.t).toBeUndefined();
    expect(p!.a).toBeUndefined();
  });

  it("入力の SNS ID は @ や URL を取り除く", () => {
    expect(normalizeSnsId("x", "@reol_official")).toBe("reol_official");
    expect(normalizeSnsId("x", "https://x.com/reol_official?s=20")).toBe("reol_official");
    expect(normalizeSnsId("th", "https://www.threads.com/@reol_official")).toBe("reol_official");
    expect(normalizeSnsId("bs", "https://bsky.app/profile/name.bsky.social")).toBe("name.bsky.social");
    expect(normalizeSnsId("x", "not valid id!")).toBeNull();
  });
});
