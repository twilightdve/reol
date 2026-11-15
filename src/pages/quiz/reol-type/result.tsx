import React, { useEffect, useState } from "react";
import { navigate, type HeadFC } from "gatsby";
import { useQuizT, quizT, getQuizType } from "../../../data/reol-type/i18n";
import { DEFAULT_LANG, isSiteLang } from "../../../i18n/site/langs";
import { localizePath } from "../../../utils/i18nRoutes";
import { getResult, type Answers } from "../../../data/reol-type/scoring";
import SEO from "../../../components/SEO";
import { ExpandMark, LinkRow } from "../../../components/redesign";
import {
  CompatibilityRows,
  MAIN,
  SectionHeading,
  ShareBlock,
  TypeHeading,
  TypeIntro,
  TypeList,
} from "../../../components/reolType/TypeParts";
import { generateResultShareCard, saveShareImage } from "../../../components/reolType/shareCards";
import { trackOfficialLinkClick } from "../../../utils/analytics";

const STORAGE_KEY = "reol_type_answers";
const SITE_URL = "https://reol.twilightea.com";

// === 軸バランス ===
// 左右の割合を、2つに割った細い線で出す。割合の大きい側を濃くする
const AxisRow = ({ leftPct, leftLabel, rightLabel }: { leftPct: number; leftLabel: string; rightLabel: string }) => {
  const leftWins = leftPct >= 50;
  const strong = "font-bold text-bx-ink";
  const weak = "text-bx-ink3";
  return (
    <div className="border-b border-bx-line py-3">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
        <span className={leftWins ? strong : weak}>
          {leftLabel} <span className="tabular-nums">{leftPct}%</span>
        </span>
        <span className={leftWins ? weak : strong}>
          <span className="tabular-nums">{100 - leftPct}%</span> {rightLabel}
        </span>
      </div>
      <div className="flex h-1 w-full gap-0.5" aria-hidden="true">
        {leftPct > 0 && <div className={leftWins ? "bg-bx-ink" : "bg-bx-ink3/40"} style={{ width: `${leftPct}%` }} />}
        {leftPct < 100 && <div className={`flex-1 ${leftWins ? "bg-bx-ink3/40" : "bg-bx-ink"}`} />}
      </div>
    </div>
  );
};

// === メインコンポーネント ===
const ResultPage = () => {
  const { t, lang } = useQuizT();
  const [result, setResult] = useState<ReturnType<typeof getResult> | null>(null);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      navigate(localizePath("/quiz/reol-type/", lang));
      return;
    }
    const answers: Answers = JSON.parse(stored);
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < 20) {
      navigate(localizePath("/quiz/reol-type/quiz/?q=1", lang));
      return;
    }
    const r = getResult(answers);
    setResult(r);

    // 全ユーザ共通: localStorageにタイプコードを保存
    localStorage.setItem('reol_type_result', r.typeCode);

    // ログイン状態チェック
    const savedProfile = localStorage.getItem('reol_user_profile');
    const isCurrentlyLoggedIn = !!(savedProfile && JSON.parse(savedProfile).id);
    setIsLoggedIn(isCurrentlyLoggedIn);

    // ログイン中ならさらにDBに保存
    try {
      const savedProfile = localStorage.getItem('reol_user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.id) {
          // ローカルプロフィールも更新
          const updated = { ...profile, reol_type: r.typeCode };
          localStorage.setItem('reol_user_profile', JSON.stringify(updated));

          import('../../../lib/supabase').then(({ supabase }) => {
            if (supabase) {
              supabase
                .from('profiles')
                .update({ reol_type: r.typeCode })
                .eq('id', profile.id)
                .then(({ error }) => {
                  if (error) {
                    console.error('Error saving reol_type:', error);
                  }
                });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error saving reol_type:', e);
    }

    // シェアカード生成
    setShareImage(generateResultShareCard(r.typeCode, r.percentages, lang));
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    navigate(localizePath("/quiz/reol-type/", lang));
  };

  const handleShareX = () => {
    if (!result) return;
    const { percentages } = result;
    const localTypeInfo = getQuizType(result.typeCode, lang);
    const text = t('reolType.xShareResult', {
      emoji: localTypeInfo.emoji,
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      summary: localTypeInfo.summary.slice(0, 60) + '…',
      fb: percentages.FB,
      fbR: 100 - percentages.FB,
      ge: percentages.GE,
      geR: 100 - percentages.GE,
      sq: percentages.SQ,
      sqR: 100 - percentages.SQ,
      ai: percentages.AI,
      aiR: 100 - percentages.AI,
      // タイプ別OG画像が出るようタイプ詳細ページのURLを共有する
      url: `${SITE_URL}${localizePath(`/quiz/reol-type/types/${result.typeCode.toLowerCase()}/`, lang)}`,
    });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    if (!shareImage || !result) return;
    void saveShareImage(shareImage, result.typeCode);
  };

  const handleCopyText = () => {
    if (!result) return;
    const localTypeInfo = getQuizType(result.typeCode, lang);
    const text = t('reolType.copyResultText', {
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      url: `${SITE_URL}${localizePath(`/quiz/reol-type/`, lang)}`,
    });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // === アカウント紐付けログイン ===
  const handleLinkLogin = async () => {
    if (!loginId.trim() || !loginPw.trim() || !result) return;
    setLoginError('');
    setLoginLoading(true);
    try {
      const { signInUser } = await import('../../../services/authService');
      const profile = await signInUser(loginId.trim(), loginPw.trim());
      // ログイン成功 → reol_typeをDBに保存
      const { supabase } = await import('../../../lib/supabase');
      if (supabase && profile.id) {
        await supabase
          .from('profiles')
          .update({ reol_type: result.typeCode })
          .eq('id', profile.id);
        // ローカルにもセッション保存
        const updatedProfile = { ...profile, reol_type: result.typeCode };
        localStorage.setItem('reol_user_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('reol_user_session', JSON.stringify({
          id: profile.id,
          username: profile.username,
          createdAt: new Date().toISOString()
        }));
      }
      setLoginSuccess(true);
      setIsLoggedIn(true);
    } catch (e: any) {
      setLoginError(e.message || t('reolType.linkLoginError'));
    } finally {
      setLoginLoading(false);
    }
  };

  if (!result) {
    return (
      <main className={MAIN}>
        <p className="py-16 text-center text-sm text-bx-ink3">{t('reolType.calculating')}</p>
      </main>
    );
  }

  const { percentages, typeCode } = result;
  const typeInfo = getQuizType(typeCode, lang);
  const field =
    "w-full rounded-lg border border-bx-line bg-transparent px-3 py-2.5 text-base text-bx-ink placeholder:text-bx-ink3 transition-colors focus:border-bx-yellow focus:outline-none";
  const plainButton =
    "rounded-lg border border-bx-line px-5 py-3 text-sm font-bold text-bx-ink transition-colors hover:border-bx-ink3";

  return (
    <main className={MAIN}>
      {/* === 結果ヘッダー・引用・サマリー === */}
      <TypeHeading kicker={t('reolType.resultHeader')} typeCode={typeCode} />
      <TypeIntro typeCode={typeCode} />

      {/* === 軸バランス === */}
      <section className="mt-10" aria-labelledby="reol-type-balance">
        <SectionHeading id="reol-type-balance">{t('reolType.yourBalance')}</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
          <AxisRow leftPct={percentages.FB} leftLabel={t('reolType.axisFront')} rightLabel={t('reolType.axisBack')} />
          <AxisRow leftPct={percentages.GE} leftLabel={t('reolType.axisIntense')} rightLabel={t('reolType.axisEmotional')} />
          <AxisRow leftPct={percentages.SQ} leftLabel={t('reolType.axisEvangelize')} rightLabel={t('reolType.axisImmerse')} />
          <AxisRow leftPct={percentages.AI} leftLabel={t('reolType.axisAnalyze')} rightLabel={t('reolType.axisIntuition')} />
        </div>
      </section>

      {/* === 詳細セクション(開閉) === */}
      <section className="mt-10" aria-labelledby="reol-type-detail">
        <h2 id="reol-type-detail" className="border-b border-bx-line">
          <button
            type="button"
            aria-expanded={showDetail}
            aria-controls="reol-type-detail-body"
            onClick={() => setShowDetail(!showDetail)}
            className="group flex w-full items-center justify-between gap-3 pb-2 text-left"
          >
            <span className="text-[17px] font-extrabold tracking-[0.04em] text-bx-ink">{t('reolType.seeMoreDetails')}</span>
            <span className="flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-ink">
              <ExpandMark open={showDetail} />
            </span>
          </button>
        </h2>
        {showDetail && (
          <div id="reol-type-detail-body">
            {typeInfo.sections.map((section, i) => (
              <div key={i} className="border-b border-bx-line py-4">
                <h3 className="mb-1.5 text-[15px] font-bold text-bx-ink">{section.title}</h3>
                <p className="text-[15px] leading-loose text-bx-ink2">{section.body}</p>
              </div>
            ))}
          </div>
        )}
        <ul>
          <LinkRow
            to={`/quiz/reol-type/types/${typeCode.toLowerCase()}/`}
            title={t('reolType.viewTypeDetail', { name: typeInfo.name })}
          />
        </ul>
      </section>

      {/* === 相性 === */}
      <CompatibilityRows typeCode={typeCode} />

      {/* === シェアカードとシェアボタン === */}
      <ShareBlock
        shareImage={shareImage}
        copied={copied}
        primary
        onShareX={handleShareX}
        onSave={handleDownload}
        onCopy={handleCopyText}
      />

      {/* === アカウント紐付けセクション（ゲストユーザー向け） === */}
      {!isLoggedIn && !loginSuccess && (
        <section className="mt-10" aria-labelledby="reol-type-link">
          <SectionHeading id="reol-type-link">{t('reolType.linkAccountTitle')}</SectionHeading>
          <p className="pt-2 text-[12px] leading-relaxed text-bx-ink3">{t('reolType.linkAccountDesc')}</p>
          <div className="mt-3 max-w-sm space-y-2">
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder={t('reolType.linkAccountId')}
              aria-label={t('reolType.linkAccountId')}
              autoComplete="username"
              className={field}
            />
            <input
              type="password"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              placeholder={t('reolType.linkAccountPw')}
              aria-label={t('reolType.linkAccountPw')}
              autoComplete="current-password"
              className={field}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLinkLogin(); }}
            />
            {loginError && (
              <p role="alert" className="text-xs text-red-500">{loginError}</p>
            )}
            <button
              type="button"
              onClick={handleLinkLogin}
              disabled={loginLoading || !loginId.trim() || !loginPw.trim()}
              className={`${plainButton} w-full disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {loginLoading ? t('reolType.linkAccountLoading') : t('reolType.linkAccountButton')}
            </button>
            <p className="pt-1">
              <a
                href="/bijigaku-navi/"
                className="text-[12px] text-bx-ink3 underline underline-offset-2 transition-colors hover:text-bx-ink"
              >
                {t('reolType.noAccountYet')}
              </a>
            </p>
          </div>
        </section>
      )}
      {loginSuccess && (
        <p role="status" className="mt-10 border-y border-bx-line py-4 text-sm font-bold text-bx-ink">
          {t('reolType.linkAccountSuccess')}
        </p>
      )}

      {/* === もう一度 === */}
      <div className="mt-10">
        <button type="button" onClick={handleRetry} className={`${plainButton} w-full sm:w-auto`}>
          {t('reolType.retryDiagnosis')}
        </button>
      </div>

      {/* === 公式CTA === */}
      <section className="mt-10" aria-labelledby="reol-type-official">
        <SectionHeading id="reol-type-official">{t('reolType.officialCtaTitle')}</SectionHeading>
        <p className="pt-2 text-[12px] leading-relaxed text-bx-ink3">{t('reolType.officialCtaDesc')}</p>
        <ul className="mt-2 grid grid-cols-1 border-t border-bx-line sm:grid-cols-2 sm:gap-x-8">
          <LinkRow
            href="https://reol.jp/"
            title={t('reolType.officialSite')}
            desc="reol.jp"
            onClick={() => trackOfficialLinkClick("site")}
          />
          <LinkRow
            href="https://www.youtube.com/@reolch"
            title={t('reolType.officialYoutube')}
            desc="youtube.com/@reolch"
            onClick={() => trackOfficialLinkClick("youtube")}
          />
        </ul>
      </section>

      {/* === 全タイプ一覧 === */}
      <section className="mt-10" aria-labelledby="reol-type-all">
        <SectionHeading id="reol-type-all">{t('reolType.allTypes')}</SectionHeading>
        <TypeList current={typeCode} />
      </section>
    </main>
  );
};

export default ResultPage;

// 言語は pageContext.lang(URL)から決める。i18next を使わないので静的HTMLにキーが露出しない
// 回答(localStorage)が無いと診断トップへ移る画面で、URL だけでは中身が無いため noindex(サイトマップからも除外)
export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = quizT(lang);
  return (
    <>
      <SEO
        title={t("reolType.seoResultTitle")}
        description={t("reolType.seoResultDesc")}
        path="/quiz/reol-type/result/"
        lang={lang}
      />
      <meta name="robots" content="noindex" />
    </>
  );
};
