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
import MutantDesign from "./reol-song-082/MutantDesign";
import VacuumOldRoseDesign from "./reol-song-057/VacuumOldRoseDesign";
import HeimenkyouDesign from "./reol-song-045/HeimenkyouDesign";
import EndDesign from "./reol-song-046/EndDesign";
import MissingDesign from "./reol-song-047/MissingDesign";
import CultDesign from "./reol-song-048/CultDesign";
import AkayoroshiDesign from "./reol-song-049/AkayoroshiDesign";
import NilGokusaishikiDesign from "./reol-song-012/NilGokusaishikiDesign";

export const SONG_ARTICLE_DESIGNS: Record<string, SongArticleDesign> = {
  "reol-song-080": BoyDesign,
  "reol-song-006": NoTitleDesign,
  "reol-song-026": MonsterDesign,
  "reol-song-087": ScorpionDesign,
  "reol-song-076": OneLdkDesign,
  "reol-song-004": DropPopCandyDesign,
  "reol-song-082": MutantDesign,
  "reol-song-057": VacuumOldRoseDesign,
  "reol-song-045": HeimenkyouDesign,
  "reol-song-046": EndDesign,
  "reol-song-047": MissingDesign,
  "reol-song-048": CultDesign,
  "reol-song-049": AkayoroshiDesign,
  "reol-song-012": NilGokusaishikiDesign,
};
