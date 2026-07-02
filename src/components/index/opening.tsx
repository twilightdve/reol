import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "../../redux/hooks";
import { FaCirclePlay } from "react-icons/fa6";
import UtilityService from "../../services/UtilityService";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "../../styles/opening.scss";
import CloudImage from "../../images/cloud.png";

type Props = Record<string, never>;

const Opening: React.FC<Props> = () => {
  const { isLoaded, playerRef } = useAppSelector(
    (state) => state.player
  );

  const [isSkip, setIsSkip] = useState(false);
  const [introEnd, setIntroEnd] = useState(false);
  const [unbox, setUnbox] = useState(false);
  const [onend, setOnend] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const reducedMotion = useReducedMotion();

  // prefers-reduced-motion \u304c\u6709\u52b9\u306a\u3089\u30aa\u30fc\u30d7\u30cb\u30f3\u30b0\u3092\u5168\u30b9\u30ad\u30c3\u30d7
  useEffect(() => {
    if (!reducedMotion) return;
    setIsSkip(true);
    document.body.classList.remove("overflow-hidden");
    document.documentElement.style.overflow = "";
  }, [reducedMotion]);

  useEffect(() => {
    const queries = UtilityService.getObjectQueries();
    // セッション中に一度オープニングを見たら以降スキップ
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem("openingShown") === "1";
    } catch (_) {
      // sessionStorage 利用不可な環境では無視
    }
    if (("op" in queries && queries.op === "0") || alreadyShown) {
      setIsSkip(true);
    } else {
      // オープニング表示中はスクロール禁止
      document.body.classList.add("overflow-hidden");
      document.documentElement.style.overflow = "hidden";
      try {
        sessionStorage.setItem("openingShown", "1");
      } catch (_) {
        /* ignore */
      }
    }

    // visualViewportを使って正確な表示領域を取得
    const updateHeight = () => {
      const height = window.visualViewport 
        ? window.visualViewport.height 
        : window.innerHeight;
      setViewportHeight(height);
      
      // CSS変数としても設定
      document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    };
    
    updateHeight();
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
    }
    window.addEventListener("resize", updateHeight);
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
      }
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    // オープニング終了時にスクロール禁止を解除
    if (onend || isSkip) {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.style.overflow = "";
    }
  }, [onend, isSkip]);

  // アンマウント時（別ページへの遷移時など）に必ずスクロールロックを解除
  useEffect(() => {
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.style.overflow = "";
    };
  }, []);

  // 自動フェードアウト: 0.5秒後にOpeningを自動で閉じ、同時に動画をミュート自動再生
  useEffect(() => {
    if (isSkip || unbox || onend) return;
    const timer = setTimeout(() => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.style.overflow = "";
      setUnbox(true);
      try {
        const player = playerRef?.current?.internalPlayer;
        if (player) {
          player.mute();
          player.playVideo();
        }
      } catch (_) { /* ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [isSkip, unbox, onend, playerRef]);

  const renderUnboxCubeSide = useCallback(() => {
    return (
      <span
        style={{ backfaceVisibility: "hidden" }}
        className={`font-bold text-4xl opacity-0 will-change-auto transition-all transform-gpu${
          isLoaded && !unbox ? " animate-fadeIn" : ""
        }${unbox ? " animate-blink" : ""}`}
        onAnimationEnd={(event) => event.stopPropagation()}
      >
        <p className="flex items-center">
          <FaCirclePlay className="mr-1" />
          {`UNBOX${!unbox ? "?" : ""}`}
        </p>
      </span>
    );
  }, [isLoaded, unbox]);

  const handleUnboxClick = useCallback(() => {
    if (!unbox) {
      UtilityService.gtag({
        category: "click",
        action: "opening",
        label: "unbox",
      });

      document.body.classList.remove("overflow-hidden");
      document.documentElement.style.overflow = "";
      setUnbox(true);
      try {
        const player = playerRef?.current?.internalPlayer;
        if (player) {
          player.mute();
          player.playVideo();
        }
      } catch (_) { /* ignore */ }
    }
  }, [unbox, playerRef]);

  const handleIntroEnd = useCallback(() => {
    setIntroEnd(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setOnend(true);
  }, []);

  const handleSilentUnboxClick = useCallback(() => {
    document.body.classList.remove("overflow-hidden");
    document.documentElement.style.overflow = "";
    setUnbox(true);
  }, []);

  const renderUnbox = useCallback(() => {
    const boxBaseClass = `w-full h-full col-[1/1] row-[1/1] border-2 border-white flex items-center justify-center transform-gpu bg-black text-[#ea6000] will-change-auto transform-gpu${
      unbox ? " animate-unbox" : ""
    }`;
    if (!onend && !isSkip) {
      return (
        <>
          <div
            style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }}
            className={`fixed top-0 left-0 w-full bg-white${
              introEnd ? " hidden" : " z-[80]"
            }`}
          />
          {!introEnd && (
            <>
              <div
                style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }}
                className="fixed top-0 left-0 z-[90] w-full animate-intro will-change-auto transform-gpu"
                onAnimationEnd={handleIntroEnd}
              >
                <div style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }} className="flex flex-col justify-center items-center w-full bg-white text-black text-3xl sm:text-5xl tracking-widest">
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
            style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }}
            className={`fixed inset-0 w-full bg-black before:content-[''] before:absolute before:top-0 before:left-0 before:bottom-0 before:m-auto before:bg-[#ea6000] before:z-50 before:w-0 before:h-px will-change-auto transform-gpu transition-all${
              introEnd ? " z-50" : " z-30"
            }${
              introEnd && unbox
                ? " animate-byeShutter before:animate-shutterOpen"
                : ""
            }`}
          />
          <div
            className={`fixed left-1/4 top-3/4 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl bg-black text-[#ea6000] -rotate-12 tracking-widest border-2 border-[#ea6000] pt-2 pb-3 px-5 transition-all${
              introEnd ? " z-50" : " z-30"
            }${introEnd && unbox ? " animate-unbox" : ""}`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2 font-bold text-4xl bg-[#ea6000] text-black -rotate-12 tracking-widest border-2 border-black pt-2 pb-3 px-5 transition-all${
              introEnd ? " z-50" : " z-30"
            }${introEnd && unbox ? " animate-unboxReverse" : ""}`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl bg-black text-[#ea6000] z-50 rotate-45 tracking-widest border-2 border-[#ea6000] pt-2 pb-3 px-5 transition-all${
              introEnd ? " z-50" : " z-30"
            }${introEnd && unbox ? " animate-unbox" : ""}`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2 font-bold text-4xl bg-[#ea6000] text-black z-50 rotate-12 tracking-widest border-2 border-black pt-2 pb-3 px-5 transition-all${
              introEnd ? " z-50" : " z-30"
            }${introEnd && unbox ? " animate-unboxReverse" : ""}`}
          >
            BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX&nbsp;&nbsp;BLACKBOX
          </div>
          <div
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all perspective-9 perspective-origin-top z-50${
              introEnd ? " z-50" : " z-30"
            }`}
          >
            <div
              className={`grid w-56 h-56 grid-cols-1 grid-rows-1 duration-1000 origin-center transform-style-3d will-change-auto transform-gpu animate-turnAround hover:cursor-pointer`}
              onAnimationEnd={(event) => {
                event.stopPropagation();
                handleAnimationEnd();
              }}
              onClick={handleUnboxClick}
            >
              <div className={`${boxBaseClass} translate-z-28`}>
                {renderUnboxCubeSide()}
              </div>
              <div
                className={`${boxBaseClass} rotate-x-180 rotate-z-180 -translate-z-28`}
              >
                {renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-y-90 -translate-x-28`}>
                {renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} rotate-y-90 translate-x-28`}>
                {renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-x-90 translate-y-28`}>
                {renderUnboxCubeSide()}
              </div>
              <div className={`${boxBaseClass} -rotate-x-90 -translate-y-28`}>
                {renderUnboxCubeSide()}
              </div>
            </div>
          </div>
          <div
            className={`fixed bottom-2 left-2 text-[#ea6000] ${
              introEnd ? " z-50" : " z-30"
            }${introEnd && unbox ? " animate-fadeOut" : ""}`}
          >
            <span>※&nbsp;箱を開くと音声のミュートが解除されます</span>
            <br />
            <span>
              ※&nbsp;音声なしで箱を開きたい方は
              <button
                className="underline underline-offset-4"
                onClick={handleSilentUnboxClick}
              >
                こちら
              </button>
            </span>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  }, [
    onend,
    isSkip,
    unbox,
    introEnd,
    isLoaded,
    playerRef,
    renderUnboxCubeSide,
    handleIntroEnd,
    handleAnimationEnd,
    handleUnboxClick,
    handleSilentUnboxClick,
  ]);

  const renderBubbles = useCallback(() => {
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
  }, []);

  const renderNoTitleCubeSide = useCallback(() => {
    return (
      <span
        style={{ backfaceVisibility: "hidden" }}
        className={`font-bold text-4xl opacity-0 will-change-auto transition-all transform-gpu ${
          isLoaded && !unbox ? " animate-fadeIn" : ""
        }${unbox ? " animate-blink" : ""}`}
        onAnimationEnd={(event) => {
          event.stopPropagation();
        }}
      ></span>
    );
  }, [isLoaded, unbox]);

  const renderNoTitleBox = useCallback(() => {
    const boxBaseClass = `w-full h-full col-[1/1] row-[1/1] border-2 border-white flex items-center justify-center transform-gpu bg-white text-white will-change-auto transform-gpu shadow-xl`;
    return (
      <>
        <div
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all perspective-9 perspective-origin-top z-[90]${
            introEnd ? " z-50" : " z-30"
          }`}
        >
          <div
            className={`grid w-56 h-56 grid-cols-1 grid-rows-1 duration-1000 origin-center transform-style-3d will-change-auto transform-gpu animate-turnAround hover:cursor-pointer`}
            onAnimationEnd={(event) => {
              event.stopPropagation();
              handleAnimationEnd();
            }}
          >
            <div className={`${boxBaseClass} translate-z-28`}>
              {renderNoTitleCubeSide()}
            </div>
            <div
              className={`${boxBaseClass} rotate-x-180 rotate-z-180 -translate-z-28`}
            >
              {renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-y-90 -translate-x-28`}>
              {renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} rotate-y-90 translate-x-28`}>
              {renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-x-90 translate-y-28`}>
              {renderNoTitleCubeSide()}
            </div>
            <div className={`${boxBaseClass} -rotate-x-90 -translate-y-28`}>
              {renderNoTitleCubeSide()}
            </div>
          </div>
        </div>
      </>
    );
  }, [introEnd, handleAnimationEnd, renderNoTitleCubeSide]);

  const handleFadeOutEnd = useCallback(
    (event: React.AnimationEvent) => {
      event.stopPropagation();
      if ("fadeOut" === event.animationName) {
        if (unbox) {
          setIntroEnd(true);
        }
      }
    },
    [unbox]
  );

  if (!onend && !isSkip) {
    return (
      <>
        {!introEnd && (
          <>
            <div>
              <div
                style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }}
                className={`fixed top-0 left-0 z-[90] w-full will-change-auto transform-gpu bg-gradient-to-br from-letter from-20% via-sky-600 via-50% to-white${
                  unbox ? " animate-fadeOut" : ""
                }`}
                onAnimationEnd={handleFadeOutEnd}
              >
                <div
                  style={{ 
                    height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh',
                    backgroundImage: `url(${CloudImage})` 
                  }}
                  className="fixed top-0 left-0 z-[100] w-full bg-cover animate-cloud"
                />
                {renderNoTitleBox()}
                <div style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }} className="absolute top-0 left-0 w-full z-[200]">
                  <div
                    style={{ height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh' }}
                    className="flex flex-col justify-center items-center w-full text-black text-3xl sm:text-5xl tracking-widest"
                    onClick={handleUnboxClick}
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
                {unbox && renderBubbles()}
              </div>
            </div>
          </>
        )}
      </>
    );
  } else {
    return <></>;
  }
  // return renderUnbox();
};

export default Opening;
