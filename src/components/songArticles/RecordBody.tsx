import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RecordBlock } from "../../utils/songArticles/markdown";
import type { RecordMediaAsset, RecordPhotoAsset } from "../../utils/songArticles/types";
import PlayerSlot from "../player/PlayerSlot";
import { Block } from "./ArticleBody";

/**
 * 記録(kind: "record")の本文(plan/72)。文章は楽曲記事の共通の組版(ArticleBody の Block)と同じに描き、
 * 本文の media ブロックの位置に写真・動画を置く。記事ごとの React・CSS は持たない。
 *
 * - 写真は切り抜かない(縦の写真も元の比率のまま)。複数の時は2枚ずつ横に並べ、奇数なら最初の1枚を大きく出す。
 *   狭い画面では、本文の順のまま縦に1枚ずつ(縦のものだけの段は、狭い画面でも横に並べる)。
 * - 写真を押すと拡大表示(前後の写真へ送れる。Esc か「閉じる」で戻る)。
 * - 動画は YouTube。再生ボタンを押すまで埋め込まない(PlayerSlot)。縦の動画は縦のまま流す。
 */

const VERTICAL_RATIO = "177.78%";

const aspectOf = (m: RecordMediaAsset): number => (m.type === "photo" ? m.width / m.height : m.vertical ? 9 / 16 : 16 / 9);

/** 2つずつの段に分ける。奇数なら最初の1つを1段で出す */
const toRows = <T,>(items: T[]): T[][] => {
  const rows: T[][] = [];
  let i = items.length % 2 === 1 ? 1 : 0;
  if (i === 1) rows.push([items[0]]);
  for (; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
};

const Photo: React.FC<{ photo: RecordPhotoAsset; sizes: string; onOpen: () => void }> = ({ photo, sizes, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={`写真を大きく表示: ${photo.alt}`}
    className="block w-full cursor-zoom-in overflow-hidden rounded-md bg-bx-line/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bx-yellow"
  >
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      className="block h-auto w-full"
    />
  </button>
);

const MediaItem: React.FC<{ item: RecordMediaAsset; sizes: string; onOpen: (id: string) => void }> = ({ item, sizes, onOpen }) => (
  <figure className="m-0">
    {item.type === "photo" ? (
      <Photo photo={item} sizes={sizes} onOpen={() => onOpen(item.id)} />
    ) : (
      <PlayerSlot
        videoId={item.videoId}
        title={item.title}
        // 縦の動画は再生中も縦のままにする。サムネイルは横長の画像の中央に縦の画が入っているので、大きい方(hq720)を
        // 縦の枠で切り出す。hq720 の無い動画は sddefault にする
        thumbnail={item.vertical ? `https://i.ytimg.com/vi/${item.videoId}/hq720.jpg` : undefined}
        thumbnailFallback={item.vertical ? `https://i.ytimg.com/vi/${item.videoId}/sddefault.jpg` : undefined}
        idleRatio={item.vertical ? VERTICAL_RATIO : undefined}
        activeRatio={item.vertical ? VERTICAL_RATIO : undefined}
        className="rounded-md"
      />
    )}
    {item.caption && <figcaption className="mt-2 text-[12px] leading-relaxed text-bx-ink3">{item.caption}</figcaption>}
  </figure>
);

const MediaRows: React.FC<{ items: RecordMediaAsset[]; onOpen: (id: string) => void }> = ({ items, onOpen }) => (
  <div className="my-8 space-y-2 sm:space-y-3">
    {toRows(items).map((row, i) => {
      if (row.length === 1) {
        const portrait = aspectOf(row[0]) < 1;
        return (
          // 縦のものを1つだけ出す時は、本文の幅いっぱいにはしない(縦に長くなりすぎるため)
          <div key={i} className={portrait ? "mx-auto max-w-[22rem]" : undefined}>
            <MediaItem item={row[0]} sizes={portrait ? "(min-width: 384px) 352px, 100vw" : "(min-width: 672px) 672px, 100vw"} onOpen={onOpen} />
          </div>
        );
      }
      // 縦のものだけの段は、狭い画面でも横に並べる。それ以外は、狭い画面では本文の順のまま縦に積む
      const allPortrait = row.every((m) => aspectOf(m) < 1);
      return (
        <div key={i} className={`flex gap-2 sm:gap-3 ${allPortrait ? "flex-row" : "flex-col sm:flex-row"}`}>
          {row.map((m) => (
            <div
              key={m.id}
              // 比率に応じて幅を分け、段の中の高さをそろえる(切り抜かない)
              style={{ "--a": aspectOf(m) } as React.CSSProperties}
              className={`min-w-0 ${allPortrait ? "[flex:var(--a)_1_0%]" : "sm:[flex:var(--a)_1_0%]"}`}
            >
              <MediaItem item={m} sizes={allPortrait ? "(min-width: 672px) 336px, 50vw" : "(min-width: 672px) 336px, (min-width: 640px) 50vw, 100vw"} onOpen={onOpen} />
            </div>
          ))}
        </div>
      );
    })}
  </div>
);

/** 写真の拡大表示。記事の中の写真を、本文の順に前後へ送れる */
const Lightbox: React.FC<{ photos: RecordPhotoAsset[]; index: number | null; onChange: (index: number | null) => void }> = ({
  photos,
  index,
  onChange,
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    // 開いている間は、後ろのページを動かさない
    const before = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = before;
    };
  }, [open]);
  const move = useCallback(
    (step: 1 | -1) => {
      if (index === null) return;
      onChange((index + step + photos.length) % photos.length);
    },
    [index, photos.length, onChange]
  );
  const photo = index !== null ? photos[index] : null;
  const many = photos.length > 1;
  const arrowClass =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bx-yellow";
  return (
    <dialog
      ref={ref}
      aria-label="写真の拡大表示"
      // Esc で閉じた時も状態を戻す
      onClose={() => onChange(null)}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") move(1);
        if (e.key === "ArrowLeft") move(-1);
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black"
    >
      {photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]">
            <span className="tabular-nums text-white/70" aria-live="polite">
              {many ? `${(index as number) + 1} / ${photos.length}` : ""}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-white/40 px-4 py-1.5 font-bold transition-colors hover:border-bx-yellow hover:text-bx-yellow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bx-yellow"
            >
              閉じる
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && onChange(null)}>
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            />
            {many && (
              <>
                <button type="button" onClick={() => move(-1)} aria-label="前の写真" className={`${arrowClass} left-2`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => move(1)} aria-label="次の写真" className={`${arrowClass} right-2`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <p className="min-h-[2.75rem] px-4 py-3 text-center text-[12px] leading-relaxed text-white/70">{photo.caption ?? ""}</p>
        </div>
      )}
    </dialog>
  );
};

const RecordBody: React.FC<{ blocks: RecordBlock[]; media: Record<string, RecordMediaAsset> }> = ({ blocks, media }) => {
  // 拡大表示で送る順は、本文に出てくる順
  const photos = useMemo(
    () =>
      blocks
        .flatMap((b) => (b.t !== "media" ? [] : b.media.type === "gallery" ? b.media.ids : [b.media.id]))
        .map((id) => media[id])
        .filter((m): m is RecordPhotoAsset => m?.type === "photo"),
    [blocks, media]
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openPhoto = useCallback(
    (id: string) => {
      const i = photos.findIndex((p) => p.id === id);
      if (i >= 0) setOpenIndex(i);
    },
    [photos]
  );
  return (
    <div className="text-[16px] sm:text-[17px] leading-[2] text-bx-ink [overflow-wrap:anywhere]">
      {blocks.map((block, i) => {
        if (block.t !== "media") return <Block key={i} block={block} />;
        const ids = block.media.type === "gallery" ? block.media.ids : [block.media.id];
        const items = ids.map((id) => media[id]).filter((m): m is RecordMediaAsset => Boolean(m));
        return items.length > 0 ? <MediaRows key={i} items={items} onOpen={openPhoto} /> : null;
      })}
      <Lightbox photos={photos} index={openIndex} onChange={setOpenIndex} />
    </div>
  );
};

export default RecordBody;
