/**
 * /quiz/live-guess/ — 新規コンテンツ案G「日替わり公演当てクイズ」
 * (plan/legit-improvement-plan.md 5章)
 *
 * Wordle形式。今日の日付から決定的に選ばれた過去公演を、ヒントを1つずつ
 * 開きながら最大4回で当てる。音源・歌詞は使わずセットリストデータのみで成立させる。
 * 状態はlocalStorageに日付キーで保存し、1日1回だけ挑戦できるようにする
 * (Wordleと同じ「毎日開く理由」を作るため)。
 */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import { extractPrefecture } from "../../utils/extractPrefecture";
import { buildBreadcrumbList } from "../../utils/jsonLd";

const MAX_ATTEMPTS = 4;

type RawSetListSong = {
  liveItemSongName: string;
  type: string | null;
};

type RawItem = {
  slug: string;
  date: string | null;
  place: string | null;
  address: string | null;
  setList: RawSetListSong[];
};

type RawLiveInfo = {
  title: string;
  type: string;
  items: RawItem[];
};

type QuizPageData = {
  live: { liveInfos: RawLiveInfo[] };
};

type Candidate = {
  key: string; // liveItemのslug
  label: string; // 選択肢表示用(タイトル + 日付)
  title: string;
  date: string;
  year: number;
  typeLabel: string;
  place: string;
  firstSongName: string | null;
};

const LIVE_TYPE_LABEL: Record<string, string> = {
  oneman: "ワンマン",
  event: "イベント",
};

// "2001-02-03" のような日付文字列から、閏年を考慮した通算日数(基準日からの経過日数)を計算
const daysSince = (base: string, target: string): number => {
  const b = new Date(`${base}T00:00:00Z`).getTime();
  const t = new Date(`${target}T00:00:00Z`).getTime();
  return Math.floor((t - b) / 86400000);
};

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const STORAGE_PREFIX = "reol-live-quiz-";

type SavedState = {
  guesses: string[]; // 回答したcandidate.key の履歴
  finished: boolean;
  won: boolean;
};

const loadSaved = (dateKey: string): SavedState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (dateKey: string, state: SavedState) => {
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${dateKey}`,
      JSON.stringify(state)
    );
  } catch {
    // ignore
  }
};

const LiveGuessQuizPage: React.FC<PageProps<QuizPageData>> = ({ data }) => {
  const candidates = useMemo(() => {
    const today = todayStr();
    const list: Candidate[] = [];
    for (const live of data.live.liveInfos) {
      for (const item of live.items ?? []) {
        if (!item.date || item.date >= today) continue; // 未来/当日の公演は除外(ネタバレ防止)
        if (!item.place) continue;
        const songs = item.setList.filter(
          (s) => !!s.liveItemSongName && s.type !== "segment"
        );
        if (songs.length === 0) continue; // セトリ未登録の公演は出題しない
        const { prefecture, overseasRegion } = extractPrefecture(
          item.address,
          item.place
        );
        const place = prefecture ?? overseasRegion;
        if (!place) continue;
        list.push({
          key: item.slug,
          label: `${item.date} ${live.title}`,
          title: live.title,
          date: item.date,
          year: parseInt(item.date.slice(0, 4), 10),
          typeLabel: LIVE_TYPE_LABEL[live.type] ?? live.type,
          place,
          firstSongName: songs[0]?.liveItemSongName ?? null,
        });
      }
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const dateKey = useMemo(() => todayStr(), []);

  const answer = useMemo(() => {
    if (candidates.length === 0) return null;
    // "2024-01-01" を基準に日数を経過ごとにインデックスを1つずつ進める、
    // 全員が同じ日には同じ問題になる決定的な選び方。
    const idx =
      ((daysSince("2024-01-01", dateKey) % candidates.length) +
        candidates.length) %
      candidates.length;
    return candidates[idx];
  }, [candidates, dateKey]);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = loadSaved(dateKey);
    if (saved) {
      setGuesses(saved.guesses);
      setFinished(saved.finished);
      setWon(saved.won);
    }
  }, [dateKey]);

  const revealedHints = Math.min(guesses.length + 1, MAX_ATTEMPTS);

  const hints = useMemo(() => {
    if (!answer) return [];
    return [
      `${answer.year}年`,
      answer.typeLabel,
      answer.firstSongName ? `1曲目「${answer.firstSongName}」` : null,
      answer.place,
    ].filter((v): v is string => !!v);
  }, [answer]);

  const submitGuess = () => {
    if (!answer || !selected || finished) return;
    const isCorrect = selected === answer.key;
    const nextGuesses = [...guesses, selected];
    const isFinished = isCorrect || nextGuesses.length >= MAX_ATTEMPTS;
    setGuesses(nextGuesses);
    setSelected("");
    if (isCorrect) setWon(true);
    if (isFinished) setFinished(true);
    saveState(dateKey, {
      guesses: nextGuesses,
      finished: isFinished,
      won: isCorrect,
    });
  };

  const shareText = useMemo(() => {
    if (!finished) return "";
    const squares = guesses
      .map((g) => (g === answer?.key ? "🟩" : "⬜"))
      .join("");
    const dateLabel = dateKey.replaceAll("-", "/");
    return `${dateLabel}  Reol Setlist Wordle\n${squares}${
      won ? "" : " (X)"
    }\n\nhttps://reol.twilightea.com/quiz/live-guess/`;
  }, [finished, guesses, answer, won, dateKey]);

  const handleShare = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sortedCandidates = useMemo(
    () => [...candidates].sort((a, b) => b.date.localeCompare(a.date)),
    [candidates]
  );

  if (!answer) {
    return (
      <Layout title="日替わり公演当てクイズ">
        <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
          <p className="text-sm text-bx-ink3">出題可能な公演データがありません。</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="日替わり公演当てクイズ">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-yellow">DAILY QUIZ</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            日替わり公演当てクイズ
          </h1>
          <p className="text-xs text-bx-ink3">
            ヒントを1つずつ開きながら、今日の過去公演を最大{MAX_ATTEMPTS}
            回で当ててください。挑戦は1日1回、結果は明日更新されます。
          </p>
        </header>

        <section className="mb-5 rounded-lg border border-bx-line bg-bx-surface/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-bx-ink3 tabular-nums">
              {dateKey.replaceAll("-", "/")}
            </span>
            <span className="text-xs text-bx-ink3 tabular-nums">
              {guesses.length} / {MAX_ATTEMPTS}
            </span>
          </div>

          <ul className="space-y-1.5 mb-4">
            {hints.slice(0, revealedHints).map((h, i) => (
              <li key={i} className="text-sm text-bx-ink">
                <span className="text-bx-ink3">ヒント{i + 1}：</span>
                {h}
              </li>
            ))}
          </ul>

          {guesses.length > 0 && (
            <div className="flex gap-1.5 mb-4">
              {guesses.map((g, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                    g === answer.key
                      ? "bg-bx-blue text-bx-bg"
                      : "bg-bx-line/60 text-bx-ink3"
                  }`}
                >
                  {g === answer.key ? "✓" : "×"}
                </span>
              ))}
            </div>
          )}

          {!finished ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-bx-line bg-bx-bg text-bx-ink"
              >
                <option value="">公演を選択...</option>
                {sortedCandidates.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={submitGuess}
                disabled={!selected}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-bx-ink text-bx-bg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                回答する
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p
                className={`text-sm font-bold ${
                  won ? "text-bx-blue" : "text-bx-ink2"
                }`}
              >
                {won
                  ? `正解！ ${guesses.length}回で当てました`
                  : "残念、正解に届きませんでした"}
              </p>
              <div className="rounded-lg border border-bx-line bg-bx-bg/60 p-3">
                <div className="text-[10px] text-bx-ink3 mb-1">正解</div>
                <Link
                  to={`/live/#live-item-${answer.key}`}
                  className="text-sm font-bold text-bx-blueLight hover:text-bx-blue"
                >
                  {answer.title} ({answer.date.replaceAll("-", "/")})
                </Link>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="w-full px-4 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
              >
                {copied ? "コピーしました！" : "結果をコピーして共有"}
              </button>
            </div>
          )}
        </section>

        <p className="text-xs text-bx-ink2">
          <Link
            to="/live/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            LIVE一覧・セトリアーカイブへ →
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default LiveGuessQuizPage;

export const query = graphql`
  query LiveGuessQuizData {
    live {
      liveInfos {
        title
        type
        items {
          slug
          date
          place
          address
          setList {
            liveItemSongName
            type
          }
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="日替わり公演当てクイズ"
    description="ヒントを1つずつ開きながら、今日の過去公演を最大4回で当てるWordle形式の日替わりクイズ。"
    path="/quiz/live-guess/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "日替わり公演当てクイズ", path: "/quiz/live-guess/" },
    ])}
  />
);
