import React, { useRef, useState, useEffect } from "react";
import YouTube from "react-youtube";
import { TYPES } from "../index/photography/posts";

interface LazyYoutubeProps {
  videoId: string;
  type: number;
}

const LazyYoutube: React.FC<LazyYoutubeProps> = ({ videoId, type }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  const classNamePatterns = {
    [TYPES.youtube]: "relative max-w-full w-full aspect-w-16 aspect-h-9",
    [TYPES.youtube_tate]: "w-full max-h-144",
  };

  const iframeClassNamePatterns = {
    [TYPES.youtube]: "",
    [TYPES.youtube_tate]:
      "block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-144 w-full",
  };

  const widthPatterns = {
    [TYPES.youtube]: "528",
    [TYPES.youtube_tate]: "390",
  };

  const heightPatterns = {
    [TYPES.youtube]: "297",
    [TYPES.youtube_tate]: "640",
  };

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true);
          intersectionObserver.disconnect(); // ロード後は監視を解除
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      intersectionObserver.observe(ref.current);
    }

    setObserver(intersectionObserver);

    return () => {
      intersectionObserver.disconnect();
    };
  }, [isLoaded]);

  return (
    <div ref={ref}>
      {isLoaded && (
        <YouTube
          // key={`video-${postIndex}-${itemIndex}`}
          videoId={videoId}
          className={classNamePatterns[type]}
          iframeClassName={iframeClassNamePatterns[type]}
          loading="eager"
          opts={{
            width: widthPatterns[type],
            height: heightPatterns[type],
            playerVars: {
              // https://developers.google.com/youtube/player_parameters
              autoplay: 0,
              // controls: 0,
              // disablekb: 1,
              enablejsapi: 0,
              playsinline: 1,
              loop: 0,
              rel: 0,
              color: "white",
              origin: "https://reol.twilightea.com/",
              widget_referrer: "https://reol.twilightea.com/",
            },
          }}
        />
      )}
    </div>
  );
};

export default LazyYoutube;
