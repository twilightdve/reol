/**
 * 手紙の本文の形(plan/64)。HTML ではなく、段落 → 文字のかたまりの JSON で持つ。
 * 装飾は 太字・色(4種)・大きさ(小・大)・中央寄せ だけ。DB 側の _letters_body_ok と同じ決まり。
 * 表示・印刷は React で文字としてだけ出す(HTML として解釈しない)。
 */
import { LIMITS, TEXT_COLORS, TextColor, TextSize } from "./constants";

export type LetterRun = { t: string; b?: true; c?: TextColor; s?: TextSize };
export type LetterParagraph = { a?: "l" | "c"; r: LetterRun[] };
export type LetterBody = LetterParagraph[];

const COLOR_IDS = new Set<string>(TEXT_COLORS.map((c) => c.id));

export const emptyBody = (): LetterBody => [{ r: [] }];

export const bodyText = (body: LetterBody): string => body.map((p) => p.r.map((r) => r.t).join("")).join("\n");

export const bodyLength = (body: LetterBody): number => body.reduce((n, p) => n + p.r.reduce((m, r) => m + r.t.length, 0), 0);

export const bodyHasText = (body: LetterBody): boolean => /\S/.test(bodyText(body));

/** DB に送ってよい形か(DB 側でも同じ検査をする) */
export const isValidBody = (body: unknown): body is LetterBody => {
  if (!Array.isArray(body) || body.length < 1 || body.length > 60) return false;
  let len = 0;
  for (const p of body) {
    if (!p || typeof p !== "object" || Array.isArray(p)) return false;
    if (Object.keys(p).some((k) => k !== "a" && k !== "r")) return false;
    if ("a" in p && p.a !== "l" && p.a !== "c") return false;
    if (!Array.isArray(p.r) || p.r.length > 80) return false;
    for (const r of p.r) {
      if (!r || typeof r !== "object" || Array.isArray(r)) return false;
      if (Object.keys(r).some((k) => !["t", "b", "c", "s"].includes(k))) return false;
      if (typeof r.t !== "string" || r.t.length === 0) return false;
      // eslint-disable-next-line no-control-regex
      if (/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/.test(r.t)) return false;
      if ("b" in r && r.b !== true) return false;
      if ("c" in r && !COLOR_IDS.has(r.c)) return false;
      if ("s" in r && r.s !== "s" && r.s !== "l") return false;
      len += r.t.length;
    }
  }
  return len <= LIMITS.bodyChars && bodyHasText(body as LetterBody);
};

// ---- エディター(Tiptap / ProseMirror の JSON)との変換 ----

type PMMark = { type: string; attrs?: Record<string, unknown> };
type PMNode = { type: string; text?: string; marks?: PMMark[]; attrs?: Record<string, unknown>; content?: PMNode[] };

const sameStyle = (a: LetterRun, b: LetterRun) => a.b === b.b && a.c === b.c && a.s === b.s;

/** エディターの JSON → 本文。知らない形は落とし、同じ装飾の続きは 1 つにまとめる */
export const fromEditorJson = (doc: PMNode): LetterBody => {
  const paras: LetterBody = [];
  for (const node of doc.content ?? []) {
    if (node.type !== "paragraph") continue;
    const runs: LetterRun[] = [];
    const push = (run: LetterRun) => {
      const last = runs[runs.length - 1];
      if (last && sameStyle(last, run)) last.t += run.t;
      else runs.push(run);
    };
    for (const child of node.content ?? []) {
      if (child.type === "hardBreak") {
        push({ t: "\n" });
        continue;
      }
      if (child.type !== "text" || !child.text) continue;
      // 貼り付けで入る制御文字は落とす(タブは空白に)
      // eslint-disable-next-line no-control-regex
      const run: LetterRun = { t: child.text.replace(/\t/g, " ").replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, "") };
      for (const m of child.marks ?? []) {
        if (m.type === "bold") run.b = true;
        if (m.type === "letterColor" && typeof m.attrs?.color === "string" && COLOR_IDS.has(m.attrs.color)) run.c = m.attrs.color as TextColor;
        if (m.type === "letterSize" && (m.attrs?.size === "s" || m.attrs?.size === "l")) run.s = m.attrs.size;
      }
      if (run.t) push(run);
    }
    const para: LetterParagraph = { r: runs };
    if (node.attrs?.textAlign === "center") para.a = "c";
    paras.push(para);
  }
  return paras.length ? paras : emptyBody();
};

/** 本文 → エディターの JSON(修正画面で読み込む時) */
export const toEditorJson = (body: LetterBody): PMNode => ({
  type: "doc",
  content: body.map((p) => {
    const content: PMNode[] = [];
    for (const r of p.r) {
      const marks: PMMark[] = [];
      if (r.b) marks.push({ type: "bold" });
      if (r.c) marks.push({ type: "letterColor", attrs: { color: r.c } });
      if (r.s) marks.push({ type: "letterSize", attrs: { size: r.s } });
      r.t.split("\n").forEach((part, i) => {
        if (i > 0) content.push({ type: "hardBreak" });
        if (part) content.push({ type: "text", text: part, ...(marks.length ? { marks } : {}) });
      });
    }
    return { type: "paragraph", attrs: { textAlign: p.a === "c" ? "center" : "left" }, ...(content.length ? { content } : {}) };
  }),
});

/** 段落の末尾にある空の段落を落とす(送る前に整える) */
export const trimBody = (body: LetterBody): LetterBody => {
  const out = body.map((p) => ({ ...p, r: p.r.filter((r) => r.t.length > 0) }));
  while (out.length > 1 && out[out.length - 1].r.every((r) => !/\S/.test(r.t))) out.pop();
  while (out.length > 1 && out[0].r.every((r) => !/\S/.test(r.t))) out.shift();
  return out;
};
