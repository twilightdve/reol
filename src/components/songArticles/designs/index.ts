/**
 * 記事別デザインの登録(plan/30)。記事ID → デザイン。
 * 本文の版との対応は src/utils/songArticles/designManifest.ts に書く(こちらは描画部品だけ)。
 */
import type { SongArticleDesign } from "./types";
import BoyDesign from "./reol-song-080/BoyDesign";
import NoTitleDesign from "./reol-song-006/NoTitleDesign";
import MonsterDesign from "./reol-song-026/MonsterDesign";
import ScorpionDesign from "./reol-song-087/ScorpionDesign";
import OneLdkDesign from "./reol-song-076/OneLdkDesign";
import DropPopCandyDesign from "./reol-song-004/DropPopCandyDesign";

export const SONG_ARTICLE_DESIGNS: Record<string, SongArticleDesign> = {
  "reol-song-080": BoyDesign,
  "reol-song-006": NoTitleDesign,
  "reol-song-026": MonsterDesign,
  "reol-song-087": ScorpionDesign,
  "reol-song-076": OneLdkDesign,
  "reol-song-004": DropPopCandyDesign,
};
