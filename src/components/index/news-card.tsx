import React, { Component } from "react";
import CardItem from "../modules/card-item";
import { News } from "../../types/news";

type Props = {
  data: News[];
};

export default class NewsCard extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <div className="pt-2 px-4">
        <div className="pt-4">
          <div className="overflow-y-hidden">
            <ul className="flex gap-x-3">
              {this.props.data.map((item, i) => {
                return (
                  <blockquote key={`news-${i}`}>
                    <CardItem
                      title={item.title}
                      content={item.content}
                      href="https://reol.jp/news/list/1/2/"
                      targetBlank
                    />
                  </blockquote>
                );
              })}
            </ul>
          </div>
          <div className="pt-3 text-xs">
            <p>
              <span>※</span>公式サイトのNEWS欄から10件分表示しています。
            </p>
          </div>
        </div>
      </div>
    );
  }
}
