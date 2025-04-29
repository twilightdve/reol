import React, { Component } from "react";
import { initFlowbite } from "flowbite";

type Props = {
  title: string;
  children: any;
};

export default class Layout extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    initFlowbite();
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return <>{this.props.children}</>;
  }
}
