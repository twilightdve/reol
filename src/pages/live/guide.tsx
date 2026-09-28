/**
 * /live/guide/ — ライヴ参戦ガイド
 *
 * 元は美辞学ツアー特設ページ(bijigaku-navi)向けに書かれたコラム
 * 「Reolライヴ はじめてガイド」「遠征プランニングガイド」の内容から、
 * 特定ツアーに依存しない部分(持ち物・マナー・遠征のコツ等)を移植・再編集したもの。
 * ツアー固有の日程・都市別プランはツアー終了後に意味を持たなくなるため含めない。
 */
import React from "react";
import { HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { buildBreadcrumbList, buildFaqPage } from "../../utils/jsonLd";
import { Kicker } from "../../components/redesign";
import { trackEvent } from "../../utils/analytics";
import { LangLink as Link, pageDictFor, usePageDict } from "../../i18n/site/SiteLangContext";
import { liveGuideDict, type GuideBlock } from "../../i18n/site/pages/liveGuide";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

const containerCls =
  "bg-bx-surface/5 border border-bx-line rounded-xl p-4 sm:p-6";
const h2Cls = "text-xl font-bold text-bx-ink mb-3";
const h3Cls = "text-sm font-bold text-bx-ink mt-4 mb-1.5";
const pCls = "text-sm leading-relaxed text-bx-ink2";
const ulCls = "list-disc pl-5 space-y-1 text-sm leading-relaxed text-bx-ink2";
const subUlCls = "list-disc pl-5 space-y-0.5 text-xs text-bx-ink3 mt-0.5";

type GuideDict = (typeof liveGuideDict)["ja"];

const renderBlock = (block: GuideBlock, key: number) => {
  switch (block.kind) {
    case "h3":
      return (
        <h3 key={key} className={h3Cls}>
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={key} className={block.spacing ? `${pCls} ${block.spacing}` : pCls}>
          {block.text}
        </p>
      );
    case "note":
      return (
        <p
          key={key}
          className="mt-3 text-xs leading-relaxed text-bx-ink3 border-l-2 border-bx-yellow pl-3"
        >
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={key} className={ulCls}>
          {block.items.map((item, i) => (
            <li key={i}>
              {item.label ? (
                <span className="font-semibold text-bx-ink">{item.text}</span>
              ) : (
                item.text
              )}
              {item.sub && (
                <ul className={subUlCls}>
                  {item.sub.map((sub, j) => (
                    <li key={j}>{sub}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
  }
};

const LiveGuidePage: React.FC = () => {
  const t = usePageDict(liveGuideDict);
  return (
    <main className="relative container mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 text-bx-ink space-y-6">
      {/* ヒーロー */}
      <section className={containerCls}>
        <Kicker color="text-bx-blue" className="mb-2">
          LIVE GUIDE
        </Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">
          {t.title}
        </h1>
        <p className={pCls}>{t.intro}</p>
      </section>

      {/* 本文(持ち物・服装・立ち位置・到着時間・マナー・楽しみ方・終演後・遠征) */}
      {t.sections.map((section) => (
        <section key={section.heading} className={containerCls}>
          <h2 className={h2Cls}>{section.heading}</h2>
          {section.blocks.map(renderBlock)}
        </section>
      ))}

      {/* もっと見る */}
      <section className={containerCls}>
        <h2 className={h2Cls}>{t.moreHeading}</h2>
        <p className={pCls + " mb-3"}>{t.moreText}</p>
        <Link
          to="/live/"
          onClick={() => trackEvent("live_guide_link_click", { label: "live_top" })}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
        >
          {t.moreLink}
        </Link>
      </section>
    </main>
  );
};

export default LiveGuidePage;

// FAQPageの質問文はページ上の見出しと一致させている(schema.org/Googleのガイドライン対応)。
// 回答は各セクションの内容を要約したプレーンテキスト。
const faqEntries = (t: GuideDict) =>
  t.sections.map((section) => ({ question: section.heading, answer: section.faqAnswer }));

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(liveGuideDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/live/guide/"
      lang={lang}
      jsonLd={[
        buildBreadcrumbList([
          { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
          { name: "LIVE", path: localizePath("/live/", lang) },
          { name: t.title, path: localizePath("/live/guide/", lang) },
        ]),
        buildFaqPage(faqEntries(t)),
      ]}
    />
  );
};
