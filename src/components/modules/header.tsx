import React, { useRef, useCallback } from "react";
import UtilityService from "../../services/UtilityService";
import { activityYears } from "../../constants/artist";
import { Link } from "gatsby";
import { FaQuestion, FaQuestionCircle, FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";

type Props = {
  title: string;
};

const NAV_ITEMS = [
  { label: "DISCOGRAPHY", to: "/discography/" },
  { label: "LIVE", to: "/live/" },
  { label: "PLACE", to: "/place/" },
  { label: "PHOTO", to: "/photos/" },
];

const TopHeader: React.FC<Props> = ({ title }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleDialogOpen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    document.body.classList.add("overflow-hidden");
    dialogRef.current?.showModal();
  }, []);

  const handleDialogClose = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    document.body.classList.remove("overflow-hidden");
    dialogRef.current?.close();
  }, []);

  return (
    <header className="relative z-40 h-16">
      <nav className="bg-bx-bg/80 backdrop-blur border-b border-bx-line">
        <div className="w-full flex items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-baseline gap-2.5 flex-shrink min-w-0">
            <span className="self-center text-2xl sm:text-3xl font-icon font-medium whitespace-nowrap text-bx-ink">
              !Legit
            </span>
            <span className="text-[10px] font-bold tracking-[0.24em] hidden sm:inline text-bx-ink2">
              REOL UNOFFICIAL FANSITE
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
            <nav className="hidden md:flex items-center gap-4 sm:gap-5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[11.5px] font-bold tracking-widest whitespace-nowrap text-bx-ink2 hover:text-bx-blue transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* 統合検索 */}
            <Link
              to="/search/"
              className="flex items-center px-2 sm:px-3 py-1 text-xs bg-bx-yellow text-bx-bg rounded-full hover:opacity-90 transition-opacity whitespace-nowrap font-medium"
              title="楽曲・LIVE・ロケ地を横断検索"
              aria-label="検索"
            >
              <FiSearch className="text-sm sm:mr-1" />
              <span className="hidden sm:inline">検索</span>
            </Link>
            <FaQuestionCircle className="text-xl flex-shrink-0 text-bx-ink" onClick={handleDialogOpen} />
          </div>
          <dialog
            className="w-11/12 max-h-208 bg-bx-bg border border-bx-line text-bx-ink sm:backdrop-opacity-20 rounded-lg sm:m-auto sm:p-3"
            onClick={handleDialogClose}
            ref={dialogRef}
          >
            <div className="pt-2 px-2 sm:pt-12">
              <h1 className="font-bold text-xl">
                <FaQuestion className="inline mb-1" />
                ABOUT
              </h1>
              <p className="font-bold text-sm text-bx-blue pt-1">!Legitとは？</p>
            </div>
            <div className="pt-2 px-2 tracking-wide">
              <p className="text-sm sm:text-base leading-loose break-words">
                アーティスト「
                <a
                  href="https://reol.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  // dialog 全体の onClick(close)へのバブリングで遷移が
                  // キャンセルされる環境があるため止める
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="text-bx-blue">Reol</span>
                </a>
                &nbsp;(REOL/あにょすぺにょすゃゃ/れをる)」の
                <span className="text-sm font-bold">非公式ファンサイト</span>
                です。
                <br />
                これまでReolが辿ってきた、れをる時代から数えて{activityYears()}年の活動の中で、どのタイミングで出会ったかは人それぞれ。
                <br />
                Reolの活動の軌跡を余すことなく遡れる様に様々なコンテンツを掲載しますので、当サイトを通して新参も古参もより深くReolを好きになるきっかけになれば幸いです。
                <br />
                また、当サイトは自己満足的な推し活の一環として独自にReolに関する情報を発信していきますので、内容に偏りや間違いなどあるかもしれませんが、もしご興味あればご覧ください。
              </p>
              <p className="my-2 p-2 text-xs leading-normal bg-bx-bg border border-bx-line text-bx-ink3">
                あくまで著作者の権利を守ることを第一に考え、許可されていない方法での音楽や映像、画像等コンテンツの掲載は行いませんが、もし運営者の不注意や無知により権利侵害をしているなど問題を見つけた際にはお手数ですがご連絡頂けますと幸いです。
                <br />
                また、こんなコンテンツが見たい！等のリクエストをいつでもどんなものでも募集しております。もしリクエストある方は
                <a
                  href="https://twitter.com/twilightplc"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <FaXTwitter className="mr-1 inline text-xs" />
                </a>
                等でお気軽にご連絡ください。
              </p>
            </div>
          </dialog>
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
