import React, { useRef, useCallback } from "react";
import { Song, SongFeature } from "../../../types/discography";
import { GoLinkExternal } from "react-icons/go";
import { FaCirclePlay } from "react-icons/fa6";
import { BiCommentDetail } from "react-icons/bi";
import { useAppDispatch } from "../../../redux/hooks";
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

// 簡易的なColorPalette型定義（colorExtractorが見つからないため）
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

const defaultColorPalette: ColorPalette = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: "#28a745",
  background: "#ffffff",
  surface: "#f8f9fa",
};

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
  colorPalette?: ColorPalette;
};

const ItemSong: React.FC<Props> = ({ song, colorPalette }) => {
  const dispatch = useAppDispatch();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const colorPaletteToUse = colorPalette || defaultColorPalette;

  const convertRadarChartData = useCallback(
    (feature: SongFeature | undefined | null) => {
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
    },
    []
  );

  const handleDialogOpen = useCallback(
    (event: React.MouseEvent) => {
      UtilityService.gtag({
        category: "click",
        action: "dialog-show",
        label: song.songName,
      });

      event.stopPropagation();
      document.body.classList.add("overflow-hidden");
      dialogRef.current?.showModal();
    },
    [song.songName]
  );

  const handleDialogClose = useCallback(() => {
    document.body.classList.remove("overflow-hidden");
    dialogRef.current?.close();
  }, []);

  const handleDownloadClick = useCallback(
    (event: React.MouseEvent) => {
      UtilityService.gtag({
        category: "click",
        action: "link",
        label: song.downloadUrl ?? "",
      });

      event.stopPropagation();
      document.body.classList.add("overflow-hidden");
      dialogRef.current?.showModal();
    },
    [song.downloadUrl]
  );

  const handleVideoPlay = useCallback(
    (videoUrl: string, event: React.MouseEvent) => {
      event.stopPropagation();
      UtilityService.gtag({
        category: "click",
        action: "play",
        label: videoUrl,
      });
      dispatch(
        setNextVideo({ videoId: videoUrl.replace("https://youtu.be/", "") })
      );
    },
    [dispatch]
  );

  return (
    <li className="ml-2 py-2">
      <span className="underline underline-offset-4 decoration-dotted decoration-1 text-xs">
        <div
          className="flex justify-start items-center py-1 transition-colors duration-300 hover:opacity-80"
          style={{ color: colorPaletteToUse.primary }}
          onClick={handleDialogOpen}
        >
          <span
            className="mr-2"
            dangerouslySetInnerHTML={{
              __html: UtilityService.sanitizeHTML(song.songName),
            }}
          />
          <BiCommentDetail />
        </div>
      </span>
      {(song.downloadUrl ||
        song.musicVideoUrl ||
        song.lyricVideoUrl ||
        song.liveVideoUrl) && (
        <ul className="list-none text-xs">
          {song.downloadUrl && (
            <li className="my-2 ml-4 list-disc">
              <a
                className="flex justify-start items-center transition-colors duration-300 hover:opacity-80"
                style={{ color: colorPaletteToUse.secondary }}
                href={song.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
              >
                <span className="pr-1">download</span>
                <GoLinkExternal />
              </a>
            </li>
          )}
          {song.musicVideoUrl && (
            <li
              onClick={(event) => handleVideoPlay(song.musicVideoUrl!, event)}
            >
              <div className="flex justify-start items-center py-1">
                <FaCirclePlay className="mr-2" />
                <span className="text-letter">Music Video</span>
              </div>
            </li>
          )}
          {song.lyricVideoUrl && (
            <li
              onClick={(event) => handleVideoPlay(song.lyricVideoUrl!, event)}
            >
              <div className="flex justify-start items-center py-1">
                <FaCirclePlay className="mr-2" />
                <span className="text-letter">Lyric Video</span>
              </div>
            </li>
          )}
          {song.liveVideoUrl && (
            <li onClick={(event) => handleVideoPlay(song.liveVideoUrl!, event)}>
              <div className="flex justify-start items-center py-1">
                <FaCirclePlay className="mr-2" />
                <span className="text-letter">Live Video</span>
              </div>
            </li>
          )}
        </ul>
      )}
      <dialog
        ref={dialogRef}
        className="w-screen max-w-full sm:w-5/6 h-full sm:max-h-208 bg-gray-900 sm:backdrop-opacity-20 sm:backdrop-blur-xl rounded-lg border-theme mt-40 ml-0 mr-0 mb-0 sm:m-auto sm:p-3"
        onClick={handleDialogClose}
      >
        <div className="container w-full h-full text-white">
          <h3 className="mt-2 mb-2 ml-2 text-base">
            <div className="flex items-center">
              <span className="underline underline-offset-2">
                {song.songName}
              </span>
              {song.lyricUrl && (
                <a
                  href={song.lyricUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-xs"
                >
                  <BiCommentDetail />
                </a>
              )}
            </div>
          </h3>
          <div className="m-2 mb-4">
            {song.lyricMember && <p>作詞：{song.lyricMember}</p>}
            {song.musicMember && <p>作曲：{song.musicMember}</p>}
            {song.produceMember && <p>編曲：{song.produceMember}</p>}
          </div>
          {song.spotifyTrackId && (
            <LazyComponent>
              <iframe
                className="rounded-xl px-2"
                src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator`}
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
              {undefined !== song.feature?.key && (
                <li>キー:&nbsp;{PITCH_CLASS_LIST[song.feature?.key]}</li>
              )}
              {undefined !== song.feature?.mode && (
                <li>
                  {1 === song.feature?.mode ? "メジャー" : "マイナー"}
                  コード
                </li>
              )}
              {undefined !== song.feature?.tempo && (
                <li>
                  テンポ（40-200bpm）:&nbsp;
                  {song.feature?.tempo}&nbsp;bpm
                </li>
              )}
              {undefined !== song.feature?.timeSignature && (
                <li>
                  拍子（1小節あたり何拍子か）:&nbsp;
                  {song.feature?.timeSignature}&nbsp;拍子
                </li>
              )}
              {undefined !== song.feature?.loudness && (
                <li>
                  音量・音圧（dB／-60～0db）: &nbsp;
                  {song.feature?.loudness}&nbsp;db
                </li>
              )}
            </ul>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={convertRadarChartData(song?.feature)}
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
};

export default ItemSong;
