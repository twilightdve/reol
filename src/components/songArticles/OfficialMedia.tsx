import React, { useCallback, useState } from "react";
import { trackEvent, trackOfficialLinkClick } from "../../utils/analytics";
import { usePlayerSlot } from "../player/PlayerSlot";

/**
 * 楽曲記事の公式MV(plan/29)。
 * - 自動再生しない。最初は公式YouTubeへのリンク(サムネイル付き)で、JSが動かなくてもそのまま公式ページへ進める。
 * - クリックした時にプレイヤーを読み込む(iPhone・iPad・Mac の Safari だけは、枠が画面に入った時点で再生しないまま
 *   見えないプレイヤーを枠の上に用意する。GlobalPlayer、plan/60 の 5章)。読み込めなくても下の本文リンクで公式ページへ行ける。
 * - 再生はサイト全体で1つのプレイヤー(GlobalPlayer、plan/60)で行う。この枠が画面にある間は枠の上に重なり、
 *   スクロールで外れたり別のページへ移ったりすると、右上隅の小窓で流れ続ける。
 * - 本文の「MVを観る」リンクの文言とリンク先はそのまま残す(代替操作)。
 *
 * 記事別デザイン(plan/30)向けに、`format="cinemascope"` では再生前のサムネイルを
 * シネマスコープ比(2.39:1)で見せる(再生時は16:9)。`format="square"` では正方形に切り抜いて見せる
 * (公式配信音源など、正方形のジャケットの左右に帯が付いたサムネイル向け。再生時は16:9)。`unstyled` では色・枠を付けず、
 * `sa-media*` のクラス名でデザイン側のCSSから整える(再生ボタンだけは、画像だけに見えないよう既定で白地に黒)。
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
  // 計測は onStart で(iPhone などで、押す前に用意したプレイヤーを直接押して流れ始めた時も数える)
  const onStart = useCallback(
    () => trackEvent("article_media_open", { category: "engagement", label: articleId }),
    [articleId]
  );
  const slot = usePlayerSlot({ videoId, start, title: text, onStart });
  const playing = slot.active;
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
        {/* 再生中はプレイヤー(GlobalPlayer)がこの要素に重なる */}
        <span ref={slot.ref} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" />
        {playing ? (
          // プレイヤーが上に重なる。小窓に移っている間だけ、この黒地が見える
          <span className="absolute inset-0 bg-black" aria-hidden="true" />
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // JSが動いている時だけページ内で再生する。修飾キー付きは通常のリンクとして開く
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              slot.start();
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
              // unstyled でも、デザイン側が色を付け忘れた時に画像だけに見えないよう、白地に黒の既定の色を付ける
              // (デザイン側の `.aXXX-video .sa-media__button` の方が詳細度が高いので上書きされる)
              className={`sa-media__button relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg${
                unstyled ? " bg-white/90 text-black" : " bg-bx-yellow text-bx-bg"
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
