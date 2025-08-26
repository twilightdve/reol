import React, { useRef, useState, useCallback } from "react";
import YouTube from "react-youtube";
import { TYPES } from "../index/photography/posts";
import { Button } from "flowbite-react";
import { FaYoutube } from "react-icons/fa6";

interface StaticYoutubeProps {
  videoId: string;
  type: number;
}

const StaticYoutube: React.FC<StaticYoutubeProps> = ({ videoId, type }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const classNamePatterns = {
    [TYPES.youtube]: "relative w-full mb-4",
    [TYPES.youtube_tate]: "relative w-full max-h-144 mb-4",
  };

  const previewClassNamePatterns = {
    [TYPES.youtube]: "relative w-full mb-4",
    [TYPES.youtube_tate]: "relative h-full object-cover blur-[0.5px]",
  };

  const iframeClassNamePatterns = {
    [TYPES.youtube]: "relative w-full",
    [TYPES.youtube_tate]: "relative max-h-144 w-full",
  };

  const widthPatterns = {
    [TYPES.youtube]: "528",
    [TYPES.youtube_tate]: "390",
  };

  const heightPatterns = {
    [TYPES.youtube]: "297",
    [TYPES.youtube_tate]: "640",
  };

  const handleLoadVideo = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div ref={ref} className={classNamePatterns[type]}>
      {!isLoaded ? (
        <div onClick={handleLoadVideo} className="mb-2">
          <img
            src={`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`}
            className={previewClassNamePatterns[type]}
            loading="lazy"
            alt={`YouTube video thumbnail for ${videoId}`}
          />
          <div className="w-full h-full">
            <Button
              pill
              className="absolute top-0 bottom-0 left-0 right-0 m-auto w-20 h-20 bg-theme"
            >
              <FaYoutube className="text-4xl" />
            </Button>
          </div>
        </div>
      ) : (
        <YouTube
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

export default StaticYoutube;
