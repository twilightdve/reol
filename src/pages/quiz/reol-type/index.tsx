import React, { useEffect, useState } from "react";
import { navigate, type HeadFC } from "gatsby";
import { useQuizT, quizT, getQuizType } from "../../../data/reol-type/i18n";
import { DEFAULT_LANG, isSiteLang, type SiteLang } from "../../../i18n/site/langs";
import { localizePath } from "../../../utils/i18nRoutes";
import { reolTypes, type TypeCode } from "../../../data/reol-type/types";
import SEO from "../../../components/SEO";
import { Kicker, LinkRow } from "../../../components/redesign";
import { MAIN, SectionHeading, TypeList } from "../../../components/reolType/TypeParts";
import { trackEvent } from "../../../utils/analytics";

// 辞書の題・説明は旧デザインの改行位置(\n)を持っている。1行につなぐ(日本語・中国語は空白を入れない)
const joinLines = (text: string, lang: SiteLang) => text.replace(/\n/g, lang === "en" || lang === "ko" ? " " : "");

// 診断済みの人のタイプ分布(アカウントに保存された結果)。読めた時だけ一覧の右に割合を出す
const useTypeDistribution = () => {
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState(false);
  // 再試行用カウンタ
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLoadError(false);
    const onError = () => {
      setLoadError(true);
      trackEvent("data_load_error", { category: "data", label: "reol_type_distribution" });
    };
    import("../../../lib/supabase")
      .then(({ supabase }) => {
        // supabase 未設定時はエラーではなく、割合を出さないだけにする
        if (!supabase) return;
        return supabase
          .from("profiles")
          .select("reol_type")
          .not("reol_type", "is", null)
          .then(({ data, error }) => {
            if (error || !data) {
              onError();
              return;
            }
            const counts: Record<string, number> = {};
            let count = 0;
            for (const row of data) {
              if (row.reol_type && reolTypes[row.reol_type as TypeCode]) {
                counts[row.reol_type] = (counts[row.reol_type] || 0) + 1;
                count++;
              }
            }
            setDistribution(counts);
            setTotal(count);
          });
      })
      .catch(onError);
  }, [attempt]);

  return { distribution, total, loadError, retry: () => setAttempt((v) => v + 1) };
};

const ReolTypeIntroPage = () => {
  const { t, lang } = useQuizT();
  const [prevType, setPrevType] = useState<TypeCode | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const { distribution, total, loadError, retry } = useTypeDistribution();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // ゲスト判定
    setIsGuest(!localStorage.getItem("reol_user_profile"));
    // 前回の診断結果を取得（ゲスト・ログインユーザ共通）
    try {
      // 1. 共通キーから取得
      const savedResult = localStorage.getItem("reol_type_result");
      if (savedResult && reolTypes[savedResult as TypeCode]) {
        setPrevType(savedResult as TypeCode);
        return;
      }
      // 2. ログインユーザのプロフィールから取得
      const savedProfile = localStorage.getItem("reol_user_profile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.reol_type && reolTypes[profile.reol_type as TypeCode]) {
          setPrevType(profile.reol_type as TypeCode);
          return;
        }
      }
      // 3. 回答データから再計算
      const stored = localStorage.getItem("reol_type_answers");
      if (stored) {
        const answers = JSON.parse(stored);
        if (Object.keys(answers).length >= 20) {
          const { getResult } = require("../../../data/reol-type/scoring");
          const r = getResult(answers);
          setPrevType(r.typeCode);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleStart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("reol_type_answers");
    }
    navigate(localizePath("/quiz/reol-type/quiz/?q=1", lang));
  };

  const prevTypeInfo = prevType ? getQuizType(prevType, lang) : null;
  const axes = [
    { name: t("reolType.axisLiveStyle"), sub: t("reolType.axisLiveStyleSub") },
    { name: t("reolType.axisMusicTaste"), sub: t("reolType.axisMusicTasteSub") },
    { name: t("reolType.axisFanActivity"), sub: t("reolType.axisFanActivitySub") },
    { name: t("reolType.axisObsession"), sub: t("reolType.axisObsessionSub") },
  ];
  // 並列の区切り(日本語・中国語は全角コロン)
  const colon = lang === "en" || lang === "ko" ? ": " : "：";

  return (
    <main className={MAIN}>
      <header className="mb-6">
        <Kicker color="text-bx-blue" className="mb-2">
          FAN TYPE QUIZ
        </Kicker>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-bx-ink sm:text-3xl">
          {joinLines(t("reolType.title"), lang)}
        </h1>
        <p className="text-sm leading-relaxed text-bx-ink2">{joinLines(t("reolType.description"), lang)}</p>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-lg bg-bx-yellow px-8 py-3.5 text-[15px] font-extrabold tracking-[0.04em] text-bx-bg transition-opacity hover:opacity-90 sm:w-auto"
        >
          {t("reolType.startButton")}
        </button>
        <p className="text-xs text-bx-ink3">{t("reolType.duration")}</p>
      </div>

      {/* 前回の診断結果 */}
      {prevTypeInfo && (
        <section className="mt-10" aria-labelledby="reol-type-prev">
          <SectionHeading id="reol-type-prev">{t("reolType.previousResult")}</SectionHeading>
          <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
            <LinkRow
              to={`/quiz/reol-type/types/${prevType!.toLowerCase()}/`}
              title={prevTypeInfo.name}
              desc={prevTypeInfo.songLabel}
            />
            <LinkRow to="/quiz/reol-type/result/" title={t("reolType.viewDetailedResult")} />
          </ul>
        </section>
      )}

      {/* 4軸の紹介 */}
      <section className="mt-10" aria-labelledby="reol-type-axes">
        <SectionHeading id="reol-type-axes">{t("reolType.axesHeading")}</SectionHeading>
        <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
          {axes.map((axis) => (
            <div key={axis.name} className="flex items-baseline justify-between gap-3 border-b border-bx-line py-3">
              <dt className="text-[15px] font-bold text-bx-ink">{axis.name}</dt>
              <dd className="text-right text-[12px] text-bx-ink3">{axis.sub}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 全タイプ一覧(読めた時は、診断済みの人の中での割合も出す) */}
      <section className="mt-10" aria-labelledby="reol-type-all">
        <SectionHeading id="reol-type-all">{t("reolType.allTypes")}</SectionHeading>
        {total > 0 && (
          <p className="pt-2 text-[12px] leading-relaxed text-bx-ink3">
            {t("reolType.distributionTitle")}
            {colon}
            {t("reolType.distributionSub", { count: total })}
          </p>
        )}
        {loadError && (
          <p role="alert" className="pt-2 text-[12px] leading-relaxed text-bx-ink3">
            {t("reolType.distributionError")}{" "}
            <button
              type="button"
              onClick={retry}
              className="font-bold text-bx-ink2 underline underline-offset-2 transition-colors hover:text-bx-ink"
            >
              {t("reolType.retry")}
            </button>
          </p>
        )}
        <TypeList current={prevType} distribution={distribution} total={total} />
      </section>

      {/* ログイン誘導（未ログインユーザー向け） */}
      {isGuest && (
        <p className="mt-10 text-[12px] leading-relaxed text-bx-ink3">
          {t("reolType.loginHint")}{" "}
          <a
            href="/bijigaku-navi/"
            className="font-bold text-bx-ink2 underline underline-offset-2 transition-colors hover:text-bx-ink"
          >
            {t("reolType.goToNavi")}
          </a>
        </p>
      )}
    </main>
  );
};

export default ReolTypeIntroPage;

// 言語は pageContext.lang(URL)から決める。i18next を使わないので静的HTMLにキーが露出しない
export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = quizT(lang);
  return (
    <SEO
      title={t("reolType.seoIntroTitle")}
      description={t("reolType.seoIntroDesc")}
      path="/quiz/reol-type/"
      lang={lang}
    />
  );
};
