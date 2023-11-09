import React, { Component } from "react";
import { Timeline } from "react-twitter-widgets";
import { FaXTwitter } from "react-icons/fa6";
import UtilityService from "../../services/UtilityService";

type Props = {
  id: string;
  title: string;
};

type State = {
  didMount: boolean;
};

export default class XTimeline extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      didMount: false,
    };
  }

  componentDidMount() {
    this.setState({ ...this.state, didMount: true });
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <>
        <div
          className={`px-2 pt-3 pb-2 w-full${
            this.state.didMount ? "" : " hidden"
          }`}
        >
          <h2
            id={`Twitter-${this.props.id}`}
            className="flex items-center font-bold text-xl pt-8 pb-4 text-shadow"
          >
            <FaXTwitter className="mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              <a href={`https://twitter.com/${this.props.id}`}>
                {this.props.title}
              </a>
            </span>
          </h2>
          <div
            className="px-2"
            onClick={() =>
              UtilityService.gtag({
                category: "click",
                action: "timeline",
                label: this.props.id,
              })
            }
          >
            <Timeline
              dataSource={{
                sourceType: "profile",
                screenName: this.props.id,
              }}
              options={{
                height: "1024",
                chrome: "noheader",
              }}
            />
          </div>
        </div>
      </>
    );
  }
}
