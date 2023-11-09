import React, { Component } from "react";

type Props = {
  href?: string;
  targetBlank?: boolean;
  title: string;
  content: string;
};

export default class CardItem extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    const classList =
      "flex rounded-lg border border-gray-200 bg-white shadow-md flex-col md:max-w-xl md:flex-row w-64 h-64 sm:w-80 sm:h-72";
    return (
      <li className="sm:w-auto w-64 shrink-0">
        {this.props.href ? (
          <a
            href={this.props.href}
            target="_blank"
            className={classList}
            onClick={() =>
              UtilityService.gtag({
                category: "click",
                action: "link",
                label: this.props.title,
              })
            }
          >
            {this.renderCard()}
          </a>
        ) : (
          <div className={classList}>{this.renderCard()}</div>
        )}
      </li>
    );
  }

  renderCard() {
    const renderHTML = (rawHTML: string) =>
      React.createElement("p", {
        dangerouslySetInnerHTML: { __html: rawHTML },
      });

    return (
      <div className="flex h-full flex-col justify-start gap-4 p-6">
        <h3 className="text-base font-bold tracking-tight text-gray-900 h-10">
          {renderHTML(
            this.props.title.length > 25
              ? `${this.props.title.slice(0, 25)}...`
              : this.props.title
          )}
        </h3>
        <div className="font-normal text-sm sm:text-base text-gray-700 break-all pt-2">
          {renderHTML(
            this.props.content.length > 110
              ? `${this.props.content.slice(0, 110)}...`
              : this.props.content
          )}
        </div>
      </div>
    );
  }
}
