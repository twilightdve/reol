import React, { useRef, useCallback } from "react";
import UtilityService from "../../services/UtilityService";
import { Link } from "gatsby";
import { FaQuestion, FaQuestionCircle, FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { BsBarChartLine } from "react-icons/bs";

type Props = {
  title: string;
};

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
      <nav className="bg-theme border-gray-200">
        <div className="w-full flex items-center justify-between mx-auto p-4">
          <Link to="/" className="block flex-shrink min-w-0">
            <span className="self-center text-2xl sm:text-3xl font-icon font-medium whitespace-nowrap text-letter text-shadow">
              !Legit
            </span>
            <span className="pl-2 sm:pl-3 font-bold text-xs tracking-widest hidden sm:inline">
              Reol Unofficial Fansite
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* 統合検索 */}
            <Link
              to="/search/"
              className="flex items-center px-2 sm:px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap font-medium"
              title="楽曲・LIVE・ロケ地を横断検索"
              aria-label="検索"
            >
              <FiSearch className="text-sm sm:mr-1" />
              <span className="hidden sm:inline">検索</span>
            </Link>
            {/* 楽曲統計 */}
            <Link
              to="/songs/stats/"
              className="flex items-center px-2 sm:px-3 py-1 text-xs bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors whitespace-nowrap font-medium"
              title="楽曲ごとの演奏履歴・統計"
              aria-label="楽曲統計"
            >
              <BsBarChartLine className="text-sm sm:mr-1" />
              <span className="hidden sm:inline">楽曲統計</span>
            </Link>
            {/* 美辞学ナビへのリンク */}
            <a 
              href="/bijigaku-navi/"
              className="px-2 sm:px-3 py-1 text-xs bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors whitespace-nowrap font-medium"
            >
              美辞学ﾅﾋﾞ
            </a>
            <FaQuestionCircle className="text-xl flex-shrink-0" onClick={handleDialogOpen} />
          </div>
          <dialog
            className="w-11/12 max-h-208 bg-gray-200 sm:backdrop-opacity-20 rounded-lg border border-theme sm:m-auto sm:p-3"
            onClick={handleDialogClose}
            ref={dialogRef}
          >
            <div className="pt-2 px-2 sm:pt-12">
              <h1 className="font-bold text-xl text-shadow">
                <FaQuestion className="inline mb-1" />
                ABOUT
              </h1>
              <p className="font-bold text-sm text-letter pt-1">!Legitとは？</p>
            </div>
            <div className="pt-2 px-2 tracking-wide">
              <p className="text-sm sm:text-base leading-loose break-words">
                アーティスト「
                <a
                  href="https://reol.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-letter">Reol</span>
                </a>
                &nbsp;(REOL/あにょすぺにょすゃゃ/れをる)」の
                <span className="text-sm font-bold">非公式ファンサイト</span>
                です。
                <br />
                これまでReolが辿ってきた10年以上の活動の中で、どのタイミングで出会ったかは人それぞれ。
                <br />
                Reolの活動の軌跡を余すことなく遡れる様に様々なコンテンツを掲載しますので、当サイトを通して新参も古参もより深くReolを好きになるきっかけになれば幸いです。
                <br />
                また、当サイトは自己満足的な推し活の一環として独自にReolに関する情報を発信していきますので、内容に偏りや間違いなどあるかもしれませんが、もしご興味あればご覧ください。
              </p>
              <p className="my-2 p-2 text-xs leading-normal bg-gray-300">
                あくまで著作者の権利を守ることを第一に考え、許可されていない方法での音楽や映像、画像等コンテンツの掲載は行いませんが、もし運営者の不注意や無知により権利侵害をしているなど問題を見つけた際にはお手数ですがご連絡頂けますと幸いです。
                <br />
                また、こんなコンテンツが見たい！等のリクエストをいつでもどんなものでも募集しております。もしリクエストある方は
                <a
                  href="https://twitter.com/twilightplc"
                  target="_blank"
                  rel="noopener noreferrer"
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
