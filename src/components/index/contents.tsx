import React, { Component } from "react";
import { connect } from "react-redux";
import { DiscographyWithSongs } from "../../types/discography";
import { GoLinkExternal } from "react-icons/go";
import { FaExclamation } from "react-icons/fa";
import { FaRegNewspaper, FaCompactDisc, FaCirclePlay } from "react-icons/fa6";
import Discography from "./discography/discography";
import Live from "./live/live";
import { LiveInfo } from "../../types/live";
import MainVideo from "../modules/mainVideo";
import Opening from "./opening";
import RecommendList from "./recommend-list";
import { Recommend } from "../../types/recommend";
import { Place, PlaceItem } from "../../types/places";
import { Status } from "@googlemaps/react-wrapper";
import { GoListUnordered } from "react-icons/go";
import TrackingFooter from "../modules/trackingFooter";
import { AppDispatch, RouteState } from "../../redux/store";
import { ROUTE_NAMES } from "../../types/common";
import { BiCommentDetail } from "react-icons/bi";
import { BsSpeakerFill } from "react-icons/bs";
import { TbMapPinHeart } from "react-icons/tb";
import YouTube from "react-youtube";
// import InfoWindow from "../modules/infoWindow";
// import Marker from "../modules/marker";
// import Map from "../modules/map";
import { Accordion, Badge } from "flowbite-react";
import { setRoute } from "../../redux/slices/routeSlice";
import Photography from "./photography/photography";
import { posts } from "./photography/posts";
import LazyComponent from "../modules/LazyComponent";

type Props = {
  recommend: Recommend[];
  discographies: DiscographyWithSongs[];
  liveInfos: LiveInfo[];
  places: Place[];
  currentRoute: string;
  setRoute: any;
  getReleases: any;
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

class IndexContents extends Component<Props, State> {
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

  componentDidMount() {
    if (location.hash.length > 0) {
      console.log(location.hash.replace("#", ""));
      this.props.setRoute(location.hash.replace("#", ""));
    }
  }

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

  renderHome() {
    return (
      <section id="HOME" style={{ contentVisibility: "auto" }}>
        <h2
          id="RECOMMEND"
          className="font-bold text-lg pt-4 px-2 text-shadow tracking-wider"
        >
          <FaExclamation className="inline text-sm mb-1" />
          <span>Pick Up Post</span>
        </h2>
        <RecommendList data={this.props.recommend} />
      </section>
    );
  }

  renderDiscography() {
    return (
      <section id="DISCOGRAPHY" style={{ contentVisibility: "auto" }}>
        <div className="pt-6 pb-2 px-2 sm:pt-12">
          <h2 className="flex items-center font-bold text-lg text-shadow">
            <FaCompactDisc className="text-lg mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              DISCOGRAPHY
            </span>
          </h2>
          <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
            DISCOGRAPHYではこれまでのリリース情報や歌ってみた動画などの一覧を時間軸で掲載しています。
          </div>
        </div>
        <Discography data={this.props.discographies} />
        <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-gray-200">
          <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide">
            <li>
              上部に表示されたハッシュタグを押すと一覧を簡易的にフィルタすることができます
              <br />
              例）「#れをる」を押下すると「れをる」名義の情報のみが表示されます
            </li>
            <li>
              タイトル左の
              <FaCirclePlay className="inline" />
              をタップすると画面上部のプレイヤーで動画を再生します
            </li>
            <li>
              「
              <GoListUnordered className="inline" />
              開く」を押すと収録曲一覧や楽曲ごとの各種リンクが表示されます
            </li>
            <li>
              曲名の右隣に「
              <BiCommentDetail className="inline" />
              」が表示されている場合、クリックするとSpotifyのリンクや楽曲の解析情報が表示されます
            </li>
          </ul>
        </div>
      </section>
    );
  }

  renderLive() {
    return (
      <div id="LIVE">
        <div className="pt-6 pb-2 px-2 sm:pt-12">
          <h2 className="flex items-center font-bold text-lg text-shadow">
            <BsSpeakerFill className="text-lg mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              LIVE
            </span>
          </h2>
          <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
            LIVEでは過去に出演したワンマンライヴやツアー、フェスなどの情報を掲載しています。
            <br />
            ライヴごとのセトリや関連ポスト、ライヴレポートなどを載せていますので、参加できなかったライヴもどんな雰囲気だったのか少しでも感じ取れる様な情報を掲載しています。
          </div>
        </div>
        <Live data={this.props.liveInfos} key="live" />
        <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-gray-200">
          <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide">
            <li>
              上部に表示されたハッシュタグを押すと一覧を簡易的にフィルタすることができます
              <br />
              例）「#れをる」を押下すると「れをる」名義の情報のみが表示されます
            </li>
            <li>
              「
              <GoListUnordered className="inline" />
              &nbsp;詳細」を押すとライヴレポートや開催場所、セトリ、関連ポストなどの情報が表示されます
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderPlace() {
    return (
      <section id="PLACE" style={{ contentVisibility: "auto" }}>
        <div className="pt-6 pb-2 px-2 sm:pt-12">
          <h2 className="flex items-center font-bold text-lg text-shadow">
            <TbMapPinHeart className="text-lg mr-2" />
            <span className="underline underline-offset-4 decoration-dashed decoration-1">
              PLACE(聖地)
            </span>
          </h2>
          <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
            PLACEではReolが過去にMV撮影やTV番組の収録等で訪れたことのあるいわゆる「聖地」の情報を掲載しております。
            <br />
            聖地巡礼の参考情報としてご覧ください（掲載されていない情報があればぜひ教えていただけますと幸いです）。
          </div>
        </div>
        <div>
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
                            latLngList: this.state.latLngList.map(
                              (listItem) => ({
                                ...listItem,
                                visible: listItem.placeId === place.placeId,
                              })
                            ),
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
                  <Accordion.Content
                    theme={{
                      base: "last:rounded-b-lg first:rounded-t-lg",
                    }}
                  >
                    {place.url && place.url.indexOf("youtu.be") && (
                      <LazyComponent>
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
                          iframeClassName="w-full h-48"
                        />
                      </LazyComponent>
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
                            className="text-sm pl-2 pb-2"
                            dangerouslySetInnerHTML={{
                              __html: item.memo,
                            }}
                          />
                        )}
                        <iframe
                          src={item.mapsEmbedUrl}
                          className="w-full h-48 pointer-events-none"
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
              ※ここに載っていない聖地情報いつでもお待ちしております
            </p>
          </div>
        </div>
      </section>
    );
  }

  renderPhotos() {
    return (
      <section id="PHOTOS" style={{ contentVisibility: "auto" }}>
        <h2 className="font-bold text-lg pt-4 px-2 text-shadow">
          <FaRegNewspaper className="inline text-sm mr-2" />
          <span>PHOTOGRAPHY</span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
          PHOTOGRAPHYではこれまで私が参加したライヴやイベント、Reol関連の聖地巡礼で撮影した写真や動画を掲載しています。
          <br />
        </div>
        <Photography posts={posts} />
      </section>
    );
  }

  renderCurrentContents(route: string) {
    switch (route) {
      case ROUTE_NAMES[0]:
        return this.renderHome();
      case ROUTE_NAMES[1]:
        return this.renderDiscography();
      case ROUTE_NAMES[2]:
        return this.renderLive();
      case ROUTE_NAMES[3]:
        return this.renderPlace();
      case ROUTE_NAMES[4]:
        return this.renderPhotos();
      default:
        break;
    }
  }

  render() {
    return (
      <>
        <Opening />
        <MainVideo
          playlist={this.props.discographies.filter((item) => item.xfdUrl)}
        />
        <main className="relative container mx-auto px-2 w-full">
          {this.renderCurrentContents(this.props.currentRoute)}
        </main>
        <TrackingFooter />
      </>
    );
  }
}

const mapStateToProps = (state: RouteState) => state.route;
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setRoute: (route: string) => dispatch(setRoute({ currentRoute: route })),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(IndexContents);
