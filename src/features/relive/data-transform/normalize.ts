export const normalizeTitle = (input: string | null | undefined) =>
  (input || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/\.(flac|mp3|m4a|aac|wav)$/i, "")
    .replace(/[【】「」『』\[\]\(\)（）]/g, " ")
    .replace(/\b(reol|れをる|レヲル)\b/gi, " ")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

export const stripParenthetical = (input: string | null | undefined) =>
  (input || "").replace(/\s*[（(].*?[)）]\s*/g, " ").replace(/\s+/g, " ").trim();

export const stripVersionSuffix = (input: string | null | undefined) =>
  stripParenthetical(input)
    .replace(/\s*[-ー]\s*(big death edition|instrumental|inst\.?|remix|live|album version|edit)\s*[-ー]?$/i, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeVenueName = (input: string | null | undefined) =>
  (input || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

export const toVenueId = (place: string) => {
  const normalized = normalizeVenueName(place);
  return normalized ? `venue_${normalized}` : undefined;
};

export const uniqueStrings = (values: Array<string | undefined | null>) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
};
