import React, { Component, RefObject, createRef } from "react";
import { Tweet } from "react-twitter-widgets";
import { Button, Spinner, Tabs, TabsRef } from "flowbite-react";

import { GoLinkExternal } from "react-icons/go";
import UtilityService from "../../services/UtilityService";
import LazyComponent from "./LazyComponent";

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
  tweetRef: RefObject<TabsRef> = createRef<TabsRef>();
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
    return this.props.posts
      .map((post, postIndex, posts) => {
        return (
          <div
            key={`post-area-${this.props.parentId}-${post.id}`}
            className="h-full"
          >
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
              <LazyComponent>
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
              </LazyComponent>
            </article>
          </div>
        );
      })
      .filter((v) => v);
  }
}
