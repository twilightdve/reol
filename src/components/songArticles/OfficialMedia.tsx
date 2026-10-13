import React, { useState } from "react";
import { trackEvent, trackOfficialLinkClick } from "../../utils/analytics";

/**
 * 楽曲記事の公式MV(plan/29)。
 * - 自動再生しない。最初は公式YouTubeへのリンク(サムネイル付き)で、JSが動かなくてもそのまま公式ページへ進める。
 * - クリックした時だけプレイヤーを読み込む。読み込めなくても下の本文リンクで公式ページへ行ける。
 * - 本文の「MVを観る」リンクの文言とリンク先はそのまま残す(代替操作)。
 *
 * 記事別デザイン(plan/30)向けに、`format="cinemascope"` では再生前のサムネイルを
 * シネマスコープ比(2.39:1)で見せる(再生時は16:9)。`format="square"` では正方形に切り抜いて見せる
 * (公式配信音源など、正方形のジャケットの左右に帯が付いたサムネイル向け。再生時は16:9)。`unstyled` では色・枠を付けず、
 * `sa-media*` のクラス名でデザイン側のCSSから整える。
 */
interface OfficialMediaProps {
  videoId: string;
  /** 本文にあったリンク先(公式MVのURL) */
  href: string;
  /** 本文にあったリンクの文言 */
  text: string;
  articleId: string;
  format?: "video" | "cinemascope" | "square";
  unstyled?: boolean;
  /** 16:9 の動画でも高解像度のサムネイル(maxresdefault)を先に試す。hqdefault は4:3で上下に黒帯が入るため(無ければ hqdefault に戻る) */
  preferHighRes?: boolean;
  /** 再生を始める位置(秒)。埋め込みの start に渡す */
  start?: number;
}

// 幅に対する高さ。16:9、2.39:1、1:1
const RATIO = { video: "56.25%", cinemascope: "41.84%", square: "100%" } as const;

const OfficialMedia: React.FC<OfficialMediaProps> = ({
  videoId,
  href,
  text,
  articleId,
  format = "video",
  unstyled = false,
  preferHighRes = false,
  start,
}) => {
  const [playing, setPlaying] = useState(false);
  // 高解像度のサムネイル(maxresdefault)が無い動画もあるため、失敗したら hqdefault、それも失敗したら画像なし
  const [thumb, setThumb] = useState<"maxresdefault" | "hqdefault" | null>(
    format === "video" && !preferHighRes ? "hqdefault" : "maxresdefault"
  );

  return (
    <figure className={`sa-media sa-media--${format}${unstyled ? "" : " my-8"}`}>
      {/* @tailwindcss/aspect-ratio 導入済みで aspect-video が生成されないため、曲ページと同じ padding 方式で比率を作る */}
      <div
        className={`sa-media__frame relative w-full overflow-hidden${
          unstyled ? "" : " rounded-lg border border-bx-line bg-bx-surface/5"
        }`}
        style={{ paddingBottom: playing ? RATIO.video : RATIO[format], height: 0 }}
      >
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${start ? `&start=${Math.floor(start)}` : ""}`}
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
            className="sa-media__play group absolute inset-0 flex items-center justify-center focus-visible:outline-none after:pointer-events-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-4 focus-visible:after:ring-inset focus-visible:after:ring-bx-yellow"
          >
            {thumb && (
              <img
                src={`https://i.ytimg.com/vi/${videoId}/${thumb}.jpg`}
                alt=""
                loading={format === "cinemascope" ? "eager" : "lazy"}
                decoding="async"
                onError={() => setThumb(thumb === "maxresdefault" ? "hqdefault" : null)}
                className="sa-media__thumb absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
            )}
            <span
              className={`sa-media__button relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg${
                unstyled ? "" : " bg-bx-yellow text-bx-bg"
              }`}
            >
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="sr-only">{text}(ここで再生)</span>
          </a>
        )}
      </div>
      <figcaption className={`sa-media__caption${unstyled ? "" : " mt-3 text-[14px]"}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOfficialLinkClick("youtube_mv")}
          className={unstyled ? undefined : "text-bx-blue underline underline-offset-4 hover:text-bx-blueLight"}
        >
          {text}
        </a>
      </figcaption>
    </figure>
  );
};

export default OfficialMedia;
