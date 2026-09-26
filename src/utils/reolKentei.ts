/**
 * 新規コンテンツ案B「Reol検定」(plan/legit-improvement-plan.md 5章)
 *
 * 問題は全てDB(楽曲統計・ディスコグラフィ・ライブ)から自動生成する。
 * 人力の問題作成が不要で、データが増えるほど出題の幅も自然に広がる。
 */

export type KenteiQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type SongRow = {
  songName: string;
  totalPlays: number;
  firstPlayedDate: string | null;
};

export type DiscographyRow = {
  title: string;
  releaseDate: string | null;
  format: string | null;
};

export type LiveRow = {
  title: string;
  type: string;
};

const FORMAT_LABEL: Record<string, string> = {
  配信SG: "配信シングル",
  "DVD/BD": "DVD/BD",
  歌唱: "歌唱(提供曲)",
  fullAL: "フルアルバム",
  EP: "EP",
  LP: "LP",
  SG: "シングル",
  miniAL: "ミニアルバム",
  歌ってみた: "歌ってみた",
};

const LIVE_TYPE_LABEL: Record<string, string> = {
  oneman: "ワンマン",
  event: "イベント",
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

const yearOf = (iso: string | null): number | null => {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
};

/** 曲の初披露年を当てる問題 */
const genFirstPlayedYear = (songs: SongRow[]): KenteiQuestion | null => {
  const candidates = songs.filter((s) => yearOf(s.firstPlayedDate) !== null);
  if (candidates.length < 4) return null;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const correctYear = yearOf(target.firstPlayedDate) as number;
  const otherYears = Array.from(
    new Set(
      candidates
        .map((s) => yearOf(s.firstPlayedDate) as number)
        .filter((y) => y !== correctYear)
    )
  );
  if (otherYears.length < 3) return null;
  const distractors = pickRandom(otherYears, 3);
  const options = shuffle([correctYear, ...distractors]).map((y) => `${y}年`);
  return {
    question: `『${target.songName}』が初めて演奏されたのは何年？`,
    options,
    correctIndex: options.indexOf(`${correctYear}年`),
  };
};

/** 4曲のうち演奏回数が最も多い曲を当てる問題 */
const genMostPlayed = (songs: SongRow[]): KenteiQuestion | null => {
  if (songs.length < 4) return null;
  const four = pickRandom(songs, 4);
  const values = four.map((s) => s.totalPlays);
  const maxVal = Math.max(...values);
  // 同率トップが複数あると出題が成立しないため除外
  if (values.filter((v) => v === maxVal).length !== 1) return null;
  const options = four.map((s) => s.songName);
  const correctIndex = values.indexOf(maxVal);
  return {
    question: "次の4曲のうち、通算演奏回数が最も多いのは？",
    options,
    correctIndex,
  };
};

/** リリース年を当てる問題 */
const genReleaseYear = (discs: DiscographyRow[]): KenteiQuestion | null => {
  const candidates = discs.filter((d) => yearOf(d.releaseDate) !== null);
  if (candidates.length < 4) return null;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const correctYear = yearOf(target.releaseDate) as number;
  const otherYears = Array.from(
    new Set(
      candidates
        .map((d) => yearOf(d.releaseDate) as number)
        .filter((y) => y !== correctYear)
    )
  );
  if (otherYears.length < 3) return null;
  const distractors = pickRandom(otherYears, 3);
  const options = shuffle([correctYear, ...distractors]).map((y) => `${y}年`);
  return {
    question: `『${target.title}』がリリースされたのは何年？`,
    options,
    correctIndex: options.indexOf(`${correctYear}年`),
  };
};

/** リリースのフォーマットを当てる問題 */
const genFormat = (discs: DiscographyRow[]): KenteiQuestion | null => {
  const candidates = discs.filter((d) => d.format && FORMAT_LABEL[d.format]);
  if (candidates.length < 1) return null;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const correctLabel = FORMAT_LABEL[target.format as string];
  const otherLabels = Array.from(
    new Set(Object.values(FORMAT_LABEL).filter((l) => l !== correctLabel))
  );
  if (otherLabels.length < 3) return null;
  const distractors = pickRandom(otherLabels, 3);
  const options = shuffle([correctLabel, ...distractors]);
  return {
    question: `『${target.title}』のフォーマットは？`,
    options,
    correctIndex: options.indexOf(correctLabel),
  };
};

/** 公演がワンマンかイベントかを当てる問題(2択) */
const genLiveType = (lives: LiveRow[]): KenteiQuestion | null => {
  const candidates = lives.filter((l) => LIVE_TYPE_LABEL[l.type]);
  if (candidates.length < 1) return null;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const correctLabel = LIVE_TYPE_LABEL[target.type];
  const options = shuffle(Object.values(LIVE_TYPE_LABEL));
  return {
    question: `『${target.title}』は、ワンマン公演？ イベント出演？`,
    options,
    correctIndex: options.indexOf(correctLabel),
  };
};

export type KenteiPool = "easy" | "all" | "hard";

/** totalPlays順で並べ、pool指定に応じて曲プールを絞り込む(易しい=よく知られた曲、難しい=マニアックな曲) */
const filterSongPool = (songs: SongRow[], pool: KenteiPool): SongRow[] => {
  if (pool === "all") return songs;
  const sorted = [...songs].sort((a, b) => b.totalPlays - a.totalPlays);
  const cut = Math.ceil(sorted.length * 0.6);
  return pool === "easy" ? sorted.slice(0, cut) : sorted.slice(-cut);
};

/** リリース日の新しさで絞り込む(易しい=直近、難しい=古い/レア) */
const filterDiscPool = (
  discs: DiscographyRow[],
  pool: KenteiPool
): DiscographyRow[] => {
  if (pool === "all") return discs;
  const sorted = [...discs]
    .filter((d) => d.releaseDate)
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
  const cut = Math.ceil(sorted.length * 0.6);
  return pool === "easy" ? sorted.slice(0, cut) : sorted.slice(-cut);
};

const GENERATORS: Array<
  (songs: SongRow[], discs: DiscographyRow[], lives: LiveRow[]) => KenteiQuestion | null
> = [
  (songs) => genFirstPlayedYear(songs),
  (songs) => genMostPlayed(songs),
  (_songs, discs) => genReleaseYear(discs),
  (_songs, discs) => genFormat(discs),
  (_songs, _discs, lives) => genLiveType(lives),
];

/** 指定件数ぶんの問題を生成する。同じ問題文の重複は避ける。 */
export const generateKenteiQuestions = (
  songsAll: SongRow[],
  discsAll: DiscographyRow[],
  livesAll: LiveRow[],
  pool: KenteiPool,
  count: number
): KenteiQuestion[] => {
  const songs = filterSongPool(songsAll, pool);
  const discs = filterDiscPool(discsAll, pool);
  const lives = livesAll; // 公演のワンマン/イベント判定は難易度と無関係なのでそのまま使う

  const questions: KenteiQuestion[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (questions.length < count && guard < count * 30) {
    guard += 1;
    const gen = GENERATORS[Math.floor(Math.random() * GENERATORS.length)];
    const q = gen(songs, discs, lives);
    if (!q || seen.has(q.question)) continue;
    seen.add(q.question);
    questions.push(q);
  }
  return questions;
};
