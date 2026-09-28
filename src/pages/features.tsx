/**
 * /features/ — 機能一覧(plan/27 ステップ5)
 *
 * HOME の MORE TOOLS がカード8枚まで増えたため、ツールとページの一覧をここにまとめ、
 * HOME からは簡潔なリストとこのページへのリンクだけにする。
 */
import React, { useEffect, useState } from "react";
import { HeadFC } from "gatsby";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { LangLink, pageDictFor, useDict, usePageDict } from "../i18n/site/SiteLangContext";
import { featuresDict } from "../i18n/site/pages/features";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";
import { getDict } from "../i18n/site/dict";
import { localizePath } from "../utils/i18nRoutes";

type Item = { to: string; title: string; desc: string; label: string };

const todayMonthDay = (): string => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FeaturesPage: React.FC = () => {
  const t = usePageDict(featuresDict);
  const { home } = useDict();
  // On This Day は閲覧日の日付ページへ。ビルド時の日付で静的HTMLを作り、マウント後に閲覧日へ差し替える
  const [monthDay, setMonthDay] = useState<string>(todayMonthDay);
  useEffect(() => setMonthDay(todayMonthDay()), []);

  const groups: { key: string; heading: string; items: Item[] }[] = [
    {
      key: "start",
      heading: t.groups.start,
      items: [
        { to: "/welcome/", title: home.welcomeTitle, desc: home.welcomeDesc, label: "はじめてのReol" },
        { to: "/live/guide/", title: home.guideTitle, desc: home.guideDesc, label: "ライヴ参戦ガイド" },
        { to: "/quiz/reol-type/", title: home.quizTitle, desc: home.quizDesc, label: "ファンタイプ診断" },
      ],
    },
    {
      key: "live",
      heading: t.groups.live,
      items: [
        { to: "/live/", title: t.liveArchiveTitle, desc: t.liveArchiveDesc, label: "LIVE" },
        { to: "/live/compare/", title: home.compareTitle, desc: home.compareDesc, label: "セトリ比較" },
        { to: "/live/tour-heatmap/", title: home.tourHeatmapTitle, desc: home.tourHeatmapDesc, label: "ツアーヒートマップ" },
        { to: "/live/similarity-ranking/", title: home.similarityTitle, desc: home.similarityDesc, label: "セトリ類似度ランキング" },
        { to: "/live/setlist-grammar/", title: home.grammarTitle, desc: home.grammarDesc, label: "セトリの文法" },
        { to: "/live/heatmap/", title: home.heatmapTitle, desc: home.heatmapDesc, label: "開催地マップ" },
      ],
    },
    {
      key: "songs",
      heading: t.groups.songs,
      items: [
        { to: "/songs/stats/", title: t.statsTitle, desc: t.statsDesc, label: "楽曲統計" },
        { to: "/discography/", title: t.discographyTitle, desc: t.discographyDesc, label: "DISCOGRAPHY" },
        { to: "/songs/sorter/", title: home.sorterTitle, desc: home.sorterDesc, label: "楽曲ソーター" },
      ],
    },
    {
      key: "more",
      heading: t.groups.more,
      items: [
        { to: "/cgraph/", title: home.cgraphTitle, desc: home.cgraphDesc, label: "相関図" },
        { to: "/timemachine/", title: home.timemachineTitle, desc: home.timemachineDesc, label: "タイムマシン" },
        { to: `/on-this-day/${monthDay}/`, title: t.onThisDayTitle, desc: t.onThisDayDesc, label: "On This Day" },
        { to: "/posts/", title: home.postsTitle, desc: home.postsDesc, label: "関連ポスト" },
        { to: "/place/", title: t.placeTitle, desc: t.placeDesc, label: "聖地マップ" },
        { to: "/photos/", title: t.photosTitle, desc: t.photosDesc, label: "PHOTOGRAPHY" },
        { to: "/search/", title: t.searchTitle, desc: t.searchDesc, label: "横断検索" },
      ],
    },
  ];

  return (
    <main className="relative container mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 text-bx-ink">
      <header className="mb-6">
        <Kicker color="text-bx-blue">FEATURES</Kicker>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink">{t.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-bx-ink2">{t.lead}</p>
      </header>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`features-${group.key}`}>
            <h2 id={`features-${group.key}`} className="mb-2 text-sm font-bold text-bx-blueLight">
              {group.heading}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <li key={item.label}>
                  <LangLink
                    to={item.to}
                    onClick={() =>
                      trackEvent("features_link_click", { category: "navigation", label: item.label })
                    }
                    className="group flex h-full items-start justify-between gap-3 rounded-lg border border-bx-line bg-bx-surface/5 p-3 hover:border-bx-blueLight transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-bx-ink group-hover:text-bx-blueLight transition-colors">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-relaxed text-bx-ink3">{item.desc}</span>
                    </span>
                    <span aria-hidden="true" className="flex-shrink-0 text-bx-blueLight">
                      →
                    </span>
                  </LangLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
};

export default FeaturesPage;

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(featuresDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/features/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: t.title, path: localizePath("/features/", lang) },
      ])}
    />
  );
};
