import type { SetlistEntryPolicy } from "../types/relive";
import { normalizeTitle } from "./normalize";
import type { SourceSetlistSong } from "./source-types";

export type EntryClassification = {
  policy: SetlistEntryPolicy;
  special: boolean;
  reason?: string;
};

export const classifySpecialEntry = (entry: Pick<SourceSetlistSong, "liveItemSongName" | "type">): EntryClassification => {
  const rawTitle = entry.liveItemSongName || "";
  const normalized = normalizeTitle(rawTitle);
  const lower = rawTitle.normalize("NFKC").toLowerCase();

  if (!normalized || normalized === "未定" || normalized === "不明") {
    return { policy: "se", special: true, reason: "placeholder" };
  }

  if (entry.type === "segment") {
    return { policy: "se", special: true, reason: "source_segment" };
  }

  if (entry.type === "medley" || /<br\s*\/?>|mashup|mushuppppp|メドレー|コーナー|～|~/.test(lower)) {
    return { policy: "medley", special: true, reason: "medley_keyword" };
  }

  if (entry.type === "inst") {
    return { policy: "required", special: false, reason: "source_inst" };
  }

  if (
    /^-+\s*(opening|ending|interlude|intro|introduction|mc)?\s*-+$/i.test(lower) ||
    lower.includes("interlude") ||
    lower === "opening" ||
    lower === "ending" ||
    normalized === "mc" ||
    normalized === "序章" ||
    normalized.includes("抽選会") ||
    normalized.includes("悪天候") ||
    normalized.includes("中止") ||
    normalized.includes("演奏者") ||
    normalized.includes("ダンサー紹介")
  ) {
    return { policy: "se", special: true, reason: "se_keyword" };
  }

  if (entry.type === "cover") {
    return { policy: "cover", special: false, reason: "source_cover" };
  }

  if (entry.type === "live_only") {
    return { policy: "unreleased", special: false, reason: "source_live_only" };
  }

  return { policy: "required", special: false };
};
