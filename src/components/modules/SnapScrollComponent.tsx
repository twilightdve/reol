import React, { Component, PropsWithChildren } from "react";

type Props = {
  index: number;
  className?: string;
  debugMessage?: string;
  threshold?: number;
  onIntersecting?: (index: number) => void;
};

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  isShown: boolean;
  observer: IntersectionObserver | null;
};

export default class SnapScrollComponent extends Component<
  PropsWithChildren<Props>,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ref: React.createRef<HTMLDivElement>(),
      isShown: false,
      observer: null,
    };
  }

  componentDidMount() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // console.log(entry);
        if (entry.isIntersecting) {
          this.props?.onIntersecting &&
            this.props?.onIntersecting.call(this, this.props.index);
        }
        if (this.props.debugMessage) {
          if (entry.isIntersecting) {
            // console.log("intersecting: ", this.props.debugMessage);
          } else {
            // console.log("disintersecting: ", this.props.debugMessage);
          }
        }
        this.setState({ ...this.state, isShown: entry.isIntersecting });
      },
      { threshold: this.props.threshold ?? 0.9 }
    );
    if (this.state.ref?.current) {
      // if (this.props.debugMessage)
      //   console.log("observe:", this.props.debugMessage);
      observer.observe(this.state.ref?.current);
    }
    this.setState({
      ...this.state,
      observer,
    });
  }

  componentWillUnmount() {
    if (this.state.observer) {
      // if (this.props.debugMessage)
      //   console.log("unmount:", this.props.debugMessage);
      this.state.observer.disconnect();
    }
  }

  render() {
    return (
      <div ref={this.state.ref} className={this.props.className}>
        {React.Children.map(
          this.props.children,
          (child) => React.isValidElement(child) && child
        )}
      </div>
    );
  }
}
