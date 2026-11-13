import React from "react";
import { Link } from "gatsby";
import { showSongKicker, splitTitleBySong } from "../../utils/songArticles/series";

/**
 * 記事の表紙の画像を上に載せたカード(plan/59)。HOME の「読みもの」と、記事の下の「その他の記事」で使う。
 * 表紙は記事ごとの独自デザインなので、色を被せたり切り抜いたりせず、そのままの比率(1200:630)で出す。
 * 歌詞が混じらないよう、要約は出さない(題・曲名だけ)。
 */

type Accent = "yellow" | "blue";

// Tailwind がクラス名を拾えるよう、色ごとのクラスは文字列のまま持つ
const ACCENT_CLASS: Record<Accent, { border: string; text: string; kicker: string }> = {
  yellow: { border: "hover:border-bx-yellow", text: "group-hover:text-bx-yellow", kicker: "text-bx-yellow" },
  blue: { border: "hover:border-bx-blue", text: "group-hover:text-bx-blue", kicker: "text-bx-blue" },
};

export type ArticleCoverCardProps = {
  slug: string;
  title: string;
  songTitle: string;
  /** 表紙の画像(/articles-cover/<slug>.jpg)。無い時は曲名を大きく出す */
  cover?: string | null;
  accent?: Accent;
  /** 最初の画面に入る1枚だけ true(ほかは遅延読み込み) */
  eager?: boolean;
  onClick?: () => void;
};

const ArticleCoverCard: React.FC<ArticleCoverCardProps> = ({ slug, title, songTitle, cover, accent = "yellow", eager = false, onClick }) => {
  const c = ACCENT_CLASS[accent];
  const parts = splitTitleBySong(title, songTitle);
  return (
    <Link
      to={`/articles/${slug}/`}
      onClick={onClick}
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-bx-line transition-colors ${c.border}`}
    >
      <span className="relative block aspect-[40/21] overflow-hidden border-b border-bx-line bg-bx-line/40">
        {cover ? (
          <img
            src={cover}
            alt=""
            width={800}
            height={420}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            // 表紙が枠と違う比率の画像(動画のサムネイル)でも、枠の比率で切り出す
            style={{ aspectRatio: "40 / 21" }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center px-6 text-center text-2xl font-extrabold text-bx-ink3">
            {songTitle}
          </span>
        )}
      </span>
      <span className="block px-3.5 pt-3 pb-3.5">
        {/* 題名にもう曲名が入っている時は曲名を出さない */}
        {showSongKicker(title, songTitle) && (
          <span className={`mb-1.5 block text-[10px] font-extrabold tracking-[0.2em] ${c.kicker} [overflow-wrap:anywhere]`}>{songTitle}</span>
        )}
        <span className={`block text-[14px] font-semibold leading-snug text-bx-ink2 transition-colors ${c.text} [overflow-wrap:anywhere]`}>
          {/* 曲名の文字だけ強調する(読みもの一覧のカードと同じ) */}
          {parts ? (
            <>
              {parts.before}
              <strong className={`font-extrabold text-[1.1em] text-bx-ink ${c.text}`}>{parts.song}</strong>
              {parts.after}
            </>
          ) : songTitle ? (
            title
          ) : (
            // 曲名の無い読みもの(ガイド)は、題名の全体を本文の色で出す
            <span className={`text-bx-ink ${c.text}`}>{title}</span>
          )}
        </span>
      </span>
    </Link>
  );
};

export default ArticleCoverCard;
