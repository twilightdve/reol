import React, { useRef, useState, useCallback, useMemo } from "react";
import { MdCloseFullscreen } from "react-icons/md";
import { TYPES } from "./posts";
import StaticYoutube from "../../modules/StaticYoutube";
import SnapScrollComponent from "../../modules/SnapScrollComponent";
import LazyComponent from "../../modules/LazyComponent";

interface Photo {
  type: number;
  src: string;
}

interface Link {
  title: string;
  url: string;
}

interface Post {
  date: string;
  title: string;
  description: string;
  items: Photo[];
  links: Link[];
  relatedPosts: string[];
}

interface PhotographyProps {
  posts: Post[];
}

const Photography: React.FC<PhotographyProps> = ({ posts }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogContentsContainerRef = useRef<HTMLDivElement>(null);
  const carouselDivRefs = useMemo(
    () => posts.map(() => React.createRef<HTMLDivElement>()),
    [posts]
  );

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasLoadedFlags, setHasLoadedFlags] = useState(() =>
    posts.map(() => false)
  );
  const [prevCarouselIndex, setPrevCarouselIndex] = useState(0);

  const getHeightCarousel = useCallback((post: Post): string => {
    const patterns = ["h-160", "h-80", "h-60"];
    let index = 1;

    switch (post.items[0].type) {
      case TYPES.youtube_tate:
      case TYPES.photo_tate:
        index = 0;
        break;
      case TYPES.photo_wide:
        index = 2;
        break;
      default:
        break;
    }

    return patterns[index];
  }, []);

  const getShowingPosts = useCallback(
    (posts: Post[], index: number): Post[] => {
      let list = [];

      if (index < 0) {
        return [];
      }

      // list[0]
      if (0 === index) {
        list.push(posts[index]);
      } else if (0 < index) {
        list.push(posts[index - 1]);
      }

      // list[1]
      if (0 <= index && index < posts.length) {
        list.push(posts[index]);
      }

      // list[2]
      if (index + 1 < posts.length) {
        list.push(posts[index + 1]);
      } else {
        list.push(posts[index]);
      }

      return list;
    },
    []
  );

  const handleIntersecting = useCallback(
    (currentIndex: number) => {
      let direction = 0;
      if (currentIndex > prevCarouselIndex) {
        direction = 1;
      } else if (currentIndex < prevCarouselIndex) {
        direction = -1;
      }

      setHasLoadedFlags((prevFlags) => {
        const newFlags = [...prevFlags];
        newFlags[currentIndex] = true;
        return newFlags;
      });

      setPrevCarouselIndex(currentIndex);
      setSelectedIndex((prevSelected) => prevSelected + direction);
    },
    [prevCarouselIndex]
  );

  const handleDialogClose = useCallback(() => {
    document.body.classList.remove("overflow-hidden");
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, []);

  const handlePostClick = useCallback(
    (postIndex: number) => {
      document.body.classList.add("overflow-hidden");

      if (dialogRef.current) {
        dialogRef.current.showModal();
      }

      carouselDivRefs[postIndex]?.current?.scrollIntoView();
      setSelectedIndex(postIndex);
    },
    [carouselDivRefs]
  );

  const dialogContents = useCallback(
    (post: Post, index: number) => (
      <div
        key={`carousel-contents-${index}`}
        ref={carouselDivRefs[index]}
        className="relative w-full h-min max-w-sm shrink-0 z-10 snap-center snap-normal bg-gray-900"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="tracking-widest h-[90dvh] overflow-y-scroll">
          <h3 className="h-8 text-sm leading-8 px-2 text-theme whitespace-nowrap overflow-hidden">
            <span className="pr-1">{post.date}</span>
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm px-2 pt-1 pb-2 tracking-wide leading-relaxed">
              {post.description}
            </p>
          )}
          <div className={`relative w-full max-w-sm`}>
            <SnapScrollComponent
              key={`SnapScrollComponent-${index}`}
              index={index}
              debugMessage={post.title}
              onIntersecting={handleIntersecting}
            >
              {selectedIndex === index - 1 ||
              selectedIndex === index ||
              selectedIndex === index + 1 ||
              hasLoadedFlags[index] ? (
                post.items.map((item, itemIndex) => {
                  if (
                    item.type === TYPES.photo ||
                    item.type === TYPES.photo_tate ||
                    item.type === TYPES.photo_wide
                  ) {
                    return (
                      <div
                        key={`post-timeline-${selectedIndex}-${itemIndex}`}
                        className="bg-gray-900 pb-2"
                      >
                        <img
                          className="w-full h-auto"
                          src={item.src}
                          loading="lazy"
                          alt="Photography content"
                        />
                      </div>
                    );
                  } else if (
                    item.type === TYPES.youtube ||
                    item.type === TYPES.youtube_tate
                  ) {
                    return (
                      <StaticYoutube
                        key={`video-${selectedIndex}-${itemIndex}`}
                        videoId={item.src}
                        type={item.type}
                      />
                    );
                  }
                  return null;
                })
              ) : (
                <></>
              )}
            </SnapScrollComponent>
          </div>
          {post.links.length > 0 && (
            <div className="text-[0.7rem] px-2 pt-2 pb-4">
              <ul className="list-disc ml-5">
                {post.links.map((link, linkIndex) => {
                  return (
                    <li key={`link-${selectedIndex}-${linkIndex}`}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400"
                      >
                        {link.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    ),
    [selectedIndex, hasLoadedFlags, carouselDivRefs, handleIntersecting]
  );

  return (
    <section className="py-4" style={{ isolation: "isolate" }}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 w-full gap-1">
        {posts.map((post, postIndex) => {
          return (
            <div
              key={`photo-tile-${postIndex}-0`}
              className="aspect-w-1 aspect-h-1"
              onClick={(event) => {
                event.stopPropagation();
                handlePostClick(postIndex);
              }}
            >
              <LazyComponent className="w-full h-full">
                <img
                  className="w-full h-full object-cover object-center"
                  src={
                    post.items[0].type === TYPES.photo ||
                    post.items[0].type === TYPES.photo_tate ||
                    post.items[0].type === TYPES.photo_wide
                      ? post.items[0].src
                      : `https://i.ytimg.com/vi/${post.items[0].src}/mqdefault.jpg`
                  }
                  loading="lazy"
                  alt="Photography thumbnail"
                />
              </LazyComponent>
            </div>
          );
        })}
      </div>
      <div>
        <dialog
          ref={dialogRef}
          className={`w-full h-[90dvh] max-w-112 sm:max-w-208 md:max-w-256 lg:max-w-480 bg-transparent text-white backdrop:backdrop-opacity-60 m-auto open:animate-fadeInFast font-system z-10 overflow-y-hidden`}
          onClick={(event) => {
            event.stopPropagation();
            handleDialogClose();
          }}
        >
          <div
            ref={dialogContentsContainerRef}
            className="overflow-x-scroll flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 snap-x snap-mandatory will-change-scroll"
          >
            {posts.map((item, index) => dialogContents(item, index))}
          </div>
        </dialog>
      </div>
    </section>
  );
};

export default Photography;
