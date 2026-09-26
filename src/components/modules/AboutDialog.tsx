import React from "react";
import { FaQuestion } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { activityYears } from "../../constants/artist";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

type Props = {
  onClose: () => void;
};

const AboutDialog: React.FC<Props> = ({ onClose }) => {
  useBodyScrollLock();
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-11/12 sm:w-full max-w-lg max-h-[80vh] overflow-y-auto bg-bx-bg border border-bx-line text-bx-ink rounded-lg p-3 relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-bx-ink2 hover:text-bx-ink"
          aria-label="閉じる"
        >
          <FiX className="h-5 w-5" />
        </button>
        <div className="pt-2 px-2 sm:pt-4">
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
      </div>
    </div>
  );
};

export default AboutDialog;
