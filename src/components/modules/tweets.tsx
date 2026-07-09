import React, { useRef, useState, useCallback } from "react";
import { Tweet } from "react-twitter-widgets";
import { Spinner, TabsRef } from "flowbite-react";
import UtilityService from "../../services/UtilityService";
import LazyComponent from "./LazyComponent";

interface TweetsProps {
  parentId: string;
  posts: {
    id: string;
    html: string;
  }[];
}

const INITIAL_SHOW_COUNT = 3;

const Tweets: React.FC<TweetsProps> = ({ parentId, posts }) => {
  const tweetRef = useRef<TabsRef>(null);
  const [active, setActive] = useState(0);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedPosts = showAll ? posts : posts.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = posts.length > INITIAL_SHOW_COUNT;

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
          return (
            <div key={`post-area-${parentId}-${post.id}`} className="h-full">
              <div
                key={`pre-post-${parentId}-${post.id}`}
                className={
                  loadedIds.has(post.id)
                    ? "hidden"
                    : "relative border border-gray-300 rounded-lg p-5 text-black mb-3 bg-white overflow-hidden"
                }
              >
                {/* スケルトン */}
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/6"></div>
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
            もっと見る ({posts.length - INITIAL_SHOW_COUNT}件)
          </button>
        </div>
      )}
    </>
  );
};

export default Tweets;
