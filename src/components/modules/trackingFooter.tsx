import React, { Component } from "react";
import { connect } from "react-redux";
import { AppDispatch, RouteState } from "../../redux/store";
import { FaMusic, FaCompactDisc } from "react-icons/fa6";
import { BsSpeakerFill } from "react-icons/bs";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { TbMapPinHeart } from "react-icons/tb";
import { FaPhotoVideo } from "react-icons/fa";

type Props = {
  setRoute: any;
  currentRoute: string;
};

type State = {};

class TrackingFooter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {}

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {}

  renderIcon(route: string) {
    switch (route) {
      case ROUTE_NAMES[0]:
        return <FaMusic className="text-sm mb-1" />;
      case ROUTE_NAMES[1]:
        return <FaCompactDisc className="text-sm mb-1" />;
      case ROUTE_NAMES[2]:
        return <BsSpeakerFill className="text-sm mb-1" />;
      case ROUTE_NAMES[3]:
        return <TbMapPinHeart className="text-sm mb-1" />;
      case ROUTE_NAMES[4]:
        return <FaPhotoVideo className="text-sm mb-1" />;
      default:
        break;
    }
  }

  render() {
    try {
      return (
        <>
          <nav className="fixed bottom-0 z-[50] w-full shadow-[0px_-1px_6px_0px_rgba(0,0,0,0.3)]">
            <ul className="flex list-none w-full">
              {ROUTE_NAMES.map((route: string) => (
                <li
                  key={`route-${route}`}
                  onClick={() => {
                    const url = route === "HOME" ? "/" : `/#${route}`;
                    if (
                      "/" === location.pathname ||
                      location.pathname.startsWith("/#")
                    ) {
                      window.scrollTo(0, 0);
                      this.props.setRoute(route);
                      history.pushState(
                        null,
                        "!Legit｜Reol Unofficial Fansite",
                        url
                      );
                    } else {
                      location.href = url;
                    }
                  }}
                  className={`flex flex-col items-center justify-center text-center m-auto py-3 w-1/5 ${
                    this.props.currentRoute === route ? "bg-theme" : "bg-white"
                  }`}
                >
                  {this.renderIcon(route)}
                  <span className="text-[0.6rem] leading-4">{route}</span>
                </li>
              ))}
            </ul>
          </nav>
        </>
      );
    } catch (error) {
      alert("render: " + error?.toString());
    }
  }
}

const mapStateToProps = (state: RouteState) => state.route;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setRoute: (route: string) => dispatch(setRoute({ currentRoute: route })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackingFooter);
