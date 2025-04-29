import React, { Component, PropsWithChildren } from "react";
import { AiOutlineLoading } from "react-icons/ai";

type Props = {
  debugMessage?: string;
  threshold?: number;
  className?: string;
};

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  isLoaded: boolean;
  observer: IntersectionObserver | null;
};

export default class LazyComponent extends Component<
  PropsWithChildren<Props>,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ref: React.createRef<HTMLDivElement>(),
      isLoaded: false,
      observer: null,
    };
  }

  componentDidMount() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.isLoaded) {
          if (this.props.debugMessage) {
            // console.log(this.props.debugMessage);
          }
          this.setState({ ...this.state, isLoaded: true });
          this.state.observer?.disconnect(); // ロード後は監視を解除
        }
      },
      { threshold: this.props.threshold ?? 0.4 }
    );
    if (this.state.ref?.current) {
      observer.observe(this.state.ref?.current);
    }
    this.setState({
      ...this.state,
      observer,
    });
  }

  componentWillUnmount() {
    if (this.state.observer) {
      this.state.observer.disconnect();
    }
  }

  renderLoading() {
    return (
      <div className="w-full bg-gray-600">
        <AiOutlineLoading className="absolute h-6 w-6 animate-spin top-0 bottom-0 left-0 right-0 m-auto" />
      </div>
    );
  }

  render() {
    return (
      <div ref={this.state.ref} className={this.props.className}>
        {!this.state.isLoaded
          ? this.renderLoading()
          : React.Children.map(
              this.props.children,
              (child) => React.isValidElement(child) && child
            )}
      </div>
    );
  }
}
