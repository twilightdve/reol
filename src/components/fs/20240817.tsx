"use client";

import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { FaXTwitter } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";

// Components
import { TitlePage, IntroPage, HistoryPage } from "./pages";
import NoteBackground from "./components/NoteBackground";

// Data
import { historyPagesData, flipBookConfig } from "./data/historyData";

// Images
import costumeHamelnNoDaigourei from "../../images/looks-history/costume_hameln_no_daigourei.png";
import costumeGekijouAlert from "../../images/looks-history/costume_gekijou_alert.png";
import costumeNeoNostalgia from "../../images/looks-history/costume_neo_nostalgia.png";
import costumeUnbox from "../../images/looks-history/costume_unbox.png";
import costumeAll from "../../images/looks-history/costume_all.png";

export const fs20240817 = () => {
  const [initState, setInitState] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const [domRect, setDomRect] = useState<DOMRect>();
  const [rectHeight, setRectHeight] = useState<number>(0);
  const [lineNums, setLineNums] = useState<number>(0);
  const [_window, setWindow] = useState<Window>();

  const updateMarginTop = () => {
    if (bookRef.current) {
      const rect = bookRef.current.getBoundingClientRect();
      setDomRect(rect);
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
          width={_window.innerWidth}
          height={(_window.innerWidth * 364) / 257}
          {...flipBookConfig}
          maxWidth={_window.innerWidth}
          maxHeight={window.innerHeight}
        >
          <TitlePage onLoad={() => setInitState(true)} />
          <IntroPage lineNums={lineNums} />

          {historyPagesData.map((pageData) => (
            <HistoryPage
              key={pageData.page}
              {...pageData}
              lineNums={lineNums}
            />
          ))}

          {/* Page 7 - Hameln no Daigourei */}
          <div className="relative w-full h-full">
            <NoteBackground page={7} lineNums={lineNums} />
            <div className="absolute w-full top-[3.4rem]">
              <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
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
              src={costumeHamelnNoDaigourei}
              alt="Hameln no Daigourei costume"
            />
          </div>

          {/* Page 8 - Gekijou Alert */}
          <div className="relative w-full h-full">
            <NoteBackground page={8} lineNums={lineNums} />
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
              src={costumeGekijouAlert}
              alt="Gekijou Alert costume"
            />
          </div>

          {/* Page 9 - Neo Nostalgia */}
          <div className="relative w-full h-full">
            <NoteBackground page={9} lineNums={lineNums} />
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
              src={costumeNeoNostalgia}
              alt="Neo Nostalgia costume"
            />
          </div>

          {/* Page 10 - Unbox */}
          <div className="relative w-full h-full">
            <NoteBackground page={10} lineNums={lineNums} />
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
              src={costumeUnbox}
              alt="Unbox costume"
            />
          </div>

          {/* Page 11 - All Costumes */}
          <div className="relative w-full h-full">
            <NoteBackground page={11} lineNums={lineNums} />
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
                <img className="w-5/6" src={costumeAll} alt="All costumes" />
              </div>
            </div>
          </div>

          {/* Page 12 - Credits */}
          <div className="relative w-full h-full">
            <NoteBackground page={12} lineNums={lineNums} />
            <div className="absolute w-full top-[3.4rem]">
              <div className="text-center text-[0.95rem] leading-[1.9rem] tracking-wider">
                <br />
                <p className="">
                  【企画デザイン】
                  <br />
                  <a
                    href="https://twitter.com/flower_23s"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    有架 (@flower_23s)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  【Web制作】
                  <br />
                  <a
                    href="https://twitter.com/twilightplc"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pochi (@twilightplc)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <br />
                  【集合イラスト】
                  <br />
                  <a
                    href="https://twitter.com/Ori_hara_oxo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    折原 (@Ori_hara_oxo)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/pinpon__Ooatari"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    きき (@pinpon__Ooatari)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/RRRium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    きむら (@RRRium)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/nanashi_tabi113"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    nanashi (@nanashi_tabi113)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/flower_23s"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    有架 (@flower_23s)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/onikutabetainja"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ゆねち (@onikutabetainja)
                    <FaXTwitter className="inline-block ml-3 mb-1 text-[0.74rem]" />
                    <GoLinkExternal className="inline-block mb-4 text-[0.5rem]" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Page 13 - Empty */}
          <div className="relative w-full h-full">
            <NoteBackground page={13} lineNums={lineNums} />
          </div>

          {/* Page 14 - Empty */}
          <div className="relative w-full h-full">
            <NoteBackground page={14} lineNums={lineNums} />
          </div>

          {/* Page 15 - Final */}
          <div className="relative w-full h-full">
            <NoteBackground page={15} lineNums={lineNums} isFinal={true} />
            <div className="absolute w-full top-[3.4rem]">
              <div className="font-tegakifr font-extrabold text-center text-[1.2rem] leading-[1.9rem] tracking-wider">
                {Array.from({ length: Math.floor(lineNums / 2) - 1 }).map(
                  (_, index) => (
                    <br key={index} />
                  )
                )}
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
