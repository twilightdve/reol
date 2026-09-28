import React, { useRef, useState, useCallback } from "react";
import { Tweet } from "react-twitter-widgets";
import { Spinner, TabsRef } from "flowbite-react";
import UtilityService from "../../services/UtilityService";
import LazyComponent from "./LazyComponent";
import { useTheme } from "../../hooks/useTheme";
import { useDict } from "../../i18n/site/SiteLangContext";
import { classifyPostHandle, parsePostEmbedHtml, relativeDate } from "../../utils/postMeta";

interface TweetsProps {
  parentId: string;
  posts: {
    id: string;
    html: string;
  }[];
  /**
   * 日付差分ラベル(plan/27 ステップ5)の基準。公演日なら "live"、リリース日なら "release"。
   * 省略時はラベルを出さない。投稿日・投稿者は埋め込みHTMLから機械的に取り出す(手入力なし)。
   */
  reference?: { kind: "live" | "release"; date: string | null };
}

const INITIAL_SHOW_COUNT = 3;

const Tweets: React.FC<TweetsProps> = ({ parentId, posts, reference }) => {
  const dict = useDict();
  const tweetRef = useRef<TabsRef>(null);
  const { theme } = useTheme();
  const [active, setActive] = useState(0);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedPosts = showAll ? posts : posts.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = posts.length > INITIAL_SHOW_COUNT;

  // 「公演2日前 · 本人」のような説明ラベル。どちらも取れなければ出さない
  const labelFor = (html: string): string | null => {
    const meta = parsePostEmbedHtml(html);
    const parts: string[] = [];
    if (reference?.date) {
      const rel = relativeDate(meta.postedAt, reference.date);
      if (rel) parts.push(dict.common.postTiming(reference.kind, rel));
    }
    const category = classifyPostHandle(meta.handle);
    if (category !== "その他") parts.push(dict.common.postCategory[category]);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  const handleTweetLoad = useCallback((postId: string) => {
    setLoadedIds((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  }, []);

  const handlePostClick = useCallback((postId: string) => {
    UtilityService.gtag({
      category: "click",
      action: "post",
      label: postId,
    });
  }, []);

  const handleShowMore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAll(true);
  }, []);

  return (
    <>
      {displayedPosts
        .map((post, postIndex, posts) => {
          const label = reference ? labelFor(post.html) : null;
          return (
            <div key={`post-area-${parentId}-${post.id}`} className="h-full">
              {label && (
                <p className="mb-1 text-[11px] font-bold text-bx-ink3">▸ {label}</p>
              )}
              <div
                key={`pre-post-${parentId}-${post.id}`}
                className={
                  loadedIds.has(post.id)
                    ? "hidden"
                    : "relative border border-bx-line rounded-lg p-5 mb-3 bg-bx-surface/5 overflow-hidden"
                }
              >
                {/* スケルトン */}
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-bx-surface/10 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-bx-surface/10 rounded w-1/4"></div>
                      <div className="h-3 bg-bx-surface/10 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-bx-surface/10 rounded"></div>
                    <div className="h-3 bg-bx-surface/10 rounded w-5/6"></div>
                    <div className="h-3 bg-bx-surface/10 rounded w-4/6"></div>
                  </div>
                </div>
                {/* ローディングスピナー */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Spinner aria-label="post" color="info" size="xl" />
                </div>
              </div>
              <article
                className=""
                key={`post-${parentId}-${post.id}`}
                onClick={() => handlePostClick(post.id)}
              >
                <LazyComponent>
                  <Tweet
                    tweetId={post.id}
                    options={{ theme }}
                    onLoad={() => handleTweetLoad(post.id)}
                  />
                </LazyComponent>
              </article>
            </div>
          );
        })
        .filter((v) => v)}
      
      {!showAll && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            {dict.common.showMore(posts.length - INITIAL_SHOW_COUNT)}
          </button>
        </div>
      )}
    </>
  );
};

export default Tweets;
