/**
 * 掲載用Markdown → 描画用ツリー(plan/29 4章)。
 *
 * - 本文の文言・段落順・リンク先と表示文言は変えない。生HTMLは描画しない。
 * - 先頭のH1を記事タイトルとして取り出す(文言はそのまま)。
 * - H1が2つ以上、未対応の記法、http/https以外のリンクは problems に積み、取込側で保留にする。
 *   黙って落とす・作り直すことはしない。
 */
// remark-parse@9 / unified@9 は CommonJS。gatsby-transformer-remark と同じ系統。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const unified = require("unified");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const remarkParse = require("remark-parse");

export type ArticleInline =
  | { t: "text"; v: string }
  | { t: "link"; href: string; children: ArticleInline[] }
  | { t: "em"; children: ArticleInline[] }
  | { t: "strong"; children: ArticleInline[] }
  | { t: "code"; v: string }
  | { t: "br" };

export type ArticleBlock =
  | { t: "h"; level: 2 | 3 | 4; children: ArticleInline[] }
  | { t: "p"; children: ArticleInline[] }
  | { t: "quote"; children: ArticleBlock[] }
  | { t: "list"; ordered: boolean; items: ArticleBlock[][] }
  | { t: "hr" };

export type ParsedArticle = {
  title: string;
  blocks: ArticleBlock[];
  /** H1直後の段落が単独リンクのとき、その blocks 内の位置とリンク */
  lead: { index: number; href: string; text: string } | null;
  problems: string[];
};

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  url?: string;
  ordered?: boolean;
  children?: MdNode[];
};

const SAFE_URL = /^https?:\/\//i;

export const inlineText = (nodes: ArticleInline[]): string =>
  nodes
    .map((n) => {
      if (n.t === "text" || n.t === "code") return n.v;
      if (n.t === "br") return "\n";
      return inlineText(n.children);
    })
    .join("");

const mdText = (node: MdNode): string =>
  node.value ?? (node.children ?? []).map(mdText).join("");

const convertInline = (nodes: MdNode[], problems: string[]): ArticleInline[] =>
  nodes.flatMap((n): ArticleInline[] => {
    switch (n.type) {
      case "text":
        return [{ t: "text", v: n.value ?? "" }];
      case "emphasis":
        return [{ t: "em", children: convertInline(n.children ?? [], problems) }];
      case "strong":
        return [{ t: "strong", children: convertInline(n.children ?? [], problems) }];
      case "inlineCode":
        return [{ t: "code", v: n.value ?? "" }];
      case "break":
        return [{ t: "br" }];
      case "link": {
        const href = n.url ?? "";
        if (!SAFE_URL.test(href)) {
          problems.push(`http/https 以外のリンク: ${href}`);
          return [{ t: "text", v: mdText(n) }];
        }
        return [{ t: "link", href, children: convertInline(n.children ?? [], problems) }];
      }
      default:
        problems.push(`未対応のインライン記法: ${n.type}`);
        return [{ t: "text", v: mdText(n) }];
    }
  });

const convertBlocks = (nodes: MdNode[], problems: string[]): ArticleBlock[] =>
  nodes.flatMap((n): ArticleBlock[] => {
    switch (n.type) {
      case "heading": {
        const depth = n.depth ?? 2;
        if (depth === 1) {
          problems.push(`本文中に2つ目のH1: ${mdText(n)}`);
          return [];
        }
        if (depth > 4) {
          problems.push(`H${depth} は未対応: ${mdText(n)}`);
          return [];
        }
        return [
          { t: "h", level: depth as 2 | 3 | 4, children: convertInline(n.children ?? [], problems) },
        ];
      }
      case "paragraph":
        return [{ t: "p", children: convertInline(n.children ?? [], problems) }];
      case "blockquote":
        return [{ t: "quote", children: convertBlocks(n.children ?? [], problems) }];
      case "list":
        return [
          {
            t: "list",
            ordered: Boolean(n.ordered),
            items: (n.children ?? []).map((item) => convertBlocks(item.children ?? [], problems)),
          },
        ];
      case "thematicBreak":
        return [{ t: "hr" }];
      default:
        problems.push(`未対応のブロック記法: ${n.type}`);
        return [];
    }
  });

export const parseArticleMarkdown = (markdown: string): ParsedArticle => {
  const problems: string[] = [];
  const tree: MdNode = unified().use(remarkParse).parse(markdown);
  const children = [...(tree.children ?? [])];

  let title = "";
  const first = children[0];
  if (first && first.type === "heading" && first.depth === 1) {
    title = mdText(first);
    children.shift();
  } else {
    problems.push("先頭がH1ではありません");
  }

  const blocks = convertBlocks(children, problems);

  let lead: ParsedArticle["lead"] = null;
  const firstBlock = blocks[0];
  if (firstBlock && firstBlock.t === "p") {
    const meaningful = firstBlock.children.filter((c) => !(c.t === "text" && c.v.trim() === ""));
    if (meaningful.length === 1 && meaningful[0].t === "link") {
      lead = { index: 0, href: meaningful[0].href, text: inlineText(meaningful[0].children) };
    }
  }

  return { title, blocks, lead, problems };
};

/** YouTube の動画IDの形(英数字・_・- の11文字)。埋め込み・サムネイルの URL に使うので、それ以外は受け付けない */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** YouTube の動画IDを取り出す(watch?v= / youtu.be / embed / shorts)。IDの形でなければ null */
export const youtubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  let id: string | null = null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] || null;
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else id = u.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
};

/** 一覧・meta description 用。リード(MVリンク)を除いた最初の段落の本文 */
export const firstParagraphText = (parsed: ParsedArticle): string | null => {
  const p = parsed.blocks.find(
    (b, i) => b.t === "p" && !(parsed.lead && parsed.lead.index === i)
  );
  return p && p.t === "p" ? inlineText(p.children).trim() : null;
};
