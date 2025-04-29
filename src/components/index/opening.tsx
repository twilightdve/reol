import React, { Component } from "react";
import { RouteState } from "../../redux/store";
import { connect } from "react-redux";
import { FaCirclePlay } from "react-icons/fa6";
import UtilityService from "../../services/UtilityService";
import "../../styles/opening.scss";
import CloudImage from "../../images/cloud.png";

type Props = {
  isLoaded: any;
  currentVideoId: any;
  isShrinked: any;
  playerRef: any;
};

type State = {
  isSkip: boolean;
  introEnd: boolean;
  unbox: boolean;
  onend: boolean;
};

class Opening extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isSkip: false, introEnd: false, unbox: false, onend: false };
  }

  componentDidMount() {
    const queries = UtilityService.getObjectQueries();
    if ("op" in queries && queries.op === "0") {
      this.setState({
        ...this.state,
        isSkip: true,
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  renderUnboxCubeSide() {
    return (
      <span
        style={{ backfaceVisibility: "hidden" }}
        className={`font-bold text-4xl opacity-0 will-change-auto transition-all transform-gpu${
          this.props.isLoaded && !this.state.unbox ? " animate-fadeIn" : ""
        }${this.state.unbox ? " animate-blink" : ""}`}
        onAnimationEnd={(event) => event.stopPropagation()}
      >
        <p className="flex items-center">
          <FaCirclePlay className="mr-1" />
          {`UNBOX${!this.state.unbox ? "?" : ""}`}
        </p>
      </span>
    );
  }

  renderUnbox() {
    const boxBaseClass = `w-full h-full col-[1/1] row-[1/1] border-2 border-white flex items-center justify-center transform-gpu bg-black text-[#ea6000] will-change-auto transform-gpu${
      this.state.unbox ? " animate-unbox" : ""
    }`;
    if (!this.state.onend && !this.state.isSkip) {
      return (
        <>
          <div
            className={`fixed top-0 left-0 w-full h-full bg-white${
              this.state.introEnd ? " hidden" : " z-[80]"
            }`}
          />
          {!this.state.introEnd && (
            <>
              <div
                className="fixed top-0 left-0 z-[90] w-full h-full animate-intro will-change-auto transform-gpu"
                onAnimationEnd={(event) =>
                  this.setState({ ...this.state, introEnd: true })
                }
              >
                <div className="flex flex-col justify-center items-center w-full h-full bg-white text-black text-3xl sm:text-5xl tracking-widest">
                  <span className="font-bold text-theme leading-relaxed">
                    Reol
                  </span>
                  <span className="leading-relaxed">Unofficial Fansite</span>
                  <span className="font-bold text-letter text-center leading-normal">
                    !Legit
                  </span>
                  <span className="text-sm">&#40;not Legit&#41;</span>
                </div>
              </div>
            </>
          )}
          <div
            className={`fixed inset-0 w-full h-full bg-black before:content-[''] before:absolute before:top-0 before:left-0 before:bottom-0 before:m-auto before:bg-[#ea6000] before:z-50 before:w-0 before:h-px will-change-auto transform-gpu transition-all${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox
                ? " animate-byeShutter before:animate-shutterOpen"
                : ""
            }`}
          />
          <div
            className={`fixed left-1/4 top-3/4 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl bg-black text-[#ea6000] -rotate-12 tracking-widest border-2 border-[#ea6000] pt-2 pb-3 px-5 transition-all${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox ? " animate-unbox" : ""
            }`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2 font-bold text-4xl bg-[#ea6000] text-black -rotate-12 tracking-widest border-2 border-black pt-2 pb-3 px-5 transition-all${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox
                ? " animate-unboxReverse"
                : ""
            }`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl bg-black text-[#ea6000] z-50 rotate-45 tracking-widest border-2 border-[#ea6000] pt-2 pb-3 px-5 transition-all${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox ? " animate-unbox" : ""
            }`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2 font-bold text-4xl bg-[#ea6000] text-black z-50 rotate-12 tracking-widest border-2 border-black pt-2 pb-3 px-5 transition-all${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox
                ? " animate-unboxReverse"
                : ""
            }`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all perspective-9 perspective-origin-top z-50${
              this.state.introEnd ? " z-50" : " z-30"
            }`}
          >
            <div
              className={`grid w-56 h-56 grid-cols-1 grid-rows-1 duration-1000 origin-center transform-style-3d will-change-auto transform-gpu animate-turnAround hover:cursor-pointer`}
              onAnimationEnd={(event) => {
                event.stopPropagation();
                this.setState({ ...this.state, onend: true });
              }}
              onClick={(event) => {
                if (!this.props.isLoaded) return;
                if (!this.state.unbox) {
                  UtilityService.gtag({
                    category: "click",
                    action: "opening",
                    label: "unbox",
                  });

                  if (this.props.playerRef.current) {
                    this.props.playerRef.current.internalPlayer?.playVideo();
                  }

                  document
                    .getElementsByTagName("body")[0]
                    .classList.remove("overflow-hidden");

                  this.setState({
                    ...this.state,
                    unbox: true,
                  });
                }
              }}
            >
              <div className={`${boxBaseClass} translate-z-28`}>
                {this.renderUnboxCubeSide()}
              </div>
              <div
                className={`${boxBaseClass} rotate-x-180 rotate-z-180 -translate-z-28`}
              >
                {this.renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-y-90 -translate-x-28`}>
                {this.renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} rotate-y-90 translate-x-28`}>
                {this.renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-x-90 translate-y-28`}>
                {this.renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-x-90 -translate-y-28`}>
                {this.renderUnboxCubeSide()}
              </div>
            </div>
          </div>
          <div
            className={`fixed bottom-2 left-2 text-[#ea6000] ${
              this.state.introEnd ? " z-50" : " z-30"
            }${
              this.state.introEnd && this.state.unbox ? " animate-fadeOut" : ""
            }`}
          >
            <span>※&nbsp;箱を開くと音声が流れますのでご注意ください</span>
            <br />
            <span>
              ※&nbsp;音声なしで箱を開きたい方は
              <button
                className="underline underline-offset-4"
                onClick={(event) => {
                  document
                    .getElementsByTagName("body")[0]
                    .classList.remove("overflow-hidden");

                  this.setState({
                    ...this.state,
                    unbox: true,
                  });
                }}
              >
                こちら
              </button>
            </span>
          </div>
          {!this.state.introEnd && (
            <span
              className="fixed bottom-3 right-4 z-[300] text-lg text-blue-500 pointer-events-auto"
              onClick={(event) => {
                document
                  .getElementsByTagName("body")[0]
                  .classList.remove("overflow-hidden");

                this.setState({ ...this.state, isSkip: true });
              }}
            >
              SKIP&nbsp;&gt;&gt;
            </span>
          )}
        </>
      );
    } else {
      return <></>;
    }
  }

  renderBubbles() {
    const randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    return Array.from({ length: 20 }).map((i, index) => {
      const size = randomInt(5, 6);
      // const time = Math.floor((index + 1) * Math.random() * 10) / 10;
      const time = index * 0.1;
      return (
        <div
          key={`bubble-${index}`}
          style={{
            left: `${Math.floor(50 + index * Math.random() * 2)}%`,
            animation: `float ${time}s cubic-bezier(0.470, 0.000, 0.745, 0.715) ${time}s infinite normal`,
          }}
          className={`absolute w-full -bottom-14`}
        >
          <div
            style={{
              transform: `scale(${index * 0.1})`,
            }}
          >
            <div
              style={{
                animation: `shake ${time}s ease 0s infinite normal`,
              }}
              className={
                `relative z-[100] block w-${size} h-${size} rounded-full shadow-white shadow-inner ` +
                `after:absolute after:block after:content-[''] after:w-1/5 after:h-1/5 after:rounded-full after:bg-white/80 after:right-1/4 after:top-1/4 after:blur-sm after:rotate-45 after:scale-x-75`
              }
            />
          </div>
        </div>
      );
    });
  }

  renderNoTitleCubeSide() {
    return (
      <span
        style={{ backfaceVisibility: "hidden" }}
        className={`font-bold text-4xl opacity-0 will-change-auto transition-all transform-gpu ${
          this.props.isLoaded && !this.state.unbox ? " animate-fadeIn" : ""
        }${this.state.unbox ? " animate-blink" : ""}`}
        onAnimationEnd={(event) => {
          event.stopPropagation();
        }}
      ></span>
    );
  }

  renderNoTitleBox() {
    const boxBaseClass = `w-full h-full col-[1/1] row-[1/1] border-2 border-white flex items-center justify-center transform-gpu bg-white text-white will-change-auto transform-gpu shadow-xl`;
    return (
      <>
        <div
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all perspective-9 perspective-origin-top z-[90]${
            this.state.introEnd ? " z-50" : " z-30"
          }`}
        >
          <div
            className={`grid w-56 h-56 grid-cols-1 grid-rows-1 duration-1000 origin-center transform-style-3d will-change-auto transform-gpu animate-turnAround hover:cursor-pointer`}
            onAnimationEnd={(event) => {
              event.stopPropagation();
              this.setState({ ...this.state, onend: true });
            }}
          >
            <div className={`${boxBaseClass} translate-z-28`}>
              {this.renderNoTitleCubeSide()}
            </div>
            <div
              className={`${boxBaseClass} rotate-x-180 rotate-z-180 -translate-z-28`}
            >
              {this.renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-y-90 -translate-x-28`}>
              {this.renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} rotate-y-90 translate-x-28`}>
              {this.renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-x-90 translate-y-28`}>
              {this.renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-x-90 -translate-y-28`}>
              {this.renderNoTitleCubeSide()}
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    if (!this.state.onend && !this.state.isSkip) {
      return (
        <>
          {!this.state.introEnd && (
            <>
              <div>
                <div
                  className={`fixed top-0 left-0 z-[90] w-full h-full will-change-auto transform-gpu bg-gradient-to-br from-letter from-20% via-sky-600 via-50% to-white${
                    this.state.unbox ? " animate-fadeOut" : ""
                  }`}
                  onAnimationEnd={(event) => {
                    event.stopPropagation();
                    if ("fadeOut" === event.animationName) {
                      if (!this.props.isLoaded) return;
                      if (this.state.unbox) {
                        this.setState({ ...this.state, introEnd: true });
                      }
                    }
                  }}
                >
                  <div
                    className="fixed top-0 left-0 z-[100] w-full h-full bg-cover animate-cloud"
                    style={{
                      backgroundImage: `url(${CloudImage})`,
                    }}
                  />
                  {this.renderNoTitleBox()}
                  <div className="absolute top-0 left-0 w-full h-full z-[200]">
                    <div
                      className="flex flex-col justify-center items-center w-full h-full text-black text-3xl sm:text-5xl tracking-widest"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!this.props.isLoaded) return;
                        if (!this.state.unbox) {
                          UtilityService.gtag({
                            category: "click",
                            action: "opening",
                            label: "unbox",
                          });

                          if (this.props.playerRef.current) {
                            this.props.playerRef.current.internalPlayer?.playVideo();
                          }

                          document
                            .getElementsByTagName("body")[0]
                            .classList.remove("overflow-hidden");

                          this.setState({
                            ...this.state,
                            unbox: true,
                          });
                        }
                      }}
                    >
                      <span className="font-extrabold leading-relaxed text-theme">
                        Reol
                      </span>
                      <span className="font-bold leading-relaxed text-gray-700">
                        Unofficial Fansite
                      </span>
                      <span className="font-extrabold text-center leading-normal text-letter">
                        !Legit
                      </span>
                      <span className="text-sm text-gray-700">
                        &#40;not Legit&#41;
                      </span>
                    </div>
                  </div>
                  {this.state.unbox && this.renderBubbles()}
                </div>
              </div>
              <span
                className="fixed bottom-3 right-4 z-[300] text-lg text-black pointer-events-auto tracking-wide"
                onClick={(event) => {
                  document
                    .getElementsByTagName("body")[0]
                    .classList.remove("overflow-hidden");

                  this.setState({ ...this.state, isSkip: true });
                }}
              >
                SKIP&nbsp;&gt;&gt;
              </span>
            </>
          )}
        </>
      );
    } else {
      return <></>;
    }
    // return this.renderUnbox();
  }
}

const mapStateToProps = (state: RouteState) => state.player;

export default connect(mapStateToProps)(Opening);
