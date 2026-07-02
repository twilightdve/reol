import React, { useEffect, useState, useCallback } from "react";
import { navigate, type HeadFC } from "gatsby";
import { useLocation } from "@reach/router";
import { useTranslation } from "react-i18next";
import { questions } from "../../../data/reol-type/questions";
import SEO from "../../../components/SEO";
import jaCommon from "../../../i18n/locales/ja/common.json";

const TOTAL = questions.length;
const STORAGE_KEY = "reol_type_answers";

const QuizPage = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const qParam = Math.max(1, Math.min(TOTAL, parseInt(query.get("q") || "1", 10)));
  const question = questions[qParam - 1];

  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  // 初期ロード: localStorageから回答を復元
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setAnswers(stored);
  }, []);

  // 質問変更時のフェードイン
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [qParam]);

  // 既に回答済みの質問ならselectedを復元
  useEffect(() => {
    setSelected(answers[question?.id] || null);
  }, [qParam, answers]);

  const handleSelect = useCallback((choice: 'A' | 'B') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelected(choice);

    const updated = { ...answers, [question.id]: choice };
    setAnswers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    setTimeout(() => {
      if (qParam === TOTAL) {
        navigate("/quiz/reol-type/result/");
      } else {
        navigate(`/quiz/reol-type/quiz/?q=${qParam + 1}`);
      }
      setIsAnimating(false);
      setSelected(null);
    }, 400);
  }, [isAnimating, answers, question, qParam]);

  const handleBack = () => {
    if (qParam > 1) {
      navigate(`/quiz/reol-type/quiz/?q=${qParam - 1}`);
    } else {
      navigate("/quiz/reol-type/");
    }
  };

  if (!question) return null;

  const progress = (qParam / TOTAL) * 100;

  return (
    <div className="min-h-svh flex flex-col px-4 py-6 bg-gradient-to-b from-[#0a0a1a] via-[#111133] to-[#0a0a1a] text-white font-sans">
      <div className="max-w-md w-full mx-auto flex flex-col flex-1">
        {/* ヘッダー: 戻る + プログレス */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <span>←</span>
              <span>{qParam > 1 ? t('reolType.prevQuestion') : t('reolType.back')}</span>
            </button>
            <span className="text-sm text-gray-400 tabular-nums">
              {qParam} / {TOTAL}
            </span>
          </div>
          {/* プログレスバー */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 質問テキスト */}
        <div
          className={`flex-1 flex flex-col justify-center transition-all duration-300 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <h2 className="text-lg font-bold leading-relaxed mb-8 text-center">
            {question.text}
          </h2>

          {/* 選択肢 */}
          <div className="space-y-4">
            {/* 選択肢A */}
            <button
              onClick={() => handleSelect('A')}
              disabled={isAnimating}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selected === 'A'
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-900/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{question.optionA.icon}</span>
                <span className="text-sm leading-relaxed">{question.optionA.text}</span>
              </div>
            </button>

            {/* 選択肢B */}
            <button
              onClick={() => handleSelect('B')}
              disabled={isAnimating}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selected === 'B'
                  ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-900/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{question.optionB.icon}</span>
                <span className="text-sm leading-relaxed">{question.optionB.text}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

// NOTE: SSG ビルド時の i18n 初期化順による翻訳キー露出を避けるため
// Head では t() を使わず ja ロケールを直接参照する。
export const Head: HeadFC = () => (
  <SEO
    title={jaCommon.reolType.seoQuizTitle}
    description={jaCommon.reolType.seoQuizDesc}
    path="/quiz/reol-type/quiz/"
  />
);
