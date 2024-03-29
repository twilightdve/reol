import React, { Component } from "react";
import UtilityService from "../../services/UtilityService";
import { Link } from "gatsby";
import { TbMapPinHeart } from "react-icons/tb";

type Props = {
  title: string;
};

export default class TopHeader extends Component<Props> {
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
            <Link to="/" className="block">
              <span className="self-center text-3xl font-icon font-medium whitespace-nowrap text-letter text-shadow">
                !Legit
              </span>
              <span className="pl-3 font-bold text-xs tracking-widest">
                Reol Unofficial Fansite
              </span>
            </Link>
            {/* <div
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
                      UtilityService.gtag({
                        action: "click",
                        category: "link",
                        label: "https://reol.jp/",
                      })
                    }
                  >
                    Official Site
                    <GoLinkExternal className="ml-1" />
                  </a>
                </li>
              </ul>
            </div> */}
          </div>
        </nav>
      </header>
    );
  }
}
