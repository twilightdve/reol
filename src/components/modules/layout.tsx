import React, { Component } from "react";
import { GoLinkExternal } from "react-icons/go";
import { initFlowbite } from "flowbite";
import TopHeader from "./header";
import { FaXTwitter } from "react-icons/fa6";

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
    return (
      <>
        <TopHeader title={this.props.title} />
        <main className="relative bg-gray-100 mx-auto inset-auto w-screen pb-10 sm:pb-20">
          {this.props.children}
        </main>
        <footer className="relative bg-theme text-white pt-5 h-40">
          <ul className="flex justify-around py-3">
            <li>
              <a
                href="https://twitter.com/twilightplc"
                target="_blank"
                className="flex justify-between items-end"
              >
                <FaXTwitter className="font-bold text-xl" />
                <p className="flex items-center ml-2 text-base">
                  <span>(非公式ファンサイト運営)</span>
                  <GoLinkExternal className="ml-1 font-bold" />
                </p>
              </a>
            </li>
          </ul>
          <div className="text-center py-3 text-[#27489b]">
            <p className="text-xs">&copy;&nbsp;2023&nbsp;Pochi</p>
          </div>
        </footer>
      </>
    );
  }
}
