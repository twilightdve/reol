"use client";

import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import noteTitle from "../../images/looks-history/note_title.png";
import noteEdge from "../../images/looks-history/note_edge.png";
import costumeTitle from "../../images/looks-history/costume_title.png";
import costumeHighFidelity from "../../images/looks-history/costume_high_fidelity.png";
import costumeSyugakusho from "../../images/looks-history/costume_syugakusho.png";
import costumeMadeInFaction from "../../images/looks-history/costume_made_in_faction.png";
import costumeShinkouUpgrade from "../../images/looks-history/costume_shinkou_upgrade.png";
import costumeHamelnNoDaigourei from "../../images/looks-history/costume_hameln_no_daigourei.png";
import costumeGekijouAlert from "../../images/looks-history/costume_gekijou_alert.png";
import costumeNeoNostalgia from "../../images/looks-history/costume_neo_nostalgia.png";
import costumeUnbox from "../../images/looks-history/costume_unbox.png";
import costumeAll from "../../images/looks-history/costume_all.png";
import HTMLFlipBook from "react-pageflip";
import { FaXTwitter } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";

// 引数のtargetProperty をDOMRectのもつPropertyに限定する
type DOMRectProperty = keyof Omit<DOMRect, "toJSON">;

// RefObjectの型は div, span, p, input などのさまざまなHTML要素に対応できるようにextendsで制限をかけつつ抽象化
export const useGetElementProperty = <T extends HTMLElement>(
  elementRef: RefObject<T>
) => {
  const getElementProperty = useCallback(
    (targetProperty: DOMRectProperty): number => {
      const clientRect = elementRef.current?.getBoundingClientRect();
      if (clientRect) {
        return clientRect[targetProperty];
      }

      // clientRect が undefined のときはデフォルトで0を返すようにする
      return 0;
    },
    [elementRef]
  );

  return {
    getElementProperty,
  };
};

export const fs20240817 = () => {
  const [initState, setInitState] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const [domRect, setDomRect] = useState<DOMRect>();
  const [rectHeight, setRectHeight] = useState<number>(0);
  const [lineNums, setLineNums] = useState<number>(0);
  const [_window, setWindow] = useState<Window>();

  const note = (page: number, isFinal: boolean = false) => {
    return (
      <>
        <div className="absolute w-full h-full bg-[#fcf9ef] border-[3px] border-[#47250B] -z-10" />
        <div className="absolute w-1/3 top-8 right-4 border-b-[1px] border-[#47250B] -z-10" />
        <div className="absolute w-[94%] top-10 border-t-[8px] border-x-2 border-[#47250B] mx-3 -z-10 bg-white">
          <div className="w-full border-b-2 border-[#47250B] mt-1 -z-10" />
          {Array.from({ length: lineNums }).map((_, i, arr): JSX.Element => {
            return (
              <div
                key={`page-${page}-note-line-${i}`}
                className={`w-full -z-10 border-[#47250B] ${
                  i + 1 < arr.length ? "border-b-[1px]" : "border-b-[8px]"
                }`}
                style={{
                  // marginTop: `${Math.floor(rectHeight / (lineNums + 1)) - 1}px`,
                  marginTop: `${15.2 * 2 - 1}px`,
                }}
              />
            );
          })}
        </div>
        {!isFinal && (
          <img className="fixed right-0 bottom-0 w-12" srcSet={noteEdge} />
        )}
      </>
    );
  };

  const updateMarginTop = () => {
    if (bookRef.current) {
      const rect = bookRef.current.getBoundingClientRect();
      setDomRect(rect); // 高さの5%をマージンに設定する例
      setRectHeight(Math.floor(rect.height - 55));
      setLineNums(Math.floor((rect.height - 55) / 32));
    }
  };

  useEffect(() => {
    setWindow(window);
  }, []);

  useEffect(() => {
    if (initState) {
      updateMarginTop();
      window.addEventListener("resize", updateMarginTop);
    }
  }, [initState]);

  if (_window) {
    return (
      <div ref={bookRef} className="p-1 mx-auto font-tegaki bg-trueGray-200">
        <HTMLFlipBook
          width={_window.innerWidth} // 257
          height={(_window.innerWidth * 364) / 257} // 257 : x (_window.innerWidth) = 364 : y
          minWidth={257}
          maxWidth={_window.innerWidth}
          minHeight={364}
          maxHeight={window.innerHeight}
          size="stretch"
          className=""
          style={{}}
          // children={undefined}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0}
          showCover={true}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={15}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {/* Page 1 */}
          <div id="page-1" className="relative w-full h-full">
            <img
              className="w-full h-full"
              srcSet={noteTitle}
              onLoad={() => setInitState(true)}
            />
          </div>
          {/* Page 2 */}
          <div id="page-2" className="relative w-full h-full">
            {note(2)}
            {/* <h1 className="mt-24 w-full text-5xl text-center">Looks History</h1> */}
            <div className="absolute w-full top-[3.4rem]">
              <div className="text-center text-[0.95rem] leading-[1.9rem] tracking-wider">
                <br />
                10周年おめでとうございます。
                <br />
                親愛なるあなたへ愛をこめて
              </div>
            </div>
            <img
              className="absolute w-5/6 mx-auto left-0 right-0 bottom-2"
              srcSet={costumeTitle}
            />
          </div>
          {/* Page 3 */}
          <div id="page-3" className="relative w-full h-full overflow-hidden">
            {note(3)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <div className="tracking-tighter">
                  2014.08.17
                  <br />
                  フルアルバム「No title」発売
                </div>
                <p className="tracking-tighter">
                  2015.07.29
                  <br />
                  フルアルバム「極彩色」発売
                </p>
                <p>
                  2015.10.23
                  <br />
                  れをる単独公演「極彩色 HighFidelity」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-10 right-2 w-2/3"
              srcSet={costumeHighFidelity}
            />
          </div>
          {/* Page 4 */}
          <div className="relative w-full h-full">
            {note(4)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2016.10.19
                  <br />
                  フルアルバム「Σ」発売
                </p>
                <p className="tracking-tighter">
                  2017.02.26
                  <br />
                  REOLワンマンライヴ「テンカイ ノ コウシキ」
                </p>
                <p className="">
                  2017.10.11
                  <br />
                  DIGITAL EP「エンドレスEP」発売
                </p>
                <p className="">
                  2017.10.26
                  <br />
                  REOL LAST LIVE「終楽章」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-6 right-2 w-2/3"
              srcSet={costumeSyugakusho}
            />
          </div>
          {/* Page 5 */}
          <div className="relative w-full h-full">
            {note(5)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2018.03.14
                  <br />
                  ミニアルバム「虚構集」発売
                </p>
                <p className="">
                  2018.10.17
                  <br />
                  フルアルバム「事実上」発売
                </p>
                <p className="">
                  2018.10.26
                  <br />
                  Reol Japan Tour 2018
                  <br />
                  「MADE IN FACTION」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-4 w-2/3"
              srcSet={costumeMadeInFaction}
            />
          </div>
          {/* Page 6 */}
          <div className="relative w-full h-full">
            {note(6)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2019.03.20
                  <br />
                  1st EP「文明EP」発売
                </p>
                <p className="">
                  2019.07.13
                  <br />
                  Reol Secret Live 2019
                  <br />
                  「文明ココロミー」
                </p>
                <p className="">
                  2020.10.16
                  <br />
                  <span className="tracking-tighter">
                    Reol Oneman Live 2019「侵攻アップグレード」
                  </span>
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-2 w-3/5"
              srcSet={costumeShinkouUpgrade}
            />
          </div>
          {/* Page 7 */}
          <div className="relative w-full h-full">
            {note(7)}
            {/* <img className="absolute w-36 top-2" srcSet={stickerHameln} /> */}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                {/* <div className="flex gap-x-4">
                  <div className="w-24 h-24" />
                  <div>
                  </div>
                </div> */}
                <p className="">
                  2020.01.22
                  <br />
                  2nd フルアルバム「金字塔」発売
                </p>
                <p className="">
                  2020.02.08
                  <br />
                  Reol Oneman Live「ハーメルンの大号令」
                </p>
                <p className="">
                  2021.6.26
                  <br />
                  Reol Installation Concert「音沙汰」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-2 w-2/3"
              srcSet={costumeHamelnNoDaigourei}
            />
          </div>
          {/* Page 8 */}
          <div className="relative w-full h-full">
            {note(8)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2021.12.15
                  <br />
                  2ndミニアルバム「第六感」発売
                </p>
                <p className="">
                  2022.04.27
                  <br />
                  Reol Oneman Live「激情アラート」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-4 w-2/3"
              srcSet={costumeGekijouAlert}
            />
          </div>
          {/* Page 9 */}
          <div className="relative w-full h-full">
            {note(9)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2022.11.16
                  <br />
                  SG「COLORED DISC」発売
                </p>
                <p className="">
                  2023.01.26
                  <br />
                  Reol Oneman Live
                  <br />
                  「新式浪漫 Neo Nostalgia」
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-2 w-2/3"
              srcSet={costumeNeoNostalgia}
            />
          </div>
          {/* Page 10 */}
          <div className="relative w-full h-full">
            {note(10)}
            {/* <img className="absolute w-36" srcSet={stickerAogeya} /> */}
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  2023.10.18
                  <br />
                  フルアルバム「BLACK BOX」発売
                </p>
                <p className="">
                  2023.11.18
                  <br />
                  Reol Oneman Live 2023/24
                  <br />
                  「UNBOX black/pure」
                </p>
                <p className="">
                  2024.04.06
                  <br />
                  Reol Secret Live "極秘LEGIT"
                </p>
              </div>
            </div>
            <img
              className="absolute bottom-8 right-4 w-2/3"
              srcSet={costumeUnbox}
            />
          </div>
          {/* Page 11 */}
          <div className="relative w-full h-full">
            {note(11)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="text-center text-[0.95rem] leading-[1.9rem] tracking-wider">
                <p className="">
                  <br />
                  2024.08.17
                  <br />
                  Reol Oneman Live「No title」
                </p>
              </div>
              <div className="flex justify-center mt-8">
                <img className="w-5/6" srcSet={costumeAll} />
              </div>
            </div>
          </div>
          {/* Page 12 */}
          <div className="relative w-full h-full">
            {note(12)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="text-center text-[0.95rem] leading-[1.9rem] tracking-wider">
                <br />
                <p className="">
                  【企画デザイン】
                  <br />
                  <a href="https://twitter.com/flower_23s" target="_blank">
                    有架 (@flower_23s)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  【Web制作】
                  <br />
                  <a href="https://twitter.com/twilightplc" target="_blank">
                    Pochi (@twilightplc)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <br />
                  【集合イラスト】
                  <br />
                  <a href="https://twitter.com/Ori_hara_oxo" target="_blank">
                    折原 (@Ori_hara_oxo)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a href="https://twitter.com/pinpon__Ooatari" target="_blank">
                    きき (@pinpon__Ooatari)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a href="https://twitter.com/RRRium" target="_blank">
                    きむら (@RRRium)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a href="https://twitter.com/nanashi_tabi113" target="_blank">
                    nanashi (@nanashi_tabi113)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a href="https://twitter.com/flower_23s" target="_blank">
                    有架 (@flower_23s)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a href="https://twitter.com/onikutabetainja" target="_blank">
                    ゆねち (@onikutabetainja)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                </p>
              </div>
            </div>
          </div>
          {/* Page 13 */}
          <div className="relative w-full h-full">{note(13)}</div>
          {/* Page 14 */}
          <div className="relative w-full h-full">{note(14)}</div>
          {/* Page 15 */}
          <div className="relative w-full h-full">
            {note(15, true)}
            <div className="absolute w-full top-[3.4rem]">
              <div className="font-tegakifr font-extrabold text-center text-[1.2rem] leading-[1.9rem] tracking-wider">
                {Array.from({ length: lineNums / 2 - 1 }).map((item) => (
                  <br />
                ))}
                La Route Semèe d'étoiles
                <br />
                avec Reol
              </div>
            </div>
          </div>
        </HTMLFlipBook>
      </div>
    );
  } else {
    return <></>;
  }
};

export default fs20240817;
