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

const showNum = 5;

const Tweets: React.FC<TweetsProps> = ({ parentId, posts }) => {
  const tweetRef = useRef<TabsRef>(null);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [loadMoreCount, setLoadMoreCount] = useState(0);

  const handleTweetLoad = useCallback(() => {
    setLoadCount((prevCount) => {
      const count = prevCount + 1;
      if (count === showNum || count === posts.length) {
        setLoaded(true);
      }
      return count;
    });
  }, [posts.length]);

  const handlePostClick = useCallback((postId: string) => {
    UtilityService.gtag({
      category: "click",
      action: "post",
      label: postId,
    });
  }, []);

  return (
    <>
      {posts
        .map((post, postIndex, posts) => {
          return (
            <div key={`post-area-${parentId}-${post.id}`} className="h-full">
              <div
                key={`pre-post-${parentId}-${post.id}`}
                className={
                  loaded
                    ? "hidden"
                    : "relative border border-gray-300 rounded-lg p-5 text-black mb-3 bg-white"
                }
              >
                <article
                  dangerouslySetInnerHTML={{
                    __html: UtilityService.sanitizeHTML(post.html),
                  }}
                />
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
                  <Tweet tweetId={post.id} onLoad={handleTweetLoad} />
                </LazyComponent>
              </article>
            </div>
          );
        })
        .filter((v) => v)}
    </>
  );
};

export default Tweets;
