import React, { Component } from "react";
import { GoLinkExternal } from "react-icons/go";
import ReactGA from "react-ga4";

type Props = {
  title: string;
};

export default class Header extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <header className="z-40 h-16">
        <nav className="bg-theme border-gray-200">
          <div className="w-full flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="/" className="block">
              <span className="self-center text-3xl font-icon font-medium whitespace-nowrap text-letter text-shadow">
                !Legit
              </span>
              <span className="pl-3 font-bold text-xs">
                Reol非公式ファンサイト
              </span>
            </a>
            <div
              className="hidden w-full md:block md:w-auto"
              id="navbar-default"
            >
              <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0">
                <li>
                  <a
                    href="https://reol.jp/"
                    className="flex items-center py-2 pl-3 pr-4 text-letter bg-theme rounded md:p-0"
                    target="_blank"
                    onClick={() =>
                      ReactGA.event({
                        category: "click",
                        action: "link",
                        label: "https://reol.jp/",
                      })
                    }
                  >
                    Official Site
                    <GoLinkExternal className="ml-1" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}
