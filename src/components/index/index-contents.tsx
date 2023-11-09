import React, { Component } from "react";
import { DiscographyWithSongs } from "../../types/discography";
import {
  FaMusic,
  FaRegNewspaper,
  FaTwitter,
  FaXTwitter,
  FaCompactDisc,
} from "react-icons/fa6";
import { BsSpeakerFill } from "react-icons/bs";
import NewsCard from "./news-card";
import Discography from "./discography/discography";
import XTimeline from "../modules/xtimeline";
import Live from "./live/live";
import { LiveInfo } from "../../types/live";
import { News } from "../../types/news";
import MainVideo from "./mainVideo";
import { Tabs } from "flowbite-react";
import Opening from "./opening";
import UtilityService from "../../services/UtilityService";

type Props = {
  news: News[];
  discographies: DiscographyWithSongs[];
  liveInfos: LiveInfo[];
};

export default class IndexContents extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return (
      <>
        <Opening />
        <MainVideo
          playlist={this.props.discographies.filter((item) => item.xfdUrl)}
        />
        <div className="relative container mx-auto px-2 w-full">
          <div className="pt-6 px-2 sm:pt-12">
            <h1 className="font-bold text-2xl text-shadow">ABOUT</h1>
            <p className="font-bold text-xs text-letter pt-1">!Legitとは？</p>
          </div>
          <div className="pt-5 px-2 tracking-wide">
            <p className="text-sm sm:text-base leading-loose break-words">
              当サイトは、アーティスト「
              <a href="https://reol.jp/" target="_blank">
                <span className="text-letter">Reol</span>
              </a>
              &nbsp;(REOL/あにょすぺにょすゃゃ/れをる)」の
              <span className="text-lg font-bold underline">
                非公式ファンサイト
              </span>
              です。
              <br />
              自己満足的な推し活の一環として独自にReolに関する情報を発信していきますので、内容に偏りや間違いなどあるかもしれませんが、もしご興味あればご覧ください。
            </p>
            <p className="m-2 p-2 text-xs leading-relaxed bg-gray-200">
              当サイトは、あくまで著作者の権利を守った節度あるコンテンツ運営を行います。問題のあるコンテンツを見つけた際にはお手数ですがご連絡頂けますと幸いです。
              <br />
              また、こんなコンテンツが見たい！等のリクエストをいつでもどんなものでも募集しております。もしリクエストある方は
              <a href="https://twitter.com/twilightplc" target="_blank">
                <FaXTwitter className="mr-1 inline text-base" />
                (旧:&nbsp;Twitter
                <FaTwitter className="ml-1 inline text-base" />)
              </a>
              等で気軽にご連絡ください。
            </p>
          </div>
          <h2
            id="NEWS"
            className="flex items-center font-bold text-xl pt-8 px-2 text-shadow"
          >
            <FaRegNewspaper className="text-sm mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              NEWS
            </span>
          </h2>
          <NewsCard data={this.props.news} />
          <h2
            id="DISCOGRAPHY_LIVE"
            className="flex items-center font-bold text-xl pt-8 px-2 text-shadow"
          >
            <FaMusic className="text-sm mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              DISCOGRAPHY&nbsp;&#047;&nbsp;LIVE
            </span>
          </h2>
          <div className="pt-3 pb-2 px-2">
            <p className="text-sm leading-loose">
              DISCOGRAPHYには過去のリリース作品、LIVEには過去に出演したワンマンライブやツアー、フェスなどの情報を掲載しています。
              <br />
              作品やライブごとに収録曲やセトリ、関連ポストやライブレポートなどを載せていますので、当時のことを遡って感じ取ることができるようになっています。
              <br />
              10年以上の活動期間で、どのタイミングでReolに出会ったかは人それぞれ。
              <br />
              Reolがこれまで残してきた軌跡を遡って、新規も古参もより深くReolを好きになるきっかけになればと思います。
            </p>
          </div>
          <div className="mt-5 sm:mt-10">
            <Tabs.Group
              aria-label="tabs"
              style="fullWidth"
              className="sm:bg-white"
            >
              <Tabs.Item
                active
                icon={FaCompactDisc}
                title="Discography"
                key="tab-discography"
                onClick={() =>
                  UtilityService.gtag("click", "tab-top", "discography")
                }
              >
                <Discography data={this.props.discographies} />
              </Tabs.Item>
              <Tabs.Item
                icon={BsSpeakerFill}
                title="LIVE"
                key="tab-live"
                onClick={() => UtilityService.gtag("click", "tab-top", "live")}
              >
                <Live data={this.props.liveInfos} key="live" />
              </Tabs.Item>
            </Tabs.Group>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <XTimeline id="RRReol" title="Reol れをる" />
            <XTimeline id="RRReol_official" title="Reol Official" />
          </div>
        </div>
      </>
    );
  }
}
