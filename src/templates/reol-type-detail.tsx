import React, { useState, useEffect, useCallback } from "react";
import { Link, type PageProps } from "gatsby";
import { useTranslation } from "react-i18next";
import { reolTypes, typeGroups, getLocalizedType, getLocalizedTypeGroup, type TypeCode } from "../data/reol-type/types";
import SEO from "../components/SEO";

const SITE_URL = "https://reol.twilightea.com";

// X (Twitter) アイコン SVG
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

// === 同タイプのユーザーカードセクション ===
interface SameTypeUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

const SameTypeUsers = ({ typeCode, typeColor }: { typeCode: TypeCode; typeColor: string }) => {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<SameTypeUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('../lib/supabase').then(({ supabase }) => {
      if (!supabase) { setLoading(false); return; }
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('reol_type', typeCode)
        .order('updated_at', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (!error && data) {
            setUsers(data as SameTypeUser[]);
          }
          setLoading(false);
        });
    });
  }, [typeCode]);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
        <div className="animate-pulse text-gray-500 text-sm">{t('reolType.loadingUsers')}</div>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <h3 className="text-sm font-bold text-gray-300 mb-1">{t('reolType.sameTypeFans')}</h3>
      <p className="text-xs text-gray-500 mb-4">{t('reolType.sameTypeFansSub', { count: users.length })}</p>
      <div className="grid grid-cols-2 gap-2">
        {users.map((user) => {
          const displayName = user.full_name || user.username || user.id;
          return (
            <a
              key={user.id}
              href={`https://x.com/${user.id.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all group"
            >
              {/* アバター */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
                >
                  {(displayName[0] || '?').toUpperCase()}
                </div>
              )}
              {/* 名前 + X ID */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{displayName}</div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  <XIcon />
                  <span className="truncate">@{user.id}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

interface PageContext {
  typeCode: TypeCode;
}

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

// === シェアカード生成（タイプ詳細用） ===
function generateDetailShareCard(typeCode: TypeCode, lang: string = 'ja'): Promise<string> {
  return new Promise((resolve) => {
    const DPR = 2;
    const W = 600;
    const H = 360;
    const canvas = document.createElement("canvas");
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    const typeInfo = getLocalizedType(typeCode, lang);
    const group = getLocalizedTypeGroup(typeInfo.group, lang);

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
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 50 + i * 65);
      ctx.lineTo(W, 50 + i * 65);
      ctx.stroke();
    }

    // カラーアクセント
    const accentGrad = ctx.createRadialGradient(W * 0.8, H * 0.3, 0, W * 0.8, H * 0.3, 200);
    accentGrad.addColorStop(0, `${typeInfo.color}20`);
    accentGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, W, H);

    // テキスト描画ヘルパー
    const font = (size: number, weight = '400') => `${weight} ${size}px -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif`;
    const maxWidth = W - 48;

    // テキスト折り返しヘルパー
    const wrapText = (text: string, fontSize: number, fontWeight: string, maxW: number, maxLines: number) => {
      ctx.font = font(fontSize, fontWeight);
      const chars = text.split('');
      let line = '';
      const result: string[] = [];
      for (const char of chars) {
        const testLine = line + char;
        if (ctx.measureText(testLine).width > maxW && line !== '') {
          result.push(line);
          line = char;
        } else {
          line = testLine;
        }
      }
      result.push(line);
      const display = result.slice(0, maxLines);
      if (result.length > maxLines) {
        display[maxLines - 1] = display[maxLines - 1].slice(0, -1) + '…';
      }
      return display;
    };

    // ヘッダー
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = font(13);
    ctx.textAlign = 'left';
    ctx.fillText('Reol Fan Type', 24, 32);

    // タイプコード
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = font(16, '500');
    ctx.fillText(typeCode, 24, 58);

    // タイプ名 + Emoji
    ctx.fillStyle = '#ffffff';
    ctx.font = font(42, '700');
    ctx.fillText(`${typeInfo.emoji} ${typeInfo.name}`, 24, 105);

    // 楽曲名
    ctx.fillStyle = typeInfo.color;
    ctx.font = font(19, '500');
    ctx.fillText(`♪ ${typeInfo.songLabel}`, 24, 135);

    // グループ
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = font(13);
    ctx.fillText(`${group.emoji} ${group.name}`, 24, 160);

    // 歌詞引用
    const quoteLines = wrapText(`「${typeInfo.quote}」`, 15, '400', maxWidth, 2);
    const lineHeight = 22;
    let curY = 180;

    // 引用ライン装飾
    ctx.fillStyle = `${typeInfo.color}80`;
    ctx.fillRect(24, curY - 2, 3, quoteLines.length * lineHeight + 4);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = font(15, '400');
    for (const ql of quoteLines) {
      ctx.fillText(ql, 36, curY + 14);
      curY += lineHeight;
    }

    // 楽曲帰属
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = font(12);
    ctx.fillText(`— ${typeInfo.song}`, 36, curY + 12);
    curY += 30;

    // 概要文（summary）
    const summaryLines = wrapText(typeInfo.summary, 16, '400', maxWidth, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = font(16, '400');
    for (const sl of summaryLines) {
      ctx.fillText(sl, 24, curY + 14);
      curY += 22;
    }

    // フッター
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = font(11);
    ctx.textAlign = 'right';
    ctx.fillText(`reol.twilightea.com/quiz/reol-type/types/${typeCode.toLowerCase()}/`, W - 24, H - 14);

    resolve(canvas.toDataURL("image/png"));
  });
}

// === メインコンポーネント ===
const ReolTypeDetailPage = ({ pageContext }: PageProps<object, PageContext>) => {
  const { typeCode } = pageContext;
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language || 'ja';
  const typeInfo = getLocalizedType(typeCode, lang);
  const group = getLocalizedTypeGroup(typeInfo.group, lang);
  const bestMatch = getLocalizedType(typeInfo.compatibility.bestMatch, lang);
  const inspire = getLocalizedType(typeInfo.compatibility.inspire, lang);
  const complement = getLocalizedType(typeInfo.compatibility.complement, lang);

  const allTypes = Object.values(reolTypes);

  const [shareImage, setShareImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    generateDetailShareCard(typeCode, lang).then(setShareImage);
  }, [typeCode, lang]);

  const handleShareX = useCallback(() => {
    const localTypeInfo = getLocalizedType(typeCode, lang);
    const text = t('reolType.xShareType', {
      emoji: localTypeInfo.emoji,
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      summary: localTypeInfo.summary.slice(0, 60) + '…',
      url: `${SITE_URL}/quiz/reol-type/types/${typeCode.toLowerCase()}/?utm_source=share_x`,
    });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [typeCode, lang, t]);

  const handleDownload = useCallback(async () => {
    if (!shareImage) return;
    // data URL → Blob 変換
    const res = await fetch(shareImage);
    const blob = await res.blob();
    const file = new File([blob], `reol-type-${typeCode}.png`, { type: 'image/png' });

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
    a.download = `reol-type-${typeCode}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [shareImage, typeCode]);

  const handleCopyText = useCallback(() => {
    const localTypeInfo = getLocalizedType(typeCode, lang);
    const text = t('reolType.copyTypeText', {
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      url: `${SITE_URL}/quiz/reol-type/types/${typeCode.toLowerCase()}/`,
    });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [typeCode, lang]);

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

        {/* === ヘッダー === */}
        <div className="text-center space-y-3">
          <p className="text-sm tracking-[0.3em] text-gray-400 uppercase">{t('reolType.detailHeader')}</p>
          <p className="text-sm text-gray-500 tracking-wider">{typeCode}</p>
          <div className="text-5xl mb-2">{typeInfo.emoji}</div>
          <h1 className="text-3xl font-bold">{typeInfo.name}</h1>
          <p className="text-lg" style={{ color: typeInfo.color }}>♪ {typeInfo.songLabel}</p>
          <p className="text-sm text-gray-400">{group.emoji} {group.name}</p>
        </div>

        {/* === Spotify埋め込みプレイヤー === */}
        {typeInfo.spotifyTrackId && (
          <div className="rounded-xl overflow-hidden">
            <iframe
              src={`https://open.spotify.com/embed/track/${typeInfo.spotifyTrackId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify - ${typeInfo.song}`}
              style={{ borderRadius: '12px' }}
            />
          </div>
        )}

        {/* === 引用（歌詞） === */}
        <div className="border-l-2 pl-4 py-2" style={{ borderColor: `${typeInfo.color}80` }}>
          <p className="text-sm text-gray-300 italic leading-relaxed">「{typeInfo.quote}」</p>
          <p className="text-xs text-gray-500 mt-1">— {typeInfo.song}</p>
        </div>

        {/* === サマリー === */}
        <p className="text-sm text-gray-300 leading-relaxed">{typeInfo.summary}</p>

        {/* === 詳細セクション（常に展開） === */}
        <div className="space-y-6">
          {typeInfo.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold mb-2" style={{ color: typeInfo.color }}>{section.title}</h4>
              <p className="text-sm text-gray-300 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* === 相性 === */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-gray-300 mb-3">{t('reolType.compatibleTypes')}</h3>
          <div className="space-y-2 text-sm">
            <Link
              to={`/quiz/reol-type/types/${typeInfo.compatibility.bestMatch.toLowerCase()}/`}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors"
            >
              <span className="text-purple-400 w-24 flex-shrink-0">{t('reolType.bestMatch')}</span>
              <span>{bestMatch.emoji} {bestMatch.name}（{bestMatch.songLabel}）</span>
            </Link>
            <Link
              to={`/quiz/reol-type/types/${typeInfo.compatibility.inspire.toLowerCase()}/`}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors"
            >
              <span className="text-blue-400 w-24 flex-shrink-0">{t('reolType.inspires')}</span>
              <span>{inspire.emoji} {inspire.name}（{inspire.songLabel}）</span>
            </Link>
            <Link
              to={`/quiz/reol-type/types/${typeInfo.compatibility.complement.toLowerCase()}/`}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors"
            >
              <span className="text-teal-400 w-24 flex-shrink-0">{t('reolType.complements')}</span>
              <span>{complement.emoji} {complement.name}（{complement.songLabel}）</span>
            </Link>
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

        {/* === 同タイプのファン一覧 === */}
        <SameTypeUsers typeCode={typeCode as TypeCode} typeColor={typeInfo.color} />

        {/* === 全タイプ一覧 === */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-gray-300 mb-4">{t('reolType.allTypes')}</h3>
          <div className="grid grid-cols-4 gap-2">
            {allTypes.map((rt) => {
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

        {/* === 診断CTA === */}
        <div className="space-y-3">
          <Link
            to="/quiz/reol-type/"
            className="block w-full py-3 rounded-xl font-bold text-sm tracking-wider text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            {t('reolType.takeDiagnosis')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ReolTypeDetailPage;

// NOTE: SSG ビルド時の i18n 初期化順による翻訳キー露出を避けるため
// Head では t() を使わず ja 固定でタイトルを組み立てる。
export const Head = ({ pageContext }: PageProps<object, PageContext>) => {
  const { typeCode } = pageContext;
  const typeInfo = getLocalizedType(typeCode, 'ja');
  return (
    <SEO
      title={`${typeInfo.emoji} ${typeInfo.name}「${typeInfo.songLabel}」— Reolファンタイプ診断`}
      description={typeInfo.summary}
      path={`/quiz/reol-type/types/${typeCode.toLowerCase()}/`}
      image={`https://reol.twilightea.com/reol-type-og/${typeCode.toLowerCase()}.png`}
    />
  );
};
