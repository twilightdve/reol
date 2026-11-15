import React, { useState, useEffect, useCallback } from "react";
import { type PageProps } from "gatsby";
import { useQuizT, quizT, getQuizType } from "../data/reol-type/i18n";
import { LangLink as Link } from "../i18n/site/SiteLangContext";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";
import { localizePath } from "../utils/i18nRoutes";
import { type TypeCode } from "../data/reol-type/types";
import SEO from "../components/SEO";
import {
  CompatibilityRows,
  MAIN,
  SectionHeading,
  ShareBlock,
  TypeHeading,
  TypeIntro,
  TypeList,
} from "../components/reolType/TypeParts";
import { generateTypeShareCard, saveShareImage } from "../components/reolType/shareCards";

const SITE_URL = "https://reol.twilightea.com";

// === 同タイプのファン ===
interface SameTypeUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

// 読めて1人以上いる時だけ出す(読み込み中・0人の時は節ごと出さない)
const SameTypeUsers = ({ typeCode }: { typeCode: TypeCode }) => {
  const { t } = useQuizT();
  const [users, setUsers] = useState<SameTypeUser[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('../lib/supabase').then(({ supabase }) => {
      if (!supabase) return;
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
        });
    });
  }, [typeCode]);

  if (users.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="reol-type-fans">
      <SectionHeading id="reol-type-fans" note={t('reolType.sameTypeFansSub', { count: users.length })}>
        {t('reolType.sameTypeFans')}
      </SectionHeading>
      <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
        {users.map((user) => {
          const displayName = user.full_name || user.username || user.id;
          return (
            <li key={user.id} className="border-b border-bx-line">
              <a
                href={`https://x.com/${user.id.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-2.5"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    loading="lazy"
                    className="h-8 w-8 flex-shrink-0 rounded-full border border-bx-line object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-bx-line text-xs font-bold text-bx-ink2"
                  >
                    {(displayName[0] || '?').toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-bx-ink transition-colors group-hover:text-bx-blueLight">
                    {displayName}
                  </span>
                  <span className="block truncate text-[12px] text-bx-ink3">@{user.id}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-blueLight"
                >
                  →
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

interface PageContext {
  typeCode: TypeCode;
  lang?: string;
}

// === メインコンポーネント ===
const ReolTypeDetailPage = ({ pageContext }: PageProps<object, PageContext>) => {
  const { typeCode } = pageContext;
  const { t, lang } = useQuizT();
  const typeInfo = getQuizType(typeCode, lang);

  const [shareImage, setShareImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareImage(generateTypeShareCard(typeCode, lang));
  }, [typeCode, lang]);

  const handleShareX = useCallback(() => {
    const localTypeInfo = getQuizType(typeCode, lang);
    const text = t('reolType.xShareType', {
      emoji: localTypeInfo.emoji,
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      summary: localTypeInfo.summary.slice(0, 60) + '…',
      url: `${SITE_URL}${localizePath(`/quiz/reol-type/types/${typeCode.toLowerCase()}/`, lang)}`,
    });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [typeCode, lang, t]);

  const handleDownload = useCallback(() => {
    if (!shareImage) return;
    void saveShareImage(shareImage, typeCode);
  }, [shareImage, typeCode]);

  const handleCopyText = useCallback(() => {
    const localTypeInfo = getQuizType(typeCode, lang);
    const text = t('reolType.copyTypeText', {
      name: localTypeInfo.name,
      song: localTypeInfo.songLabel,
      url: `${SITE_URL}${localizePath(`/quiz/reol-type/types/${typeCode.toLowerCase()}/`, lang)}`,
    });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [typeCode, lang]);

  return (
    <main className={MAIN}>
      {/* === ヘッダー === */}
      <TypeHeading kicker={t('reolType.detailHeader')} typeCode={typeCode} />

      {/* === Spotify埋め込みプレイヤー === */}
      {typeInfo.spotifyTrackId && (
        <div className="mb-6">
          <iframe
            src={`https://open.spotify.com/embed/track/${typeInfo.spotifyTrackId}?theme=0`}
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

      {/* === 引用（歌詞）・サマリー === */}
      <TypeIntro typeCode={typeCode} />

      {/* === 詳細セクション（常に展開） === */}
      {typeInfo.sections.map((section, i) => (
        <section key={i} className="mt-10">
          <SectionHeading>{section.title}</SectionHeading>
          <p className="pt-3 text-[15px] leading-loose text-bx-ink2">{section.body}</p>
        </section>
      ))}

      {/* === 相性 === */}
      <CompatibilityRows typeCode={typeCode} />

      {/* === シェアカードとシェアボタン === */}
      <ShareBlock
        shareImage={shareImage}
        copied={copied}
        tall
        onShareX={handleShareX}
        onSave={handleDownload}
        onCopy={handleCopyText}
      />

      {/* === 同タイプのファン一覧 === */}
      <SameTypeUsers typeCode={typeCode} />

      {/* === 全タイプ一覧 === */}
      <section className="mt-10" aria-labelledby="reol-type-all">
        <SectionHeading id="reol-type-all">{t('reolType.allTypes')}</SectionHeading>
        <TypeList current={typeCode} />
      </section>

      {/* === 診断CTA === */}
      <div className="mt-10">
        <Link
          to="/quiz/reol-type/"
          className="block w-full rounded-lg bg-bx-yellow px-8 py-3.5 text-center text-[15px] font-extrabold tracking-[0.04em] text-bx-bg transition-opacity hover:opacity-90 sm:inline-block sm:w-auto"
        >
          {t('reolType.takeDiagnosis')}
        </Link>
      </div>
    </main>
  );
};

export default ReolTypeDetailPage;

// 言語は pageContext.lang(URL)から決める。i18next を使わないので静的HTMLにキーが露出しない
export const Head = ({ pageContext }: PageProps<object, PageContext>) => {
  const { typeCode } = pageContext;
  const lang = isSiteLang(pageContext.lang) ? pageContext.lang : DEFAULT_LANG;
  const typeInfo = getQuizType(typeCode, lang);
  return (
    <SEO
      title={quizT(lang)("reolType.seoDetailTitle", {
        emoji: typeInfo.emoji,
        name: typeInfo.name,
        song: typeInfo.songLabel,
      })}
      description={typeInfo.summary}
      path={`/quiz/reol-type/types/${typeCode.toLowerCase()}/`}
      lang={lang}
      image={`https://reol.twilightea.com/reol-type-og/${typeCode.toLowerCase()}.png`}
    />
  );
};
