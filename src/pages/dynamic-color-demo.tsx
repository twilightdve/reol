import React, { useState } from "react";
import { graphql, PageProps } from "gatsby";
import SEO from '../components/SEO';
import { Button } from "flowbite-react";
import EnhancedDiscography from "../components/index/discography/enhanced-discography";
import EnhancedLive from "../components/index/live/enhanced-live";
import { DiscographyWithSongs } from "../types/discography";
import { LiveInfo } from "../types/live";
import "../styles/dynamic-colors.css";

export const query = graphql`
  query DynamicColorDemoPage {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    discography {
      discographyWithSongs {
        discographyUuid
        slug
        title
        releaseDate
        name
        format
        siteUrl
        xfdUrl
        themeColorPrimary
        themeColorSecondary
        songs {
          songUuid
          slug
          discographyUuid
          discographyTitle
          songNo
          songName
          tieupDescription
          downloadUrl
          musicVideoUrl
          lyricVideoUrl
          liveVideoUrl
          lyricUrl
          spotifyTrackId
          lyricMember
          musicMember
          produceMember
          etcMember
          feature {
            danceability
            energy
            key
            loudness
            mode
            speechiness
            acousticness
            instrumentalness
            liveness
            valence
            tempo
            durationMs
            timeSignature
          }
        }
        reports {
          discographyRepoUuid
          discographyUuid
          discographyReportName
          discographyReportUrl
        }
        posts {
          discographyPostUuid
          discographyUuid
          discographyPostId
          discographyPostHTML
        }
      }
    }
    live {
      liveInfos {
        liveUuid
        slug
        title
        date
        type
        siteUrl
        spotifyPlaylistId
        themeColorPrimary
        themeColorSecondary
        reports {
          liveReportUuid
          liveUuid
          liveReportName
          liveReportUrl
        }
        posts {
          livePostUuid
          liveUuid
          livePostId
          livePostHTML
        }
        items {
          liveItemUuid
          slug
          liveUuid
          liveItemName
          date
          place
          placeSite
          address
          googleMapsUrl
          spotifyPlaylistId
          setList {
            liveItemSongUuid
            liveItemUuid
            songUuid
            liveItemSongName
            type
          }
          posts {
            liveItemPostUuid
            liveItemUuid
            liveItemPostId
            liveItemPostHTML
          }
        }
      }
    }
  }
`;

const DynamicColorDemo: React.FC<PageProps<any>> = ({ data }) => {
  const [viewMode, setViewMode] = useState<"enhanced" | "both">("enhanced");
  const discographies: DiscographyWithSongs[] = data.discography.discographyWithSongs;
  const liveInfos: LiveInfo[] = data.live.liveInfos;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6 demo-header">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎨 Dynamic Color Palette Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Spotify風の動的カラーパレットシステムのデモンストレーション
            </p>
          </div>

        {/* コントロールパネル */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            表示モード切り替え
          </h3>
          <div className="flex gap-2">
            <Button
              color={viewMode === "enhanced" ? "blue" : "gray"}
              onClick={() => setViewMode("enhanced")}
              size="sm"
            >
              Enhanced Mode
            </Button>
            <Button
              color={viewMode === "both" ? "blue" : "gray"}
              onClick={() => setViewMode("both")}
              size="sm"
            >
              Both Modes
            </Button>
          </div>
        </div>

        {/* Discography Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📀 DISCOGRAPHY
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <EnhancedDiscography discographyWithSongs={discographies} />
          </div>
        </section>

        {/* Live Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎤 LIVE
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <EnhancedLive liveInfos={liveInfos} />
          </div>
        </section>

        {/* 説明セクション */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ 実装された機能
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>
                <strong>動的背景色：</strong>
                タイトルに基づいた純色グラデーション（99-100%）
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>
                <strong>コンパクトレイアウト：</strong>
                非展開時は2行の横並び表示
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>
                <strong>スムーズな遷移：</strong>
                ホバー・展開時のアニメーション
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">▶</span>
              <span>
                <strong>レスポンシブ対応：</strong>
                モバイルでも最適な表示
              </span>
            </li>
          </ul>
        </section>
        </div>
      </div>
    </>
  );
};

export default DynamicColorDemo;

export const Head = () => (
  <SEO
    title="Dynamic Color Demo"
    description="Spotify風の動的カラーパレットシステムのデモ"
    path="/dynamic-color-demo/"
  />
);
