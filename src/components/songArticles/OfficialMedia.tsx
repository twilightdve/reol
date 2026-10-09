import React, { useState } from "react";
import { trackEvent, trackOfficialLinkClick } from "../../utils/analytics";

/**
 * 楽曲記事の公式MV(plan/29)。
 * - 自動再生しない。最初は公式YouTubeへのリンク(サムネイル付き)で、JSが動かなくてもそのまま公式ページへ進める。
 * - クリックした時だけプレイヤーを読み込む。読み込めなくても下の本文リンクで公式ページへ行ける。
 * - 本文の「MVを観る」リンクの文言とリンク先はそのまま残す(代替操作)。
 */
interface OfficialMediaProps {
  videoId: string;
  /** 本文にあったリンク先(公式MVのURL) */
  href: string;
  /** 本文にあったリンクの文言 */
  text: string;
  articleId: string;
}

const OfficialMedia: React.FC<OfficialMediaProps> = ({ videoId, href, text, articleId }) => {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <figure className="my-8">
      {/* @tailwindcss/aspect-ratio 導入済みで aspect-video が生成されないため、曲ページと同じ padding 方式で16:9にする */}
      <div
        className="relative w-full overflow-hidden rounded-lg border border-bx-line bg-bx-surface/5"
        style={{ paddingBottom: "56.25%", height: 0 }}
      >
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={text}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // JSが動いている時だけページ内で再生する。修飾キー付きは通常のリンクとして開く
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              trackEvent("article_media_open", { category: "engagement", label: articleId });
              setPlaying(true);
            }}
            // 枠が overflow-hidden で、サムネイルが全面を覆うため、フォーカス表示は ::after で画像の上に重ねる
            className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none after:pointer-events-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-4 focus-visible:after:ring-inset focus-visible:after:ring-bx-yellow"
          >
            {!thumbFailed && (
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setThumbFailed(true)}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
            )}
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-bx-yellow text-bx-bg shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="sr-only">{text}(ここで再生)</span>
          </a>
        )}
      </div>
      <figcaption className="mt-3 text-[14px]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOfficialLinkClick("youtube_mv")}
          className="text-bx-blue underline underline-offset-4 hover:text-bx-blueLight"
        >
          {text}
        </a>
      </figcaption>
    </figure>
  );
};

export default OfficialMedia;
