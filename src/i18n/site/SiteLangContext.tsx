import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { Link, GatsbyLinkProps } from "gatsby";
import { DEFAULT_LANG, SiteLang } from "./langs";
import { getDict, SiteDict } from "./dict";
import { localizePath } from "../../utils/i18nRoutes";

// 言語は URL だけから決める(plan/28)。
// - ヘッダー・フッター等(Body 内): Body のパスから決めた言語
// - ページ本体: wrapPageElement で pageContext.lang から決めた言語(内側の Provider が優先される)
const SiteLangContext = createContext<SiteLang>(DEFAULT_LANG);

export const SiteLangProvider: React.FC<{ lang: SiteLang; children: ReactNode }> = ({
  lang,
  children,
}) => <SiteLangContext.Provider value={lang}>{children}</SiteLangContext.Provider>;

export const useSiteLang = (): SiteLang => useContext(SiteLangContext);

export const useDict = (): SiteDict => getDict(useSiteLang());

/** 内部リンクのパスを現在の言語のURLにする関数を返す */
export const useLocalizePath = (): ((path: string) => string) => {
  const lang = useSiteLang();
  return (path: string) => localizePath(path, lang);
};

/** Gatsby の Link と同じ使い方で、to を現在の言語のURLにする */
export const LangLink = <TState,>({ to, ...rest }: GatsbyLinkProps<TState>) => {
  const lang = useSiteLang();
  // GatsbyLinkProps の ref 型の差異を避けるため any 経由で渡す
  const LinkAny = Link as unknown as React.FC<any>;
  return <LinkAny to={localizePath(to, lang)} {...rest} />;
};
