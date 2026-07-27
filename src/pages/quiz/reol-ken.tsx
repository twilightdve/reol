/**
 * /quiz/reol-ken/ — 新規コンテンツ案B「Reol検定」(plan/legit-improvement-plan.md 5章)
 *
 * 問題はDB(楽曲統計・ディスコグラフィ・ライブ)から自動生成する(src/utils/reolKentei.ts)。
 * 5級〜1級。上位級ほど問題数・合格ラインが上がり、出題対象も
 * マニアックな(演奏回数が少ない/リリースが古い)側に寄る。
 */
import React, { useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import {
  generateKenteiQuestions,
  KenteiPool,
  KenteiQuestion,
} from "../../utils/reolKentei";
import { buildBreadcrumbList } from "../../utils/jsonLd";

type QuizPageData = {
  songStats: {
    songStats: {
      songName: string;
      totalPlays: number;
      firstPlayedDate: string | null;
    }[];
  };
  discography: {
    discographyWithSongs: {
      title: string;
      releaseDate: string | null;
      format: string | null;
    }[];
  };
  live: {
    liveInfos: { title: string; type: string }[];
  };
};

type Grade = {
  id: number;
  label: string;
  questionCount: number;
  passCount: number;
  pool: KenteiPool;
  description: string;
};

const GRADES: Grade[] = [
  {
    id: 5,
    label: "5級",
    questionCount: 5,
    passCount: 4,
    pool: "easy",
    description: "定番曲・最近のリリースが中心。まずはここから。",
  },
  {
    id: 4,
    label: "4級",
    questionCount: 6,
    passCount: 5,
    pool: "easy",
    description: "よく知られた曲・公演が中心。",
  },
  {
    id: 3,
    label: "3級",
    questionCount: 8,
    passCount: 6,
    pool: "all",
    description: "定番からレアまで満遍なく出題。",
  },
  {
    id: 2,
    label: "2級",
    questionCount: 10,
    passCount: 8,
    pool: "all",
    description: "全楽曲・全リリースが出題対象。",
  },
  {
    id: 1,
    label: "1級",
    questionCount: 12,
    passCount: 10,
    pool: "hard",
    description: "演奏回数が少ない曲・古いリリースが中心。マニア向け。",
  },
];

type Phase = "select" | "quiz" | "result";

const drawCertificate = (grade: Grade, score: number, total: number) => {
  const DPR = 2;
  const W = 600;
  const H = 400;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(DPR, DPR);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#E2BF57";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  ctx.textAlign = "center";
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("!LEGIT PRESENTS", W / 2, 80);

  ctx.fillStyle = "#E2BF57";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("Reol検定", W / 2, 150);

  ctx.fillStyle = "#F9FAFB";
  ctx.font = "bold 64px sans-serif";
  ctx.fillText(`${grade.label} 合格`, W / 2, 230);

  ctx.fillStyle = "#D1D5DB";
  ctx.font = "16px sans-serif";
  ctx.fillText(`正答 ${score} / ${total} 問`, W / 2, 270);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  ctx.fillStyle = "#6B7280";
  ctx.font = "13px sans-serif";
  ctx.fillText(`issued ${dateStr}`, W / 2, 340);
  ctx.fillText("reol.twilightea.com/quiz/reol-ken/", W / 2, 362);

  return canvas;
};

const ReolKenteiPage: React.FC<PageProps<QuizPageData>> = ({ data }) => {
  const songs = useMemo(
    () =>
      data.songStats.songStats.filter((s) => s.totalPlays > 0),
    [data]
  );
  const discs = data.discography.discographyWithSongs;
  const lives = data.live.liveInfos;

  const [phase, setPhase] = useState<Phase>("select");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [questions, setQuestions] = useState<KenteiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const startGrade = (g: Grade) => {
    const qs = generateKenteiQuestions(
      songs,
      discs,
      lives,
      g.pool,
      g.questionCount
    );
    if (qs.length === 0) return;
    setGrade(g);
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setDownloaded(false);
    setPhase("quiz");
  };

  const current = questions[currentIndex];

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelectedOption(i);
    setAnswered(true);
    if (i === current.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setPhase("result");
    }
  };

  const passed = grade ? score >= grade.passCount : false;

  const handleDownload = () => {
    if (!grade) return;
    const canvas = drawCertificate(grade, score, questions.length);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reol-kentei-${grade.id}kyu.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloaded(true);
    }, "image/png");
  };

  return (
    <Layout title="Reol検定">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-yellow">CERTIFICATION</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            Reol検定
          </h1>
          <p className="text-xs text-bx-ink3">
            楽曲・ライブのデータから毎回自動出題。5級〜1級、上位級ほどマニアックです。
          </p>
        </header>

        {phase === "select" && (
          <ul className="space-y-2">
            {GRADES.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => startGrade(g)}
                  className="w-full text-left rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-bx-ink">
                      {g.label}
                    </span>
                    <span className="text-xs text-bx-ink3 tabular-nums">
                      全{g.questionCount}問 ・ {g.passCount}問正解で合格
                    </span>
                  </div>
                  <p className="text-xs text-bx-ink2">{g.description}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {phase === "quiz" && grade && current && (
          <section>
            <div className="flex items-center justify-between mb-3 text-xs text-bx-ink3">
              <span>{grade.label}</span>
              <span className="tabular-nums">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-4 mb-4">
              <p className="text-base font-bold text-bx-ink mb-4">
                {current.question}
              </p>
              <div className="space-y-2">
                {current.options.map((opt, i) => {
                  const isCorrect = i === current.correctIndex;
                  const isSelected = i === selectedOption;
                  let cls =
                    "w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ";
                  if (!answered) {
                    cls += "border-bx-line hover:border-bx-blue";
                  } else if (isCorrect) {
                    cls += "border-bx-blue bg-bx-blue/10 text-bx-blue font-bold";
                  } else if (isSelected) {
                    cls += "border-red-400 bg-red-400/10 text-red-400";
                  } else {
                    cls += "border-bx-line opacity-50";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(i)}
                      className={cls}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            {answered && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full px-4 py-2 text-sm font-bold rounded-lg bg-bx-ink text-bx-bg"
              >
                {currentIndex + 1 < questions.length ? "次の問題へ" : "結果を見る"}
              </button>
            )}
          </section>
        )}

        {phase === "result" && grade && (
          <section className="space-y-4">
            <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-5 text-center">
              <p className="text-xs text-bx-ink3 mb-1">{grade.label}</p>
              <p
                className={`text-2xl font-bold mb-2 ${
                  passed ? "text-bx-blue" : "text-bx-ink2"
                }`}
              >
                {passed ? "合格！" : "不合格"}
              </p>
              <p className="text-sm text-bx-ink2">
                正答 {score} / {questions.length} 問(合格ライン {grade.passCount}
                問)
              </p>
            </div>

            {passed && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full px-4 py-2 text-sm font-bold rounded-lg border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
              >
                {downloaded ? "認定証を保存しました" : "認定証を画像で保存"}
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => startGrade(grade)}
                className="flex-1 px-4 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
              >
                同じ級に再挑戦
              </button>
              <button
                type="button"
                onClick={() => setPhase("select")}
                className="flex-1 px-4 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
              >
                級を選び直す
              </button>
            </div>
          </section>
        )}

        <p className="mt-6 text-xs text-bx-ink2">
          <Link
            to="/songs/stats/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            楽曲統計を見る →
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default ReolKenteiPage;

export const query = graphql`
  query ReolKenteiData {
    songStats {
      songStats {
        songName
        totalPlays
        firstPlayedDate
      }
    }
    discography {
      discographyWithSongs {
        title
        releaseDate
        format
      }
    }
    live {
      liveInfos {
        title
        type
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="Reol検定"
    description="楽曲・ライブのデータから自動出題されるReol検定。5級〜1級、上位級ほどマニアックな問題に挑戦できます。"
    path="/quiz/reol-ken/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "Reol検定", path: "/quiz/reol-ken/" },
    ])}
  />
);
