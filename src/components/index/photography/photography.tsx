import React, { Component } from "react";
import { MdCloseFullscreen } from "react-icons/md";
import { TYPES } from "./posts";
import StaticYoutube from "../../modules/StaticYoutube";
import SnapScrollComponent from "../../modules/SnapScrollComponent";
import LazyComponent from "../../modules/LazyComponent";

type Photo = {
  type: number;
  src: string;
};

type Link = {
  title: string;
  url: string;
};

type Post = {
  date: string;
  title: string;
  description: string;
  items: Photo[];
  links: Link[];
  relatedPosts: string[];
};

type Props = {
  posts: Post[];
};

type State = {
  dialogRef: React.RefObject<HTMLDialogElement>;
  dialogContentsContainerRef: React.RefObject<HTMLDivElement>;
  carouselDivRefs: React.RefObject<HTMLDivElement>[];
  selectedIndex: number;
  hasLoadedFlags: boolean[];
  prevCarouselIndex: number;
};

export default class Photography extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dialogRef: React.createRef<HTMLDialogElement>(),
      dialogContentsContainerRef: React.createRef<HTMLDivElement>(),
      carouselDivRefs: this.props.posts.map(() =>
        React.createRef<HTMLDivElement>()
      ),
      selectedIndex: -1,
      hasLoadedFlags: this.props.posts.map(() => false),
      prevCarouselIndex: 0,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  getHeightCarousel(post: Post): string {
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
  }

  getShowingPosts(posts: Post[], index: number): Post[] {
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
  }

  dialogContents(post: Post, index: number) {
    return (
      <div
        key={`carousel-contents-${index}`}
        ref={this.state.carouselDivRefs[index]}
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
              // className="h-fit"
              debugMessage={post.title}
              onIntersecting={(currentIndex) => {
                let direction = 0;
                if (currentIndex > this.state.prevCarouselIndex) {
                  direction = 1;
                } else if (currentIndex < this.state.prevCarouselIndex) {
                  direction = -1;
                }

                const newHasLoadedFlags = [...this.state.hasLoadedFlags];
                newHasLoadedFlags[currentIndex] = true;

                this.setState({
                  ...this.state,
                  prevCarouselIndex: currentIndex,
                  selectedIndex: this.state.selectedIndex + direction,
                  hasLoadedFlags: newHasLoadedFlags,
                });
              }}
            >
              {this.state.selectedIndex === index - 1 ||
              this.state.selectedIndex === index ||
              this.state.selectedIndex === index + 1 ||
              this.state.hasLoadedFlags[index] ? (
                post.items.map((item, itemIndex) => {
                  if (
                    item.type === TYPES.photo ||
                    item.type === TYPES.photo_tate ||
                    item.type === TYPES.photo_wide
                  ) {
                    return (
                      <div
                        key={`post-timeline-${this.state.selectedIndex}-${itemIndex}`}
                        className="bg-gray-900 pb-2"
                      >
                        <img
                          className="w-full h-auto"
                          srcSet={item.src}
                          loading="lazy"
                          alt=""
                        />
                      </div>
                    );
                  } else if (
                    item.type === TYPES.youtube ||
                    item.type === TYPES.youtube_tate
                  ) {
                    return (
                      <StaticYoutube
                        key={`video-${this.state.selectedIndex}-${itemIndex}`}
                        videoId={item.src}
                        type={item.type}
                      />
                    );
                  }
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
                    <li key={`link-${this.state.selectedIndex}-${linkIndex}`}>
                      <a
                        href={link.url}
                        target="_blank"
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
        {/* {this.props.posts.map((post, postIndex) => {
              return 
              ) : (
                <></>
              );
            })} */}
      </div>
    );
  }

  render() {
    return (
      <section className="py-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 w-full gap-1">
          {this.props.posts.map((post, postIndex) => {
            return (
              <div
                key={`photo-tile-${postIndex}-0`}
                className="aspect-w-1 aspect-h-1"
                onClick={(event) => {
                  event.stopPropagation();

                  document
                    .getElementsByTagName("body")[0]
                    .classList.add("overflow-hidden");

                  if (this.state.dialogRef?.current) {
                    this.state.dialogRef.current.showModal();
                  }

                  this.state.carouselDivRefs[
                    postIndex
                  ]?.current?.scrollIntoView();

                  this.setState({
                    ...this.state,
                    selectedIndex: postIndex,
                  });
                }}
              >
                <LazyComponent className="w-full h-full">
                  <img
                    className="w-full h-full object-cover object-center"
                    srcSet={
                      post.items[0].type === TYPES.photo ||
                      post.items[0].type === TYPES.photo_tate ||
                      post.items[0].type === TYPES.photo_wide
                        ? post.items[0].src
                        : `https://i.ytimg.com/vi/${post.items[0].src}/mqdefault.jpg`
                    }
                    loading="lazy"
                    alt=""
                  />
                </LazyComponent>
              </div>
            );
          })}
        </div>
        <div>
          <dialog
            ref={this.state.dialogRef}
            className={`w-full h-[90dvh] max-w-112 sm:max-w-208 md:max-w-256 lg:max-w-480 bg-transparent text-white backdrop:backdrop-opacity-60 backdrop:backdrop-blur-sm m-auto open:animate-fadeInFast font-system z-10 overflow-y-hidden`}
            onClick={(event) => {
              event.stopPropagation();

              document
                .getElementsByTagName("body")[0]
                .classList.remove("overflow-hidden");

              if (this.state.dialogRef?.current) {
                this.state.dialogRef.current.close();
              }
            }}
          >
            <div
              ref={this.state.dialogContentsContainerRef}
              className="overflow-x-scroll flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 snap-x snap-mandatory will-change-scroll"
            >
              {this.props.posts.map((item, index) =>
                this.dialogContents(item, index)
              )}
            </div>
          </dialog>
        </div>
      </section>
    );
  }
}
