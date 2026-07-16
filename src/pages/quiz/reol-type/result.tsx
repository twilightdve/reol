import React, { useEffect, useState, useRef, useCallback } from "react";
import { navigate, Link, type HeadFC } from "gatsby";
import { useTranslation } from "react-i18next";
import { getResult, type Answers } from "../../../data/reol-type/scoring";
import { axisLabels, typeGroups, reolTypes, getLocalizedType, getLocalizedTypeGroup, getLocalizedAxisLabels, type TypeCode } from "../../../data/reol-type/types";
import SEO from "../../../components/SEO";
import jaCommon from "../../../i18n/locales/ja/common.json";
import { trackOfficialLinkClick } from "../../../utils/analytics";

const STORAGE_KEY = "reol_type_answers";
const SITE_URL = "https://reol.twilightea.com";

// === タイプ別カラー計算 ===
function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function getTypeBgStyle(color: string) {
  const { r, g, b } = hexToRgb(color);
  const from = `rgb(${Math.round(r * 0.06 + 6)}, ${Math.round(g * 0.06 + 6)}, ${Math.round(b * 0.06 + 10)})`;
  const via = `rgb(${Math.round(r * 0.18 + 8)}, ${Math.round(g * 0.18 + 8)}, ${Math.round(b * 0.18 + 14)})`;
  return {
    background: `linear-gradient(to bottom, ${from}, ${via}, ${from})`,
  };
}

// === 軸バランスバー ===
const AxisBar = ({ axisKey, leftPct, leftLabel, rightLabel, leftEmoji, rightEmoji }: {
  axisKey: string;
  leftPct: number;
  leftLabel: string;
  rightLabel: string;
  leftEmoji: string;
  rightEmoji: string;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-gray-400">
      <span>{leftEmoji} {leftLabel}</span>
      <span>{rightLabel} {rightEmoji}</span>
    </div>
    <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700"
        style={{ width: `${leftPct}%` }}
      />
    </div>
    <div className="flex justify-between text-xs text-gray-500">
      <span>{leftPct}%</span>
      <span>{100 - leftPct}%</span>
    </div>
  </div>
);

// === シェアカード生成 ===
function generateShareCard(
  typeCode: TypeCode,
  percentages: { FB: number; GE: number; SQ: number; AI: number },
  lang: string = 'ja'
): Promise<string> {
  return new Promise((resolve) => {
    const DPR = 2;
    const W = 600;
    const H = 315;
    const canvas = document.createElement("canvas");
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    const typeInfo = getLocalizedType(typeCode, lang);
    const group = getLocalizedTypeGroup(typeInfo.group, lang);
    const localAxisLabels = getLocalizedAxisLabels(lang);

    // 背景グラデーション（タイプ別）
    const { r, g, b } = hexToRgb(typeInfo.color);
    const darkFrom = `rgb(${Math.round(r * 0.06 + 6)}, ${Math.round(g * 0.06 + 6)}, ${Math.round(b * 0.06 + 10)})`;
    const darkVia = `rgb(${Math.round(r * 0.18 + 8)}, ${Math.round(g * 0.18 + 8)}, ${Math.round(b * 0.18 + 14)})`;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, darkFrom);
    bg.addColorStop(0.5, darkVia);
    bg.addColorStop(1, darkFrom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 装飾ライン
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 50 + i * 60);
      ctx.lineTo(W, 50 + i * 60);
      ctx.stroke();
    }

    // カラーアクセント
    const accentGrad = ctx.createRadialGradient(W * 0.8, H * 0.3, 0, W * 0.8, H * 0.3, 200);
    accentGrad.addColorStop(0, `${typeInfo.color}20`);
    accentGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, W, H);

    // テキスト描画
    const font = (size: number, weight = '400') => `${weight} ${size}px -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif`;

    // ヘッダー
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = font(11);
    ctx.textAlign = 'left';
    ctx.fillText('Reol Fan Type Diagnosis', 32, 36);

    // タイプコード
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = font(14, '500');
    ctx.textAlign = 'left';
    ctx.fillText(typeCode, 32, 70);

    // タイプ名 + Emoji
    ctx.fillStyle = '#ffffff';
    ctx.font = font(36, '700');
    ctx.fillText(`${typeInfo.emoji} ${typeInfo.name}`, 32, 115);

    // 楽曲名
    ctx.fillStyle = typeInfo.color;
    ctx.font = font(16, '500');
    ctx.fillText(`♪ ${typeInfo.songLabel}`, 32, 145);

    // グループ
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = font(12);
    ctx.fillText(`${group.emoji} ${group.name}`, 32, 170);

    // 軸バーの描画
    const axes = [
      { key: 'FB', ...localAxisLabels.FB, pct: percentages.FB },
      { key: 'GE', ...localAxisLabels.GE, pct: percentages.GE },
      { key: 'SQ', ...localAxisLabels.SQ, pct: percentages.SQ },
      { key: 'AI', ...localAxisLabels.AI, pct: percentages.AI },
    ];

    const barX = 32;
    const barW = W - 64;
    const barH = 8;
    let barY = 195;

    for (const axis of axes) {
      // ラベル
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = font(9);
      ctx.textAlign = 'left';
      ctx.fillText(`${axis.left.emoji} ${axis.left.label}`, barX, barY - 3);
      ctx.textAlign = 'right';
      ctx.fillText(`${axis.right.label} ${axis.right.emoji}`, barX + barW, barY - 3);

      // バー背景
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();

      // バー前景
      const barGrad = ctx.createLinearGradient(barX, 0, barX + barW * (axis.pct / 100), 0);
      barGrad.addColorStop(0, '#8b5cf6');
      barGrad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * (axis.pct / 100), barH, 4);
      ctx.fill();

      barY += 28;
    }

    // フッター
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = font(10);
    ctx.textAlign = 'right';
    ctx.fillText('reol.twilightea.com/quiz/reol-type/', W - 32, H - 16);

    resolve(canvas.toDataURL("image/png"));
  });
}

// === メインコンポーネント ===
const ResultPage = () => {
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language || 'ja';
  const [result, setResult] = useState<ReturnType<typeof getResult> | null>(null);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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
      navigate("/quiz/reol-type/");
      return;
    }
    const answers: Answers = JSON.parse(stored);
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < 20) {
      navigate("/quiz/reol-type/quiz/?q=1");
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
    generateShareCard(r.typeCode, r.percentages, lang).then(setShareImage);
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    navigate("/quiz/reol-type/");
  };

  const handleShareX = () => {
    if (!result) return;
    const { percentages } = result;
    const localTypeInfo = getLocalizedType(result.typeCode, lang);
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
      url: `${SITE_URL}/quiz/reol-type/types/${result.typeCode.toLowerCase()}/?utm_source=share_x`,
    });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    if (!shareImage || !result) return;
    // data URL → Blob 変換
    const res = await fetch(shareImage);
    const blob = await res.blob();
    const file = new File([blob], `reol-type-${result.typeCode}.png`, { type: 'image/png' });

    // Web Share API（iOS Safari対応）
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (e) {
        // ユーザーキャンセルは無視
        if ((e as Error).name === 'AbortError') return;
      }
    }

    // PC: 通常ダウンロード
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reol-type-${result.typeCode}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopyText = () => {
    if (!result) return;
    const localTypeInfo = getLocalizedType(result.typeCode, lang);
    const text = t('reolType.copyResultText', {
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      url: `${SITE_URL}/quiz/reol-type/`,
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
      <div className="min-h-svh flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#111133] to-[#0a0a1a] text-white">
        <div className="animate-pulse text-gray-400">{t('reolType.calculating')}</div>
      </div>
    );
  }

  const { percentages, typeCode } = result;
  const typeInfo = getLocalizedType(typeCode, lang);
  const group = getLocalizedTypeGroup(typeInfo.group, lang);
  const bestMatch = getLocalizedType(typeInfo.compatibility.bestMatch, lang);
  const inspire = getLocalizedType(typeInfo.compatibility.inspire, lang);
  const complement = getLocalizedType(typeInfo.compatibility.complement, lang);

  return (
    <div className="min-h-svh text-white font-sans" style={getTypeBgStyle(typeInfo.color)}>
      {/* カラーグロー */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 80% 20%, ${typeInfo.color}12, transparent)`,
        }}
      />
      <div className="relative max-w-md mx-auto px-4 py-8 space-y-8">

        {/* === 結果ヘッダー === */}
        <div className="text-center space-y-3">
          <p className="text-sm tracking-[0.3em] text-gray-400 uppercase">{t('reolType.resultHeader')}</p>
          <p className="text-sm text-gray-500 tracking-wider">{typeCode}</p>
          <div className="text-5xl mb-2">{typeInfo.emoji}</div>
          <h1 className="text-3xl font-bold">{typeInfo.name}</h1>
          <p className="text-lg" style={{ color: typeInfo.color }}>♪ {typeInfo.songLabel}</p>
          <p className="text-sm text-gray-400">{group.emoji} {group.name}</p>
        </div>

        {/* === 引用 === */}
        <div className="border-l-2 pl-4 py-2" style={{ borderColor: `${typeInfo.color}80` }}>
          <p className="text-sm text-gray-300 italic leading-relaxed">「{typeInfo.quote}」</p>
          <p className="text-xs text-gray-500 mt-1">— {typeInfo.song}</p>
        </div>

        {/* === サマリー === */}
        <p className="text-sm text-gray-300 leading-relaxed">{typeInfo.summary}</p>

        {/* === 軸バランス === */}
        <div className="space-y-4 bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-gray-300 mb-3">{t('reolType.yourBalance')}</h3>
          <AxisBar axisKey="FB" leftPct={percentages.FB} leftLabel={t('reolType.axisFront')} rightLabel={t('reolType.axisBack')} leftEmoji="🔥" rightEmoji="🌊" />
          <AxisBar axisKey="GE" leftPct={percentages.GE} leftLabel={t('reolType.axisIntense')} rightLabel={t('reolType.axisEmotional')} leftEmoji="🎸" rightEmoji="🎹" />
          <AxisBar axisKey="SQ" leftPct={percentages.SQ} leftLabel={t('reolType.axisEvangelize')} rightLabel={t('reolType.axisImmerse')} leftEmoji="📢" rightEmoji="🎧" />
          <AxisBar axisKey="AI" leftPct={percentages.AI} leftLabel={t('reolType.axisAnalyze')} rightLabel={t('reolType.axisIntuition')} leftEmoji="🔍" rightEmoji="💫" />
        </div>

        {/* === 詳細セクション === */}
        <div className="space-y-2">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full text-left bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-300">{t('reolType.seeMoreDetails')}</span>
              <span className="text-gray-500 transition-transform duration-200" style={{ transform: showDetail ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
            </div>
          </button>
          {showDetail && (
            <div className="space-y-6 pt-2">
              {typeInfo.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-purple-300 mb-2">{section.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === 相性 === */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-gray-300 mb-3">{t('reolType.compatibleTypes')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 w-24 flex-shrink-0">{t('reolType.bestMatch')}</span>
              <span>{bestMatch.emoji} {bestMatch.name}（{bestMatch.songLabel}）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 w-24 flex-shrink-0">{t('reolType.inspires')}</span>
              <span>{inspire.emoji} {inspire.name}（{inspire.songLabel}）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400 w-24 flex-shrink-0">{t('reolType.complements')}</span>
              <span>{complement.emoji} {complement.name}（{complement.songLabel}）</span>
            </div>
          </div>
        </div>

        {/* === シェアカードプレビュー === */}
        {shareImage && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-300">{t('reolType.shareCard')}</h3>
            <img
              src={shareImage}
              alt={t('reolType.shareCard')}
              className="w-full rounded-xl border border-white/10"
            />
          </div>
        )}

        {/* === シェアボタン群 === */}
        <div className="space-y-3">
          <button
            onClick={handleShareX}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-wider bg-black border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>{t('reolType.shareOnX')}</span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {t('reolType.saveImage')}
            </button>
            <button
              onClick={handleCopyText}
              className="py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {copied ? t('reolType.copied') : t('reolType.copyText')}
            </button>
          </div>
        </div>

        {/* === 長押し保存モーダル === */}
        {showSaveModal && shareImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            onClick={() => setShowSaveModal(false)}
          >
            <div className="max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-center text-white text-sm">{t('reolType.longPressSave')}</p>
              <img
                src={shareImage}
                alt={t('reolType.shareCard')}
                className="w-full rounded-xl"
              />
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-full py-3 rounded-xl text-sm text-gray-300 bg-white/10 border border-white/20"
              >
                {t('reolType.close')}
              </button>
            </div>
          </div>
        )}

        {/* === アカウント紐付けセクション（ゲストユーザー向け） === */}
        {!isLoggedIn && !loginSuccess && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔗</span>
              <h3 className="text-sm font-bold text-gray-300">{t('reolType.linkAccountTitle')}</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{t('reolType.linkAccountDesc')}</p>
            <div className="space-y-2">
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder={t('reolType.linkAccountId')}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors"
              />
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder={t('reolType.linkAccountPw')}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLinkLogin(); }}
              />
            </div>
            {loginError && (
              <p className="text-xs text-red-400">{loginError}</p>
            )}
            <button
              onClick={handleLinkLogin}
              disabled={loginLoading || !loginId.trim() || !loginPw.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/80 hover:to-blue-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loginLoading ? t('reolType.linkAccountLoading') : t('reolType.linkAccountButton')}
            </button>
            <div className="text-center pt-1">
              <a
                href="/bijigaku-navi/"
                className="text-[11px] text-gray-500 hover:text-gray-400 transition-colors"
              >
                {t('reolType.noAccountYet')}
              </a>
            </div>
          </div>
        )}
        {loginSuccess && (
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 text-center space-y-1">
            <span className="text-lg">✅</span>
            <p className="text-sm text-green-300 font-medium">{t('reolType.linkAccountSuccess')}</p>
          </div>
        )}

        {/* === もう一度 === */}
        <button
          onClick={handleRetry}
          className="w-full py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
        >
          {t('reolType.retryDiagnosis')}
        </button>

        {/* === 公式CTA === */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-gray-300">{t('reolType.officialCtaTitle')}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{t('reolType.officialCtaDesc')}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://reol.jp/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("site")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/80 hover:to-blue-500/80 transition-all"
            >
              {t('reolType.officialSite')}
            </a>
            <a
              href="https://www.youtube.com/@reolch"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("youtube")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {t('reolType.officialYoutube')}
            </a>
          </div>
        </div>

        {/* === タイプ詳細 === */}
        <Link
          to={`/quiz/reol-type/types/${typeCode.toLowerCase()}/`}
          className="block w-full py-3 rounded-xl text-sm text-center border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
        >
          {t('reolType.viewTypeDetail', { emoji: typeInfo.emoji, name: typeInfo.name })}
        </Link>

        {/* === 全タイプ一覧 === */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-gray-300 mb-4">{t('reolType.allTypes')}</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(reolTypes).map((rt) => {
              const localRt = getLocalizedType(rt.code, lang);
              return (
                <Link
                  key={rt.code}
                  to={`/quiz/reol-type/types/${rt.code.toLowerCase()}/`}
                  className={`text-center p-2 rounded-lg text-xs transition-colors ${
                    rt.code === typeCode
                      ? 'bg-white/15 border border-white/20 ring-1 ring-white/20'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="text-lg">{rt.emoji}</div>
                  <div className="text-gray-400 mt-1">{localRt.name}</div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;

// NOTE: SSG ビルド時の i18n 初期化順による翻訳キー露出を避けるため
// Head では t() を使わず ja ロケールを直接参照する。
export const Head: HeadFC = () => (
  <SEO
    title={jaCommon.reolType.seoResultTitle}
    description={jaCommon.reolType.seoResultDesc}
    path="/quiz/reol-type/result/"
  />
);
