/**
 * Visual config keyed by MusicBrainz relation type.
 * Unknown types fall back to ROLE_DEFAULT.
 */
export type RoleConfig = {
  label: string;
  color: string;
  /** Used for filter chip ordering. */
  order: number;
};

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  music: { label: "作曲", color: "#0ea5e9", order: 1 },
  lyrics: { label: "作詞", color: "#f43f5e", order: 2 },
  vocal: { label: "Vocal", color: "#ef4444", order: 3 },
  arranger: { label: "Arrange", color: "#3b82f6", order: 4 },
  "instrument arranger": { label: "Inst. Arr.", color: "#60a5fa", order: 5 },
  producer: { label: "Produce", color: "#10b981", order: 6 },
  mix: { label: "Mix", color: "#a855f7", order: 7 },
  recording: { label: "Recording", color: "#8b5cf6", order: 8 },
  instrument: { label: "Instrument", color: "#f59e0b", order: 9 },
  programming: { label: "Programming", color: "#f97316", order: 10 },
  remixer: { label: "Remix", color: "#ec4899", order: 11 },
  performer: { label: "参加 (release)", color: "#22d3ee", order: 11.5 },
  tieup: { label: "タイアップ", color: "#14b8a6", order: 12 },
  misc: { label: "Misc.", color: "#6b7280", order: 13 },
  "phonographic copyright": {
    label: "©",
    color: "#9ca3af",
    order: 14,
  },
};

export const ROLE_DEFAULT: RoleConfig = {
  label: "Other",
  color: "#94a3b8",
  order: 99,
};

export const getRoleConfig = (role: string): RoleConfig =>
  ROLE_CONFIG[role] ?? ROLE_DEFAULT;

export const ALL_ROLE_KEYS = Object.keys(ROLE_CONFIG);
