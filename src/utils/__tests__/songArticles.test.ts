/**
 * @jest-environment node
 */
import {
  eligibilityProblems,
  extractPublicationArtifact,
  parseCsv,
  rowsToRecords,
  toRevision,
  toTriState,
} from "../songArticles/importModel";
import { firstParagraphText, parseArticleMarkdown, youtubeVideoId } from "../songArticles/markdown";
import { formatArticleDate, splitAfterComma } from "../songArticles/format";
import type { PublicationArtifact } from "../songArticles/types";

// 実在する原稿は使わず、小さな検証用データで確かめる(設計書11章)

describe("toTriState", () => {
  it("TRUE / FALSE / 空欄 を true / false / null にする", () => {
    expect(toTriState("TRUE")).toBe(true);
    expect(toTriState("FALSE")).toBe(false);
    expect(toTriState("")).toBeNull();
    expect(toTriState("  ")).toBeNull();
    expect(toTriState(undefined)).toBeNull();
  });
  it("文字列 FALSE を truthy として扱わない", () => {
    expect(toTriState("false")).toBe(false);
  });
  it("想定外の値は推測しない", () => {
    expect(() => toTriState("はい")).toThrow();
  });
});

describe("toRevision", () => {
  it("整数と表計算の 7.0 を受け付け、空欄は null", () => {
    expect(toRevision("2")).toBe(2);
    expect(toRevision("7.0")).toBe(7);
    expect(toRevision("")).toBeNull();
  });
  it("整数でなければ例外", () => {
    expect(() => toRevision("2a")).toThrow();
    expect(() => toRevision("1.5")).toThrow();
  });
});

describe("parseCsv / rowsToRecords", () => {
  it("引用符内のカンマ・改行・二重引用符を扱い、列名で引く", () => {
    const csv = 'b,a\r\n"x,""y""\nz",1\n';
    const recs = rowsToRecords(parseCsv(csv), ["a", "b"]);
    expect(recs).toEqual([{ b: 'x,"y"\nz', a: "1" }]);
  });
  it("必須列が無ければ例外", () => {
    expect(() => rowsToRecords(parseCsv("a\n1\n"), ["a", "article_id"])).toThrow(/article_id/);
  });
});

describe("extractPublicationArtifact", () => {
  it("4種類のキーをそれぞれ正規化する", () => {
    const base = { source_revision: 1, approved_revision: 1, format_revision: 1 };
    const cases: [string, Record<string, unknown>][] = [
      ["publication_markdown", { ...base, file_id: "F1", sha256: "S" }],
      ["markdown_publication", { ...base, markdown_file_id: "F1", canonical_document_id: "D" }],
      ["markdown_export", { ...base, drive_file_id: "F1", content_sha256: "S" }],
      ["publication_format", { ...base, file_id: "F1", markdown_url: "https://example.com/f" }],
    ];
    for (const [key, raw] of cases) {
      const r = extractPublicationArtifact({ [key]: raw });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.artifact.sourceKey).toBe(key);
        expect(r.artifact.fileId).toBe("F1");
        expect(r.artifact.sourceRevision).toBe(1);
      }
    }
  });
  it("同じ意味のキーで値が違えば先勝ちにせず保留", () => {
    const r = extractPublicationArtifact({
      publication_markdown: { file_id: "F1", drive_file_id: "F2", source_revision: 1 },
    });
    expect(r.ok).toBe(false);
  });
  it("掲載記録が2つあり内容が違えば保留", () => {
    const r = extractPublicationArtifact({
      publication_markdown: { file_id: "F1", source_revision: 1 },
      markdown_export: { file_id: "F1", source_revision: 2 },
    });
    expect(r.ok).toBe(false);
  });
  it("source_revision が無くても approved_revision から補完しない", () => {
    const r = extractPublicationArtifact({ publication_markdown: { approved_revision: 3 } });
    expect(r.ok && r.artifact.sourceRevision).toBeNull();
  });
  it("記録が無ければ理由を返す", () => {
    expect(extractPublicationArtifact({}).ok).toBe(false);
  });
});

describe("eligibilityProblems", () => {
  const publication: PublicationArtifact = {
    sourceKey: "publication_markdown",
    fileId: "F",
    url: null,
    fileName: null,
    documentId: "D",
    approvedRevision: 2,
    sourceRevision: 2,
    formatRevision: 1,
    sha256: null,
    libraryFileId: null,
    sourceDocumentRevisionId: null,
  };
  const ok = {
    userApproval: true,
    qaPass: null,
    bodyRevision: 2,
    approvedRevision: 2,
    publication,
    stateLabel: "本人合格",
  } as const;

  it("本人合格で自動判定が空欄の記事は除外しない", () => {
    expect(eligibilityProblems(ok)).toEqual([]);
  });
  it("自動合格だけ(本人null)は候補にしない", () => {
    expect(eligibilityProblems({ ...ok, userApproval: null, qaPass: true })).not.toEqual([]);
  });
  it("自動判定 FALSE は黙って無視しない", () => {
    expect(eligibilityProblems({ ...ok, qaPass: false }).join()).toMatch(/自動合格が FALSE/);
  });
  it("本文が更新され承認版と食い違えば保留(古い承認を新しい本文へ移さない)", () => {
    expect(eligibilityProblems({ ...ok, bodyRevision: 3 }).join()).toMatch(/一致しない/);
  });
  it("掲載記録の元版が本文版より古ければ保留", () => {
    expect(
      eligibilityProblems({ ...ok, publication: { ...publication, sourceRevision: 1 } }).join()
    ).toMatch(/元版 1/);
  });
  it("形式版だけが増えても本人合格は解除しない", () => {
    expect(eligibilityProblems({ ...ok, publication: { ...publication, formatRevision: 5 } })).toEqual([]);
  });
  it("統合済み・要改稿の行は保留", () => {
    expect(eligibilityProblems({ ...ok, stateLabel: "統合済み" })).not.toEqual([]);
    expect(eligibilityProblems({ ...ok, stateLabel: "要改稿・資料確認待ち" })).not.toEqual([]);
  });
});

describe("parseArticleMarkdown", () => {
  const md = [
    "# 見本の題 *強調* つき",
    "",
    "[「見本」のMVを観る](https://www.youtube.com/watch?v=abcDEF12345)",
    "",
    "一段落目。[出典の文言](https://example.com/a)を保持する。",
    "",
    "## 小見出し",
    "",
    "二段落目。",
    "",
  ].join("\n");

  it("先頭H1を題として取り出し、文言を保つ", () => {
    const r = parseArticleMarkdown(md);
    expect(r.problems).toEqual([]);
    expect(r.title).toBe("見本の題 強調 つき");
  });
  it("段落順・リンク先・リンク文言を変えない", () => {
    const r = parseArticleMarkdown(md);
    expect(r.blocks.map((b) => b.t)).toEqual(["p", "p", "h", "p"]);
    const p = r.blocks[1];
    expect(p.t === "p" && p.children).toEqual([
      { t: "text", v: "一段落目。" },
      { t: "link", href: "https://example.com/a", children: [{ t: "text", v: "出典の文言" }] },
      { t: "text", v: "を保持する。" },
    ]);
  });
  it("H1直後の単独リンクをリードとして示す(本文からは消さない)", () => {
    const r = parseArticleMarkdown(md);
    expect(r.lead).toEqual({
      index: 0,
      href: "https://www.youtube.com/watch?v=abcDEF12345",
      text: "「見本」のMVを観る",
    });
    expect(r.blocks[0].t).toBe("p");
    expect(firstParagraphText(r)).toBe("一段落目。出典の文言を保持する。");
  });
  it("リンクだけの段落(聴く：…｜…)は要約に使わない", () => {
    const r = parseArticleMarkdown(
      "# 題\n\n聴く：[Spotify](https://open.spotify.com/x)｜[公式](https://reol.jp/)\n\n[Spotifyで聴く](https://open.spotify.com/y)\n\n本文の一段落目。\n"
    );
    expect(firstParagraphText(r)).toBe("本文の一段落目。");
  });
  it("H1が二重なら問題として返す", () => {
    expect(parseArticleMarkdown("# A\n\n本文\n\n# B\n").problems.join()).toMatch(/2つ目のH1/);
  });
  it("先頭がH1でなければ問題として返す", () => {
    expect(parseArticleMarkdown("本文だけ\n").problems.join()).toMatch(/先頭がH1/);
  });
  it("生HTMLや http/https 以外のリンクを通さない", () => {
    const r = parseArticleMarkdown('# A\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n');
    expect(r.problems.length).toBe(2);
    expect(JSON.stringify(r.blocks)).not.toMatch(/javascript:|<script/);
  });
});

describe("youtubeVideoId", () => {
  it("各形式から動画IDを取り出す", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=abcDEF12345")).toBe("abcDEF12345");
    expect(youtubeVideoId("https://youtu.be/abcDEF12345")).toBe("abcDEF12345");
    expect(youtubeVideoId("https://www.youtube.com/embed/abcDEF12345")).toBe("abcDEF12345");
    expect(youtubeVideoId("https://example.com/watch?v=abc")).toBeNull();
    expect(youtubeVideoId(null)).toBeNull();
  });
  it("動画IDの形(英数字・_・- の11文字)でなければ受け付けない", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=abc")).toBeNull();
    expect(youtubeVideoId("https://youtu.be/abcDEF12345%22onload")).toBeNull();
    expect(youtubeVideoId("https://www.youtube.com/watch?v=../../x?a=1")).toBeNull();
  });
});

describe("formatArticleDate", () => {
  it("日本時間の日付にする", () => {
    expect(formatArticleDate("2026-10-08T16:00:00Z")).toBe("2026年10月9日");
    expect(formatArticleDate(null)).toBeNull();
  });
});

describe("designProblems", () => {
  // 合成した本文と、それに対して作った仮の登録表で確かめる
  const { designProblems, blockTextHash } = jest.requireActual("../songArticles/designCheck");
  const parsed = parseArticleMarkdown("# 題\n\n一段落目\n\n二段落目\n");
  const manifest = {
    x: {
      bodyRevision: 1,
      bodySha256: "s1",
      blockCount: 2,
      anchors: [{ block: 1, textHash: blockTextHash(parsed.blocks[1]) }],
    },
  };
  const body = { bodyRevision: 1, bodySha256: "s1", blocks: parsed.blocks };

  it("作成時の本文と一致すれば問題なし", () => {
    expect(designProblems("x", body, manifest)).toEqual([]);
  });
  it("未登録の記事は使わない", () => {
    expect(designProblems("y", body, manifest).join()).toMatch(/登録されていません/);
  });
  it("本文が改稿されたら(版・sha256)使わない", () => {
    expect(designProblems("x", { ...body, bodyRevision: 2, bodySha256: "s2" }, manifest)).toHaveLength(2);
  });
  it("帯を置く段落の内容が変わったら使わない", () => {
    const changed = parseArticleMarkdown("# 題\n\n一段落目\n\n書き換えた段落\n");
    expect(designProblems("x", { ...body, blocks: changed.blocks }, manifest).join()).toMatch(/段落\(1\)/);
  });
});

describe("splitAfterComma", () => {
  it("読点の直後で区切り、連結すると元の文字列に戻る", () => {
    const text = "一つ目の句、二つ目の句、三つ目。";
    expect(splitAfterComma(text)).toEqual(["一つ目の句、", "二つ目の句、", "三つ目。"]);
    expect(splitAfterComma(text).join("")).toBe(text);
  });
  it("読点で終わる・読点がない文字列もそのまま戻る", () => {
    expect(splitAfterComma("終わりに読点、")).toEqual(["終わりに読点、"]);
    expect(splitAfterComma("読点なし")).toEqual(["読点なし"]);
  });
});
