/**
 * 楽曲記事の予約公開(plan/43)。
 *
 * - 公開日時(publishedAt)が未来の記事は「予約公開」。記事ページ自体はビルドして置き、URL を知っていれば読める(プレビュー)。
 * - 一覧・シリーズ・関連記事・曲ページ・HOME には、公開日時を過ぎるまで出さない。
 *   サイトは静的配信で、公開日時に再ビルドはしない(デプロイは頼まれた時だけ)ため、
 *   静的HTMLはビルド時刻(builtAt)で判定し、JS が動いた後に今の時刻で判定し直して、過ぎていれば出す。
 * - 描画中に Date.now() を直接呼ばない(静的HTMLとの食い違いを避ける)。useNow を使う。
 */
import { useEffect, useState } from "react";

/** 公開日時を過ぎているか。公開日時の無い記事(プレビュー)は出す */
export const isReleased = (publishedAt: string | null | undefined, now: number): boolean => {
  if (!publishedAt) return true;
  const t = Date.parse(publishedAt);
  return Number.isNaN(t) || t <= now;
};

/**
 * 今の時刻。最初の描画(静的HTMLを作る時と、ブラウザでの最初の描画)はビルド時刻を返し、
 * 表示した後に今の時刻へ切り替える。ページを開いたまま公開日時を迎えても出るよう、1分ごとに更新する。
 * ビルド時刻が渡らない古いページ情報では、すべて公開済みとして扱う。
 */
export const useNow = (builtAt: number | null | undefined): number => {
  const [now, setNow] = useState<number>(builtAt ?? Number.MAX_SAFE_INTEGER);
  useEffect(() => {
    if (builtAt == null) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [builtAt]);
  return now;
};
