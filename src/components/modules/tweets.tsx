import React, { Component, RefObject, createRef } from "react";
import { Tweet } from "react-twitter-widgets";
import { Button, Spinner, Tabs, TabsRef } from "flowbite-react";

import { GoLinkExternal } from "react-icons/go";

type Props = {
  parentId: string;
  posts: {
    id: string;
    html: string;
  }[];
};

type State = {
  active: number;
  loaded: boolean;
  loadCount: number;
  loadMoreCount: number;
};

const showNum = 5;

export default class Tweets extends Component<Props, State> {
  ref: RefObject<TabsRef> = createRef<TabsRef>();
  constructor(props: Props) {
    super(props);
    this.state = {
      active: 0,
      loaded: false,
      loadCount: 0,
      loadMoreCount: 0,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <Tabs.Group
        aria-label="tabs"
        style="fullWidth"
        className="sm:bg-white"
        ref={this.ref}
        onActiveTabChange={(tab) => {
          this.setState({
            ...this.state,
            active: tab,
          });
        }}
      >
        <Tabs.Item
          active
          title="シンプル表示"
          onClick={(event) => {
            UtilityService.gtag({
              category: "click",
              action: "tab-post",
              label: "simple",
            });
            const targets = document.getElementsByTagName("script");
            for (let index = 0; index < targets.length; index++) {
              const script = targets.item(index);
              if (script?.src === "https://platform.twitter.com/widgets.js") {
                script.remove();
              }
            }
          }}
        >
          {0 === this.state.active &&
            this.props.posts.map((post) => {
              return (
                <article
                  key={`simple-post-${this.props.parentId}-${post.id}`}
                  className="relative border border-gray-300 rounded-lg p-5 text-black mb-3 bg-white"
                >
                  <a
                    href={`https://x.com/RRReol/status/${post.id}`}
                    target="_blank"
                    dangerouslySetInnerHTML={{
                      __html: post.html,
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <GoLinkExternal />
                  </div>
                </article>
              );
            })}
        </Tabs.Item>
        <Tabs.Item
          title="オリジナル表示"
          onClick={() =>
            UtilityService.gtag({
              category: "click",
              action: "tab-post",
              label: "original",
            })
          }
        >
          {1 === this.state.active &&
            this.props.posts
              .map((post, postIndex, posts) => {
                if (postIndex < showNum * (this.state.loadMoreCount + 1)) {
                  return (
                    <div key={`post-area-${this.props.parentId}-${post.id}`}>
                      <div
                        key={`pre-post-${this.props.parentId}-${post.id}`}
                        className={
                          this.state.loaded
                            ? "hidden"
                            : "relative border border-gray-300 rounded-lg p-5 text-black mb-3 bg-white"
                        }
                      >
                        <article
                          dangerouslySetInnerHTML={{
                            __html: post.html,
                          }}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Spinner aria-label="post" color="info" size="xl" />
                        </div>
                      </div>
                      <article
                        className=""
                        key={`post-${this.props.parentId}-${post.id}`}
                        onClick={() =>
                          UtilityService.gtag({
                            category: "click",
                            action: "post",
                            label: post.id,
                          })
                        }
                      >
                        <Tweet
                          tweetId={post.id}
                          onLoad={() => {
                            this.setState((state, prop) => {
                              const count = state.loadCount + 1;
                              if (count === showNum || count === posts.length) {
                                return {
                                  ...state,
                                  loadCount: count,
                                  loaded: true,
                                };
                              } else {
                                return {
                                  ...state,
                                  loadCount: count,
                                };
                              }
                            });
                          }}
                        />
                      </article>
                    </div>
                  );
                } else {
                  return null;
                }
              })
              .filter((v) => v)}
          {this.props.posts.length > showNum &&
            this.state.loadCount < this.props.posts.length && (
              <div className="flex justify-center">
                <Button
                  gradientDuoTone="pinkToOrange"
                  size="xl"
                  className="w-5/6 text-white font-bold tracking-widest"
                  onClick={(event) => {
                    UtilityService.gtag({
                      category: "click",
                      action: "showMore",
                      label: "post",
                    });
                    this.setState((state, prop) => ({
                      ...state,
                      loadMoreCount: state.loadMoreCount + 1,
                    }));
                  }}
                >
                  もっと見る
                </Button>
              </div>
            )}
        </Tabs.Item>
      </Tabs.Group>
    );
  }
}
