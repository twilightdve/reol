import React, { useEffect, useState } from "react";
import { navigate, Link, type HeadFC } from "gatsby";
import { useTranslation } from "react-i18next";
import { reolTypes, getLocalizedType, typeGroups, getLocalizedTypeGroup, type TypeCode, type GroupCode } from "../../../data/reol-type/types";
import SEO from "../../../components/SEO";
import jaCommon from "../../../i18n/locales/ja/common.json";

// === タイプ分布マトリクス ===
const TYPE_MATRIX: { group: GroupCode; codes: TypeCode[] }[] = [
  { group: 'FG', codes: ['FGSA', 'FGSI', 'FGQA', 'FGQI'] },
  { group: 'FE', codes: ['FESA', 'FESI', 'FEQA', 'FEQI'] },
  { group: 'BG', codes: ['BGSA', 'BGSI', 'BGQA', 'BGQI'] },
  { group: 'BE', codes: ['BESA', 'BESI', 'BEQA', 'BEQI'] },
];

const TypeDistributionMatrix = ({ lang }: { lang: string }) => {
  const { t } = useTranslation('common');
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('../../../lib/supabase').then(({ supabase }) => {
      if (!supabase) { setLoading(false); return; }
      supabase
        .from('profiles')
        .select('reol_type')
        .not('reol_type', 'is', null)
        .then(({ data, error }) => {
          if (error || !data) { setLoading(false); return; }
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
          setLoading(false);
        });
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
        <div className="animate-pulse text-gray-500 text-sm">{t('reolType.loadingDistribution')}</div>
      </div>
    );
  }

  if (total === 0) return null;

  const maxCount = Math.max(1, ...Object.values(distribution));

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <h3 className="text-sm font-bold text-gray-300 mb-1">{t('reolType.distributionTitle')}</h3>
      <p className="text-xs text-gray-500 mb-4">{t('reolType.distributionSub', { count: total })}</p>

      {/* 列ヘッダー */}
      <div className="grid grid-cols-[56px_1fr_1fr_1fr_1fr] gap-1.5 mb-1">
        <div />
        <div className="text-center text-[10px] text-gray-500">📢🔍</div>
        <div className="text-center text-[10px] text-gray-500">📢💫</div>
        <div className="text-center text-[10px] text-gray-500">🎧🔍</div>
        <div className="text-center text-[10px] text-gray-500">🎧💫</div>
      </div>

      {/* マトリクス本体 */}
      <div className="space-y-1.5">
        {TYPE_MATRIX.map(({ group, codes }) => {
          const g = getLocalizedTypeGroup(group, lang);
          return (
            <div key={group} className="grid grid-cols-[56px_1fr_1fr_1fr_1fr] gap-1.5">
              {/* 行ヘッダー */}
              <div className="flex items-center justify-center text-[10px] text-gray-400 leading-tight">
                <span>{g.emoji}</span>
              </div>
              {/* 4セル */}
              {codes.map((code) => {
                const count = distribution[code] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const intensity = count / maxCount;
                const rt = reolTypes[code];
                const localRt = getLocalizedType(code, lang);
                return (
                  <Link
                    key={code}
                    to={`/quiz/reol-type/types/${code.toLowerCase()}/`}
                    className="relative rounded-lg p-1.5 text-center transition-all hover:scale-105 hover:z-10 border border-white/5 hover:border-white/20 group"
                    style={{
                      backgroundColor: `${rt.color}${Math.round(intensity * 40 + 8).toString(16).padStart(2, '0')}`,
                    }}
                  >
                    <div className="text-base leading-none">{rt.emoji}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 truncate">{localRt.name}</div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: rt.color }}>
                      {count > 0 ? `${pct}%` : '—'}
                    </div>
                    {/* バー */}
                    <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: rt.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 軸ラベル説明 */}
      <div className="mt-4 flex justify-between text-[10px] text-gray-600">
        <div>← {t('reolType.axisEvangelize')}・{t('reolType.axisAnalyze')}</div>
        <div>{t('reolType.axisImmerse')}・{t('reolType.axisIntuition')} →</div>
      </div>
    </div>
  );
};

const ReolTypeIntroPage = () => {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language || 'ja';
  const [prevType, setPrevType] = useState<TypeCode | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // ゲスト判定
    setIsGuest(!localStorage.getItem('reol_user_profile'));
    // 前回の診断結果を取得（ゲスト・ログインユーザ共通）
    try {
      // 1. 共通キーから取得
      const savedResult = localStorage.getItem('reol_type_result');
      if (savedResult && reolTypes[savedResult as TypeCode]) {
        setPrevType(savedResult as TypeCode);
        return;
      }
      // 2. ログインユーザのプロフィールから取得
      const savedProfile = localStorage.getItem('reol_user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.reol_type && reolTypes[profile.reol_type as TypeCode]) {
          setPrevType(profile.reol_type as TypeCode);
          return;
        }
      }
      // 3. 回答データから再計算
      const stored = localStorage.getItem('reol_type_answers');
      if (stored) {
        const answers = JSON.parse(stored);
        if (Object.keys(answers).length >= 20) {
          const { getResult } = require('../../../data/reol-type/scoring');
          const r = getResult(answers);
          setPrevType(r.typeCode);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleStart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("reol_type_answers");
    }
    navigate("/quiz/reol-type/quiz/?q=1");
  };

  const prevTypeInfo = prevType ? getLocalizedType(prevType, lang) : null;

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-[#0a0a1a] via-[#111133] to-[#0a0a1a] text-white font-sans">
      {/* 装飾パーティクル */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-40 right-16 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-pink-400 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-60 right-8 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* タイトル */}
        <div className="space-y-2">
          <p className="text-sm tracking-[0.3em] text-gray-400 uppercase">{t('reolType.headerSub')}</p>
          <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent" dangerouslySetInnerHTML={{ __html: t('reolType.title').replace(/\n/g, '<br />') }} />
        </div>

        {/* 4軸の紹介 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
            <div className="text-lg mb-1">🔥 ⇄ 🌊</div>
            <div className="text-gray-300">{t('reolType.axisLiveStyle')}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('reolType.axisLiveStyleSub')}</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
            <div className="text-lg mb-1">🎸 ⇄ 🎹</div>
            <div className="text-gray-300">{t('reolType.axisMusicTaste')}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('reolType.axisMusicTasteSub')}</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
            <div className="text-lg mb-1">📢 ⇄ 🎧</div>
            <div className="text-gray-300">{t('reolType.axisFanActivity')}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('reolType.axisFanActivitySub')}</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
            <div className="text-lg mb-1">🔍 ⇄ 💫</div>
            <div className="text-gray-300">{t('reolType.axisObsession')}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t('reolType.axisObsessionSub')}</div>
          </div>
        </div>

        {/* 説明 */}
        <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('reolType.description').replace(/\n/g, '<br />') }} />

        {/* 開始ボタン */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl font-bold text-lg tracking-wider bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:from-purple-700 active:to-blue-700 transition-all duration-200 shadow-lg shadow-purple-900/30"
        >
          {t('reolType.startButton')}
        </button>

        <p className="text-xs text-gray-600">
          {t('reolType.duration')}
        </p>

        {/* ログイン誘導（未ログインユーザー向け） */}
        {isGuest && (
          <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10 text-left">
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">💡</span>
              <div>
                <p className="text-xs text-gray-400 leading-relaxed">{t('reolType.loginHint')}</p>
                <a
                  href="/bijigaku-navi/"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>→</span>
                  <span>{t('reolType.goToNavi')}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 前回の診断結果 */}
        {prevTypeInfo && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-500 mb-2">{t('reolType.previousResult')}</p>
            <Link
              to={`/quiz/reol-type/types/${prevType!.toLowerCase()}/`}
              className="flex items-center justify-center gap-3 hover:bg-white/5 rounded-lg p-2 -m-1 transition-colors"
            >
              <span className="text-3xl">{prevTypeInfo.emoji}</span>
              <div className="text-left">
                <div className="font-bold text-white">{prevTypeInfo.name}</div>
                <div className="text-xs" style={{ color: prevTypeInfo.color }}>♪ {prevTypeInfo.songLabel}</div>
              </div>
            </Link>
            <Link
              to="/quiz/reol-type/result/"
              className="block mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {t('reolType.viewDetailedResult')}
            </Link>
          </div>
        )}

        {/* 全タイプ一覧 */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-3">{t('reolType.viewAllTypes')}</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(reolTypes).map((rt) => {
              const localRt = getLocalizedType(rt.code, lang);
              return (
                <Link
                  key={rt.code}
                  to={`/quiz/reol-type/types/${rt.code.toLowerCase()}/`}
                  className="text-center p-2 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors"
                >
                  <div className="text-lg">{rt.emoji}</div>
                  <div className="text-gray-400 mt-0.5 truncate">{localRt.name}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* タイプ分布マトリクス */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <TypeDistributionMatrix lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default ReolTypeIntroPage;

// NOTE: SSG ビルド時は i18n の初期化順によって t() が翻訳キーを
// そのまま返し <title> に露出することがあるため、Head では
// ランタイムの t() を使わず ja ロケールを直接参照する。
export const Head: HeadFC = () => (
  <SEO
    title={jaCommon.reolType.seoIntroTitle}
    description={jaCommon.reolType.seoIntroDesc}
    path="/quiz/reol-type/"
  />
);
