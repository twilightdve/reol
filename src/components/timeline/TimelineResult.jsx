import React, { useState } from "react";
import { FaCalendarAlt, FaMusic, FaMicrophone, FaMapMarkerAlt, FaShare, FaDownload } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";

const TimelineResult = ({ timelineData, onReset, onBack }) => {
  const [shareImageUrl, setShareImageUrl] = useState(null);
  
  const { userInfo, timeline } = timelineData;

  const generateShareImage = async () => {
    // 簡単なシェア用テキストを生成
    const shareText = `${userInfo.nickname}さんのReol年表\n${userInfo.startYear}年からReolと歩んだ${timeline.length}年間の軌跡`;
    
    // 実際の実装では、Canvas APIを使って画像を生成
    // ここでは簡易的にテキストを返す
    return shareText;
  };

  const handleShare = async () => {
    if (navigator.share) {
      const shareText = await generateShareImage();
      try {
        await navigator.share({
          title: `${userInfo.nickname}さんのReol年表`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // Share failed, fall back to clipboard
      }
    } else {
      // フォールバック: クリップボードにコピー
      const shareText = await generateShareImage();
      navigator.clipboard.writeText(shareText);
      alert('年表情報をクリップボードにコピーしました！');
    }
  };

  const downloadTimeline = () => {
    const jsonData = JSON.stringify(timelineData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userInfo.nickname}_reol_timeline.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'release':
        return <FaMusic className="text-blue-500" />;
      case 'live':
        return <FaMicrophone className="text-red-500" />;
      case 'discovery':
        return <FaMapMarkerAlt className="text-green-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const getTotalStats = () => {
    let totalReleases = 0;
    let totalLives = 0;
    let totalSongs = 0;

    timeline.forEach(yearData => {
      totalReleases += yearData.releases.length;
      totalLives += yearData.lives.length;
      yearData.releases.forEach(release => {
        totalSongs += release.songs ? release.songs.length : 0;
      });
    });

    return { totalReleases, totalLives, totalSongs };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎵 {userInfo.nickname}さんのReol年表
          </h1>
          <p className="text-gray-600">
            {userInfo.startYear}年〜{new Date().getFullYear()}年 
            ({timeline.length}年間の軌跡)
          </p>
          
          <div className="flex justify-center space-x-8 mt-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.totalReleases}</div>
              <div className="text-gray-600">リリース</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.totalLives}</div>
              <div className="text-gray-600">ライブ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.totalSongs}</div>
              <div className="text-gray-600">楽曲</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={handleShare}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <FaShare />
            <span>シェア</span>
          </button>
          <button
            onClick={downloadTimeline}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <FaDownload />
            <span>ダウンロード</span>
          </button>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            編集
          </button>
          <button
            onClick={onReset}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            新規作成
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {timeline.map((yearData, index) => (
          <div key={yearData.year} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                {yearData.year}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{yearData.year}年</h2>
                <p className="text-gray-600 text-sm">
                  リリース {yearData.releases.length}件 | ライブ {yearData.lives.length}件
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* ユーザーイベント */}
              {yearData.userEvents.map((event, eventIndex) => (
                <div key={eventIndex} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="mt-1">
                    {getTimelineIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                </div>
              ))}

              {/* リリース */}
              {yearData.releases.map((release, releaseIndex) => (
                <div key={releaseIndex} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="mt-1">
                    <FaMusic className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{release.title}</h4>
                    <p className="text-gray-600 text-sm">
                      {release.format} | {release.name}
                      {release.releaseDate && ` | ${new Date(release.releaseDate).toLocaleDateString('ja-JP')}`}
                    </p>
                    {release.songs && release.songs.length > 0 && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            収録曲 ({release.songs.length}曲)
                          </summary>
                          <ul className="mt-2 space-y-1 ml-4">
                            {release.songs.map((song, songIndex) => (
                              <li key={songIndex} className="flex items-center space-x-2">
                                <span className="text-gray-600">{songIndex + 1}.</span>
                                <span>{song.songName}</span>
                                {song.musicVideoUrl && (
                                  <BiCommentDetail className="text-blue-500 text-xs" title="MV available" />
                                )}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* ライブ */}
              {yearData.lives.map((live, liveIndex) => (
                <div key={liveIndex} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="mt-1">
                    <FaMicrophone className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{live.title}</h4>
                    <p className="text-gray-600 text-sm">
                      {live.type} | {live.name}
                      {live.date && ` | ${new Date(live.date).toLocaleDateString('ja-JP')}`}
                    </p>
                    {live.items && live.items.length > 0 && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-red-600 hover:text-red-800">
                            公演情報 ({live.items.length}公演)
                          </summary>
                          <ul className="mt-2 space-y-1 ml-4">
                            {live.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <span>{item.liveItemName || item.place}</span>
                                {item.date && (
                                  <span className="text-gray-500 ml-2">
                                    ({new Date(item.date).toLocaleDateString('ja-JP')})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {yearData.releases.length === 0 && yearData.lives.length === 0 && yearData.userEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">この年は記録されているイベントがありません</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {userInfo.nickname}さんのReol歴: {timeline.length}年
        </h3>
        <p className="text-gray-600">
          {userInfo.discoverySource}でReolと出会ってから、
          {stats.totalReleases}作品・{stats.totalSongs}曲・{stats.totalLives}ライブと共に歩んできました
        </p>
        {userInfo.favoriteEra && (
          <p className="text-gray-600 mt-2">
            好きな時代: {userInfo.favoriteEra}
          </p>
        )}
        {userInfo.favoriteGenre && (
          <p className="text-gray-600">
            好きなジャンル: {userInfo.favoriteGenre}
          </p>
        )}
      </div>
    </div>
  );
};

export default TimelineResult;
