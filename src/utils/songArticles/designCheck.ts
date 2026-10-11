/**
 * 記事別デザインが、いまの本文に対して作られたものかを確かめる(plan/30)。Node 専用(crypto を使う)。
 */
import * as crypto from "crypto";
import { ArticleBlock, inlineText } from "./markdown";
import { DESIGN_MANIFEST, DesignManifestEntry } from "./designManifest";

export const blockTextHash = (block: ArticleBlock): string => {
  const text = block.t === "p" || block.t === "h" ? inlineText(block.children) : JSON.stringify(block);
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
};

/** 食い違いの説明を返す(空なら一致)。登録が無ければ「未登録」 */
export const designProblems = (
  articleId: string,
  body: { bodyRevision: number; bodySha256: string; blocks: ArticleBlock[] },
  manifest: Record<string, DesignManifestEntry> = DESIGN_MANIFEST
): string[] => {
  const entry = manifest[articleId];
  if (!entry) return ["記事別デザインが登録されていません"];
  const problems: string[] = [];
  if (entry.bodyRevision !== body.bodyRevision) {
    problems.push(`デザインは本文版 ${entry.bodyRevision} 用です(本文版 ${body.bodyRevision})`);
  }
  if (entry.bodySha256 !== body.bodySha256) problems.push("デザイン作成時と本文の sha256 が違います");
  if (entry.blockCount !== body.blocks.length) {
    problems.push(`段落数が違います(デザイン ${entry.blockCount} / 本文 ${body.blocks.length})`);
  }
  for (const a of entry.anchors) {
    const block = body.blocks[a.block];
    if (!block || blockTextHash(block) !== a.textHash) {
      problems.push(`デザインが帯を置く段落(${a.block})の内容が違います`);
    }
  }
  return problems;
};
