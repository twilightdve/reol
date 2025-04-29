import React, { Component } from "react";
import UtilityService from "../../services/UtilityService";
import { Link } from "gatsby";
import { FaQuestion, FaQuestionCircle, FaTwitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type Props = {
  title: string;
};

type State = {
  dialogRef: React.RefObject<HTMLDialogElement> | null;
};

export default class TopHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dialogRef: React.createRef<HTMLDialogElement>(),
    };
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
            <FaQuestionCircle
              className="text-xl"
              onClick={(event) => {
                event.stopPropagation();
                document
                  .getElementsByTagName("body")[0]
                  .classList.add("overflow-hidden");
                this.state.dialogRef?.current &&
                  this.state.dialogRef.current.showModal();
              }}
            />
            <dialog
              ref={this.state.dialogRef}
              className="w-11/12 max-h-208 bg-gray-200 sm:backdrop-opacity-20 sm:backdrop-blur-xl rounded-lg border border-theme sm:m-auto sm:p-3"
              onClick={(event) => {
                event.stopPropagation();

                document
                  .getElementsByTagName("body")[0]
                  .classList.remove("overflow-hidden");

                if (this.state.dialogRef?.current) {
                  this.state.dialogRef.current.close();
                }
              }}
            >
              <div className="pt-2 px-2 sm:pt-12">
                <h1 className="font-bold text-xl text-shadow">
                  <FaQuestion className="inline mb-1" />
                  ABOUT
                </h1>
                <p className="font-bold text-sm text-letter pt-1">
                  !Legitとは？
                </p>
              </div>
              <div className="pt-2 px-2 tracking-wide">
                <p className="text-sm sm:text-base leading-loose break-words">
                  アーティスト「
                  <a href="https://reol.jp/" target="_blank">
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
                  <a href="https://twitter.com/twilightplc" target="_blank">
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
  }
}
