import React, { useEffect, useState, useCallback, useMemo } from "react";
import { navigate, type HeadFC } from "gatsby";
import { useLocation } from "@reach/router";
import { useQuizT, quizT, getQuizQuestions } from "../../../data/reol-type/i18n";
import { DEFAULT_LANG, isSiteLang } from "../../../i18n/site/langs";
import { localizePath } from "../../../utils/i18nRoutes";
import { questions as baseQuestions } from "../../../data/reol-type/questions";
import SEO from "../../../components/SEO";
import { Kicker } from "../../../components/redesign";

const TOTAL = baseQuestions.length;
const STORAGE_KEY = "reol_type_answers";

const QuizPage = () => {
  const { t, lang } = useQuizT();
  const questions = useMemo(() => getQuizQuestions(lang), [lang]);
  const location = useLocation();
  // 静的HTMLは1問目で生成されるため、?q= はマウント後に反映する(直接 ?q=5 を開いたときの
  // ハイドレーション不一致 React #418/#423 を避ける)
  const [qParam, setQParam] = useState(1);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setQParam(Math.max(1, Math.min(TOTAL, parseInt(query.get("q") || "1", 10) || 1)));
  }, [location.search]);
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
        navigate(localizePath("/quiz/reol-type/result/", lang));
      } else {
        navigate(localizePath(`/quiz/reol-type/quiz/?q=${qParam + 1}`, lang));
      }
      setIsAnimating(false);
      setSelected(null);
    }, 400);
  }, [isAnimating, answers, question, qParam, lang]);

  const handleBack = () => {
    if (qParam > 1) {
      navigate(localizePath(`/quiz/reol-type/quiz/?q=${qParam - 1}`, lang));
    } else {
      navigate(localizePath("/quiz/reol-type/", lang));
    }
  };

  if (!question) return null;

  const options = [
    { choice: 'A' as const, text: question.optionA.text },
    { choice: 'B' as const, text: question.optionB.text },
  ];

  return (
    <main className="container mx-auto min-h-[70svh] max-w-xl px-3 py-4 text-bx-ink sm:px-4">
      {/* 戻る + 進み具合 */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="-ml-1 flex items-center gap-1 px-1 py-2 text-xs text-bx-ink3 transition-colors hover:text-bx-ink"
          >
            <span aria-hidden="true">←</span>
            <span>{qParam > 1 ? t('reolType.prevQuestion') : t('reolType.back')}</span>
          </button>
          <span className="text-xs tabular-nums text-bx-ink2">
            {qParam} / {TOTAL}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={qParam}
          className="h-[3px] w-full overflow-hidden bg-bx-line"
        >
          <div
            className="h-full origin-left bg-bx-yellow transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${qParam / TOTAL})` }}
          />
        </div>
      </div>

      {/* 質問と選択肢 */}
      <div
        className={`transition-[opacity,transform] duration-300 ${
          fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <Kicker color="text-bx-blue" className="mb-3">
          QUESTION {String(qParam).padStart(2, '0')}
        </Kicker>
        <h1 className="mb-8 text-xl font-bold leading-relaxed text-bx-ink sm:text-2xl sm:leading-relaxed">
          {question.text}
        </h1>

        <div className="space-y-3">
          {options.map(({ choice, text }) => {
            const isSelected = selected === choice;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleSelect(choice)}
                disabled={isAnimating}
                aria-pressed={isSelected}
                className={`flex w-full items-baseline gap-4 rounded-lg border px-4 py-4 text-left transition-colors ${
                  isSelected ? 'border-bx-yellow text-bx-yellow' : 'border-bx-line text-bx-ink hover:border-bx-ink3'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 text-[11px] font-extrabold tracking-[0.2em] ${
                    isSelected ? 'text-bx-yellow' : 'text-bx-ink3'
                  }`}
                >
                  {choice}
                </span>
                <span className="text-[15px] leading-relaxed">{text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default QuizPage;

// 言語は pageContext.lang(URL)から決める。i18next を使わないので静的HTMLにキーが露出しない
export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = quizT(lang);
  return (
    <SEO
      title={t("reolType.seoQuizTitle")}
      description={t("reolType.seoQuizDesc")}
      path="/quiz/reol-type/quiz/"
      lang={lang}
    />
  );
};
