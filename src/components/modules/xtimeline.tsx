import React, { useState, useEffect, useCallback } from "react";
import { Timeline } from "react-twitter-widgets";
import { FaXTwitter } from "react-icons/fa6";
import UtilityService from "../../services/UtilityService";
import { useTheme } from "../../hooks/useTheme";

interface XTimelineProps {
  id: string;
  title: string;
}

const XTimeline: React.FC<XTimelineProps> = ({ id, title }) => {
  const [didMount, setDidMount] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setDidMount(true);
  }, []);

  const handleTimelineClick = useCallback(() => {
    UtilityService.gtag({
      category: "click",
      action: "timeline",
      label: id,
    });
  }, [id]);

  return (
    <>
      <div className={`px-2 pt-3 pb-2 w-full${didMount ? "" : " hidden"}`}>
        <h2
          id={`Twitter-${id}`}
          className="flex items-center font-bold text-xl pt-8 pb-4 text-bx-ink"
        >
          <FaXTwitter className="mr-2" />
          <span>
            <a
              href={`https://twitter.com/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-bx-blue transition-colors"
            >
              {title}
            </a>
          </span>
        </h2>
        <div className="px-2" onClick={handleTimelineClick}>
          <Timeline
            dataSource={{
              sourceType: "profile",
              screenName: id,
            }}
            options={{
              height: "1024",
              chrome: "noheader",
              theme,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default XTimeline;
