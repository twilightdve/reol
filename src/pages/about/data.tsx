/**
 * /about/data/ — サイト内の集計ルールを明記するページ
 *
 * TOP・/songs/stats/・/live/heatmap/ 等で表示される数字がページごとに
 * 異なって見える(例: 楽曲数・公演数・演奏回数)ことについて、それぞれの
 * 定義と算出方法を機械的な事実として説明する。値そのものはビルド時に
 * gatsby-node.ts が算出するため、このページでは「何を・どう数えているか」
 * のみを文章で説明する(数値の埋め込みはしない)。
 * 文言は言語ごとの辞書(src/i18n/site/pages/aboutData.ts)にある。
 */
import React from "react";
import { HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { Kicker } from "../../components/redesign";
import { pageDictFor, usePageDict } from "../../i18n/site/SiteLangContext";
import { aboutDataDict } from "../../i18n/site/pages/aboutData";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

const containerCls =
  "rounded-lg border border-bx-line bg-bx-surface/5 p-4 sm:p-5";

/** 辞書の段落中の `...` を <code> にして描画する */
const RichText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(`[^`]+`)/).map((part, i) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={i} className="text-bx-ink">
          {part.slice(1, -1)}
        </code>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    )}
  </>
);

const AboutDataPage: React.FC = () => {
  const t = usePageDict(aboutDataDict);
  return (
    <main className="relative container mx-auto w-full max-w-3xl px-3 sm:px-4 py-6 text-bx-ink space-y-6">
      <section className={containerCls}>
        <Kicker color="text-bx-blue" className="mb-2">
          ABOUT THE DATA
        </Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">
          {t.title}
        </h1>
        <p className="text-sm leading-relaxed text-bx-ink2">{t.intro}</p>
      </section>

      {t.sections.map((section) => (
        <section key={section.id} className={containerCls} aria-labelledby={section.id}>
          <h2 id={section.id} className="text-lg font-bold text-bx-ink mb-2">
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed text-bx-ink2 ${
                i < section.paragraphs.length - 1 ? "mb-2" : ""
              }`}
            >
              <RichText text={paragraph} />
            </p>
          ))}
        </section>
      ))}

      <section className={containerCls} aria-labelledby="about-data-caveats">
        <h2 id="about-data-caveats" className="text-lg font-bold text-bx-ink mb-2">
          {t.caveatsTitle}
        </h2>
        <ul className="text-sm leading-relaxed text-bx-ink2 list-disc pl-5 space-y-1.5">
          {t.caveats.map((caveat, i) => (
            <li key={i}>{caveat}</li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default AboutDataPage;

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(aboutDataDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/about/data/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: t.title, path: localizePath("/about/data/", lang) },
      ])}
    />
  );
};
