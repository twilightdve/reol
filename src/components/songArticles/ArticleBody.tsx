import React from "react";
import type { ArticleBlock, ArticleInline } from "../../utils/songArticles/markdown";
import OfficialMedia from "./OfficialMedia";

/**
 * 楽曲記事の本文(plan/29)。ビルド時に作った描画用ツリーをそのまま描く。
 * 文言・段落順・リンク先と表示文言は変えない。生HTMLは扱わない(ツリーに含まれない)。
 */
interface ArticleBodyProps {
  blocks: ArticleBlock[];
  /** 冒頭のMVリンクを公式メディアとして描く位置(登録済みMVと一致した時だけ) */
  leadMedia: { index: number; videoId: string; href: string; text: string } | null;
  articleId: string;
}

const Inline: React.FC<{ nodes: ArticleInline[] }> = ({ nodes }) => (
  <>
    {nodes.map((n, i) => {
      switch (n.t) {
        case "text":
          return <React.Fragment key={i}>{n.v}</React.Fragment>;
        case "br":
          return <br key={i} />;
        case "code":
          return <code key={i}>{n.v}</code>;
        case "em":
          return (
            <em key={i}>
              <Inline nodes={n.children} />
            </em>
          );
        case "strong":
          return (
            <strong key={i}>
              <Inline nodes={n.children} />
            </strong>
          );
        case "link":
          return (
            <a
              key={i}
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bx-blue underline decoration-1 underline-offset-4 hover:text-bx-blueLight break-words"
            >
              <Inline nodes={n.children} />
            </a>
          );
        default:
          return null;
      }
    })}
  </>
);

const HEADING_CLASS = {
  2: "mt-14 mb-5 text-[21px] sm:text-[23px] font-extrabold leading-snug text-bx-ink",
  3: "mt-10 mb-4 text-[18px] font-bold leading-snug text-bx-ink",
  4: "mt-8 mb-3 text-[16px] font-bold text-bx-ink",
} as const;

const Block: React.FC<{ block: ArticleBlock }> = ({ block }) => {
  switch (block.t) {
    case "h": {
      const Tag = `h${block.level}` as "h2" | "h3" | "h4";
      return (
        <Tag className={HEADING_CLASS[block.level]}>
          <Inline nodes={block.children} />
        </Tag>
      );
    }
    case "p":
      return (
        <p className="my-6">
          <Inline nodes={block.children} />
        </p>
      );
    case "quote":
      return (
        <blockquote className="my-6 border-l-2 border-bx-line pl-4 text-bx-ink2">
          {block.children.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </blockquote>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={`my-6 pl-6 space-y-2 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => (
            <li key={i}>
              {item.map((b, j) =>
                // リスト項目内の段落は余白を詰める
                b.t === "p" ? (
                  <Inline key={j} nodes={b.children} />
                ) : (
                  <Block key={j} block={b} />
                )
              )}
            </li>
          ))}
        </Tag>
      );
    }
    case "hr":
      return <hr className="my-10 border-bx-line" />;
    default:
      return null;
  }
};

const ArticleBody: React.FC<ArticleBodyProps> = ({ blocks, leadMedia, articleId }) => (
  <div className="text-[16px] sm:text-[17px] leading-[2] text-bx-ink [overflow-wrap:anywhere]">
    {blocks.map((block, i) =>
      leadMedia && leadMedia.index === i ? (
        <OfficialMedia
          key={i}
          videoId={leadMedia.videoId}
          href={leadMedia.href}
          text={leadMedia.text}
          articleId={articleId}
        />
      ) : (
        <Block key={i} block={block} />
      )
    )}
  </div>
);

export default ArticleBody;
