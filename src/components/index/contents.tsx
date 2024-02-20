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
import Discography from "./discography/discography";
import Live from "./live/live";
import { LiveInfo } from "../../types/live";
import MainVideo from "./mainVideo";
import { Accordion, Badge, Tabs } from "flowbite-react";
import Opening from "./opening";
import UtilityService from "../../services/UtilityService";
import RecommendList from "./recommend-list";
import { Recommend } from "../../types/recommend";
import { Place, PlaceItem } from "../../types/places";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { GoLinkExternal } from "react-icons/go";
import YouTube from "react-youtube";
import InfoWindow from "../modules/infoWindow";
import Marker from "../modules/marker";
import Map from "../modules/map";
import { TbMapPinHeart } from "react-icons/tb";

type Props = {
  recommend: Recommend[];
  discographies: DiscographyWithSongs[];
  liveInfos: LiveInfo[];
  places: Place[];
};

type State = {
  latLngList: MarkerInfo[];
  center: google.maps.LatLngLiteral;
  zoom: number;
};

interface MarkerInfo extends Place, PlaceItem {
  position: google.maps.LatLngLiteral;
  visible: boolean;
}

export default class IndexContents extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const latLngList = props.places
      .map((place) =>
        (place.items ?? []).map((item) => ({
          ...place,
          ...item,
          position: { lat: item.lat, lng: item.lng },
          visible: true,
        }))
      )
      .flat();
    this.state = {
      latLngList,
      center: this.calculateCenter(latLngList),
      zoom: 5,
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  calculateCenter(
    items: PlaceItem[] | google.maps.LatLngLiteral[]
  ): google.maps.LatLngLiteral {
    let center: google.maps.LatLngLiteral = {
      lat: 0,
      lng: 0,
    };
    if (items.length === 1) {
      center = {
        lat: items[0].lat,
        lng: items[0].lng,
      };
    } else if (items.length > 1) {
      center = items.reduce((previous, current) => {
        previous.lat += current.lat;
        previous.lng += current.lng;
        return previous;
      }, center);
      center.lat = center.lat / items.length;
      center.lng = center.lng / items.length;
    }
    return center;
  }

  mainMapRender(status: Status) {
    return <></>;
  }

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
            <p className="text-xs sm:text-base leading-loose break-words">
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
            id="RECOMMEND"
            className="flex items-center font-bold text-xl pt-8 px-2 text-shadow"
          >
            <FaRegNewspaper className="text-sm mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              RECOMMEND
            </span>
          </h2>
          <RecommendList data={this.props.recommend} />
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
            <p className="text-xs leading-loose">
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
                  UtilityService.gtag({
                    category: "click",
                    action: "tab-top",
                    label: "discography",
                  })
                }
              >
                <Discography data={this.props.discographies} />
              </Tabs.Item>
              <Tabs.Item
                icon={BsSpeakerFill}
                title="LIVE"
                key="tab-live"
                onClick={() =>
                  UtilityService.gtag({
                    category: "click",
                    action: "tab-top",
                    label: "live",
                  })
                }
              >
                <Live data={this.props.liveInfos} key="live" />
              </Tabs.Item>
            </Tabs.Group>
          </div>
        </div>
        <h2
          id="PLACES"
          className="flex items-center font-bold text-xl py-5 px-2 text-shadow"
        >
          <TbMapPinHeart className="text-sm mr-2" />
          <span className="underline underline-offset-4 decoration-dashed decoration-1">
            聖地まとめ
          </span>
        </h2>
        <div className="sticky top-0 aspect-video bg-gray-200 z-20 border-b-2">
          <Wrapper
            apiKey={`${process.env.GOOGLE_MAP_API_KEY}`}
            render={this.mainMapRender}
          >
            <Map
              options={{
                center: this.state.center,
                zoom: this.state.zoom,
                style: { flexGrow: "1", height: "100%" },
              }}
            >
              {this.state.latLngList.map((item, i) => (
                <Marker
                  key={`place-item-${i}-${item.position.lat}-${item.position.lng}`}
                  options={{
                    title: item.name,
                    position: item.position,
                  }}
                  visible={item.visible}
                >
                  <InfoWindow options={{ content: item.name }} />
                </Marker>
              ))}
            </Map>
          </Wrapper>
        </div>
        <div className="relative container mx-auto w-full bg-white">
          <Accordion collapseAll>
            {this.props.places.map((place, placeIndex) => (
              <Accordion.Panel key={`place-${place.placeId}`}>
                <Accordion.Title className="relative text-sm">
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    onClick={(event) => {
                      if (place.items) {
                        const center = this.calculateCenter(place.items);
                        this.setState({
                          ...this.state,
                          latLngList: this.state.latLngList.map((listItem) => ({
                            ...listItem,
                            visible: listItem.placeId === place.placeId,
                          })),
                          center,
                          zoom: place.zoom,
                        });
                      }
                    }}
                  >
                    <div className="flex items-center tracking-widest w-full h-full pl-2">
                      {place.type && (
                        <Badge
                          color={(() => {
                            if (place.type === "MV") {
                              return "warning";
                            } else if (place.type === "CM") {
                              return "purple";
                            } else if (place.type === "TV") {
                              return "pink";
                            }
                          })()}
                          className="py-1"
                        >
                          {place.type}
                        </Badge>
                      )}
                      <span className="ml-2">{place.title}</span>
                    </div>
                  </div>
                </Accordion.Title>
                <Accordion.Content>
                  {place.url && place.url.indexOf("youtu.be") && (
                    <YouTube
                      videoId={place.url.replace("https://youtu.be/", "")}
                      opts={{
                        height: "180",
                        width: "320",
                        playerVars: {
                          autoplay: 0,
                          enablejsapi: 1,
                          playsinline: 1,
                          loop: 1,
                          rel: 0,
                          color: "white",
                        },
                      }}
                      className="pb-3"
                      iframeClassName="aspect-video w-full h-full"
                    />
                  )}
                  {place.items?.map((item, itemIndex) => (
                    <div
                      key={`place-${item.placeId}-${item.placeItemId}`}
                      className="pb-5"
                    >
                      {item.placeUrl ? (
                        <a
                          href={item.placeUrl}
                          className="w-full h-full"
                          target="_blank"
                        >
                          <h3 className="flex items-center text-sm mb-2 p-2 bg-theme text-white font-bold rounded-sm tracking-widest">
                            {item.placeItemId}.&nbsp;{item.name}
                            <GoLinkExternal className="ml-1 text-xs sm:text-sm" />
                          </h3>
                        </a>
                      ) : (
                        <h3 className="text-sm mb-2 px-2 py-1 bg-theme text-white font-bold rounded-sm">
                          {item.placeItemId}.&nbsp;{item.name}
                        </h3>
                      )}
                      {item.memo && (
                        <p
                          className="text-sm pb-2"
                          dangerouslySetInnerHTML={{
                            __html: item.memo,
                          }}
                        />
                      )}
                      <iframe
                        src={item.mapsEmbedUrl}
                        className="aspect-video w-full pointer-events-none"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <p className="text-xs py-1">{item.address}</p>
                    </div>
                  ))}
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
          <p className="text-xs py-2">
            ※ここに載っていない聖地情報いつでもお待ちしておりますmm
          </p>
        </div>
      </>
    );
  }
}
