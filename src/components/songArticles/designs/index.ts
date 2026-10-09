/**
 * 記事別デザインの登録(plan/30)。記事ID → デザイン。
 * 本文の版との対応は src/utils/songArticles/designManifest.ts に書く(こちらは描画部品だけ)。
 */
import type { SongArticleDesign } from "./types";
import BoyDesign from "./reol-song-080/BoyDesign";

export const SONG_ARTICLE_DESIGNS: Record<string, SongArticleDesign> = {
  "reol-song-080": BoyDesign,
};
