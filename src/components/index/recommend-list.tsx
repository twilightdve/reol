import React, { Component } from "react";
import { Tweet } from "react-twitter-widgets";
import { Recommend } from "../../types/recommend";

type Props = {
  data: Recommend[];
};

export default class RecommendList extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <div className="pt-2 px-4">
        <div className="overflow-y-hidden">
          <ul className="flex gap-x-3">
            {this.props.data.map((item) => {
              return (
                <blockquote key={`recommend-${item.id}`}>
                  <li className="w-96 h-128 shrink-0">
                    <Tweet tweetId={item.id} />
                  </li>
                </blockquote>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}
