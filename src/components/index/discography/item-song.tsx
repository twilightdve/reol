import React, { Component } from "react";
import { Song, SongFeature } from "../../../types/discography";
import { GoLinkExternal } from "react-icons/go";
import { FaCirclePlay } from "react-icons/fa6";
import { BiCommentDetail } from "react-icons/bi";
import { AppDispatch, RouteState } from "../../../redux/store";
import { connect } from "react-redux";
import { setNextVideo } from "../../../redux/slices/playerSlice";
import UtilityService from "../../../services/UtilityService";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import LazyComponent from "../../modules/LazyComponent";

const PITCH_CLASS_LIST = [
  "C",
  "C♯/D♭",
  "D",
  "D♯/E♭",
  "E",
  "F",
  "F♯/G♭",
  "G",
  "G♯/A♭",
  "A",
  "A♯/B♭",
  "B",
];

type Props = {
  song: Song;
  setNextVideo: any;
};

type State = {
  dialogRef: React.RefObject<HTMLDialogElement> | null;
};

class ItemSong extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dialogRef: React.createRef<HTMLDialogElement>(),
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  convertRadarChartData(feature: SongFeature | undefined | null) {
    console.log(feature);
    return [
      {
        subject: "踊りやすさ",
        A: feature?.danceability,
        // B: 110,
        fullMark: 1,
      },
      {
        subject: "元気",
        A: feature?.energy,
        // B: 110,
        fullMark: 1,
      },
      {
        subject: "語り",
        A: feature?.speechiness,
        // B: 110,
        fullMark: 1,
      },
      // {
      //   subject: "アコースティック",
      //   A: feature?.acousticness,
      //   // B: 110,
      //   fullMark: 1,
      // },
      // {
      //   subject: "インスト感",
      //   A: feature?.instrumentalness,
      //   // B: 110,
      //   fullMark: 1,
      // },
      {
        subject: "ライヴ感",
        A: feature?.liveness,
        // B: 110,
        fullMark: 1,
      },
      {
        subject: "ポジティブ",
        A: feature?.valence,
        // B: 110,
        fullMark: 1,
      },
    ];
  }

  render() {
    return (
      <li className="ml-2 py-2">
        <span className="underline underline-offset-4 decoration-dotted decoration-1 text-xs">
          <div
            className="flex justify-start items-center py-1"
            onClick={(event) => {
              UtilityService.gtag({
                category: "click",
                action: "dialog-show",
                label: this.props.song.songName,
              });

              event.stopPropagation();

              document
                .getElementsByTagName("body")[0]
                .classList.add("overflow-hidden");

              this.state.dialogRef?.current &&
                this.state.dialogRef.current.showModal();
            }}
          >
            <span
              className="mr-2"
              dangerouslySetInnerHTML={{
                __html: this.props.song.songName,
              }}
            />
            <BiCommentDetail />
          </div>
        </span>
        {(this.props.song.downloadUrl ||
          this.props.song.musicVideoUrl ||
          this.props.song.lyricVideoUrl ||
          this.props.song.liveVideoUrl) && (
          <ul className="list-none text-xs">
            {this.props.song.downloadUrl && (
              <li className="my-2 ml-4 list-disc">
                <a
                  className="flex text-letter justify-start items-center"
                  href={this.props.song.downloadUrl}
                  target="_blank"
                  onClick={(event) => {
                    UtilityService.gtag({
                      category: "click",
                      action: "link",
                      label: this.props.song.downloadUrl ?? "",
                    });

                    event.stopPropagation();

                    document
                      .getElementsByTagName("body")[0]
                      .classList.add("overflow-hidden");

                    this.state.dialogRef?.current &&
                      this.state.dialogRef.current.showModal();
                  }}
                >
                  <span className="pr-1">download</span>
                  <GoLinkExternal />
                </a>
              </li>
            )}
            {this.props.song.musicVideoUrl && (
              <li
                onClick={(event) => {
                  event.stopPropagation();
                  if (this.props.song.musicVideoUrl) {
                    UtilityService.gtag({
                      category: "click",
                      action: "play",
                      label: this.props.song.musicVideoUrl,
                    });
                    this.props.setNextVideo(this.props.song.musicVideoUrl);
                  }
                }}
              >
                <div className="flex justify-start items-center py-1">
                  <FaCirclePlay className="mr-2" />
                  <span className="text-letter">Music Video</span>
                </div>
              </li>
            )}
            {this.props.song.lyricVideoUrl && (
              <li
                onClick={(event) => {
                  event.stopPropagation();
                  if (this.props.song.lyricVideoUrl) {
                    UtilityService.gtag({
                      category: "click",
                      action: "play",
                      label: this.props.song.lyricVideoUrl,
                    });
                    this.props.setNextVideo(this.props.song.lyricVideoUrl);
                  }
                }}
              >
                <div className="flex justify-start items-center py-1">
                  <FaCirclePlay className="mr-2" />
                  <span className="text-letter">Lyric Video</span>
                </div>
              </li>
            )}
            {this.props.song.liveVideoUrl && (
              <li
                onClick={(event) => {
                  event.stopPropagation();
                  if (this.props.song.liveVideoUrl) {
                    UtilityService.gtag({
                      category: "click",
                      action: "play",
                      label: this.props.song.liveVideoUrl,
                    });
                    this.props.setNextVideo(this.props.song.liveVideoUrl);
                  }
                }}
              >
                <div className="flex justify-start items-center py-1">
                  <FaCirclePlay className="mr-2" />
                  <span className="text-letter">Live Video</span>
                </div>
              </li>
            )}
          </ul>
        )}
        <dialog
          ref={this.state.dialogRef}
          className="w-screen max-w-full sm:w-5/6 h-full sm:max-h-208 bg-gray-900 sm:backdrop-opacity-20 sm:backdrop-blur-xl rounded-lg border-theme mt-40 ml-0 mr-0 mb-0 sm:m-auto sm:p-3"
          onClick={(event) => {
            document
              .getElementsByTagName("body")[0]
              .classList.remove("overflow-hidden");

            if (this.state.dialogRef?.current) {
              this.state.dialogRef.current.close();
            }
          }}
        >
          <div className="container w-full h-full text-white">
            <h3 className="mt-2 mb-2 ml-2 text-base">
              <div className="flex items-center">
                <span className="underline underline-offset-2">
                  {this.props.song.songName}
                </span>
                {this.props.song.lyricUrl && (
                  <a
                    href={this.props.song.lyricUrl}
                    target="_blank"
                    className="ml-1 text-xs"
                  >
                    <BiCommentDetail />
                  </a>
                )}
              </div>
            </h3>
            <div className="m-2 mb-4">
              {this.props.song.lyricMember && (
                <p>作詞：{this.props.song.lyricMember}</p>
              )}
              {this.props.song.musicMember && (
                <p>作曲：{this.props.song.musicMember}</p>
              )}
              {this.props.song.produceMember && (
                <p>編曲：{this.props.song.produceMember}</p>
              )}
            </div>
            {this.props.song.spotifyTrackId && (
              <LazyComponent>
                <iframe
                  className="rounded-xl px-2"
                  src={`https://open.spotify.com/embed/track/${this.props.song.spotifyTrackId}?utm_source=generator`}
                  width="100%"
                  height="152"
                  // frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="eager"
                />
              </LazyComponent>
            )}
            <div className="m-4 leading-6 h-full">
              <p>以下はSpotifyによる解析情報のため参考程度</p>
              <ul className="list-disc list-inside my-2">
                {undefined !== this.props.song.feature?.key && (
                  <li>
                    キー:&nbsp;{PITCH_CLASS_LIST[this.props.song.feature?.key]}
                  </li>
                )}
                {undefined !== this.props.song.feature?.mode && (
                  <li>
                    {1 === this.props.song.feature?.mode
                      ? "メジャー"
                      : "マイナー"}
                    コード
                  </li>
                )}
                {undefined !== this.props.song.feature?.tempo && (
                  <li>
                    テンポ（40-200bpm）:&nbsp;
                    {this.props.song.feature?.tempo}&nbsp;bpm
                  </li>
                )}
                {undefined !== this.props.song.feature?.timeSignature && (
                  <li>
                    拍子（1小節あたり何拍子か）:&nbsp;
                    {this.props.song.feature?.timeSignature}&nbsp;拍子
                  </li>
                )}
                {undefined !== this.props.song.feature?.loudness && (
                  <li>
                    音量・音圧（dB／-60～0db）: &nbsp;
                    {this.props.song.feature?.loudness}&nbsp;db
                  </li>
                )}
              </ul>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={this.convertRadarChartData(this.props.song?.feature)}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0.0, 1.0]} />
                  <Radar
                    name="SongFeature"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </dialog>
      </li>
    );
  }
}

const mapStateToProps = (state: RouteState) => state.player;

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setNextVideo: (url: string) =>
      dispatch(setNextVideo({ videoId: url.replace("https://youtu.be/", "") })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemSong);
