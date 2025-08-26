import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaMusic, FaMicrophone, FaMapMarkerAlt, FaShare, FaDownload, FaHeart, FaStar, FaCamera } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import { MdPhotoLibrary } from "react-icons/md";

const EnhancedTimelineResult = ({ timelineData, onReset, onBack }) => {
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'stats', 'memories'
  const canvasRef = useRef(null);
  
  const { userInfo, timeline } = timelineData;

  // シェア用画像を生成
  const generateShareImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズを設定
    canvas.width = 800;
    canvas.height = 600;
    
    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // メインテキスト
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${userInfo.nickname}さんのReol年表`, canvas.width / 2, 80);
    
    // サブテキスト
    ctx.font = '20px "Noto Sans JP", sans-serif';
    ctx.fillText(`${userInfo.startYear}年〜${new Date().getFullYear()}年 (${timeline.length}年間)`, canvas.width / 2, 120);
    
    // 統計情報
    const stats = getTotalStats();
    ctx.font = 'bold 24px "Noto Sans JP", sans-serif';
    ctx.fillText(`🎵 ${stats.totalReleases}作品 | 🎤 ${stats.totalLives}ライブ | 🎶 ${stats.totalSongs}楽曲`, canvas.width / 2, 180);
    
    // 出会いのきっかけ
    ctx.font = '18px "Noto Sans JP", sans-serif';
    ctx.fillText(`${userInfo.discoverySource}でReolと出会い、`, canvas.width / 2, 240);
    ctx.fillText(`共に歩んできた${timeline.length}年の軌跡`, canvas.width / 2, 270);
    
    // 年表のハイライト（最初の3年分）
    let y = 320;
    const highlightYears = timeline.slice(0, 3);
    highlightYears.forEach((yearData, index) => {
      ctx.font = 'bold 16px "Noto Sans JP", sans-serif';
      ctx.fillText(`${yearData.year}年`, 150, y);
      
      ctx.font = '14px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'left';
      
      if (yearData.releases.length > 0) {
        ctx.fillText(`• ${yearData.releases[0].title}`, 200, y);
      } else if (yearData.lives.length > 0) {
        ctx.fillText(`• ${yearData.lives[0].title}`, 200, y);
      } else if (yearData.userEvents.length > 0) {
        ctx.fillText(`• ${yearData.userEvents[0].title}`, 200, y);
      }
      
      ctx.textAlign = 'center';
      y += 30;
    });
    
    // フッター
    ctx.font = '12px "Noto Sans JP", sans-serif';
    ctx.fillText('Reol年表ジェネレーター - !Legit', canvas.width / 2, canvas.height - 20);
    
    return canvas.toDataURL();
  };

  const handleShare = async () => {
    const imageDataUrl = await generateShareImage();
    setShareImageUrl(imageDataUrl);
    
    if (navigator.share) {
      try {
        // 画像をBlobに変換
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${userInfo.nickname}_reol_timeline.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `${userInfo.nickname}さんのReol年表`,
          text: `${userInfo.startYear}年からReolと歩んだ${timeline.length}年間の軌跡`,
          files: [file]
        });
      } catch (err) {
        // Share failed, fall back to download
        downloadShareImage(imageDataUrl);
      }
    } else {
      // フォールバック: 画像をダウンロード
      downloadShareImage(imageDataUrl);
    }
  };

  const downloadShareImage = (imageDataUrl) => {
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = `${userInfo.nickname}_reol_timeline.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        return <FaHeart className="text-pink-500" />;
      case 'milestone':
        return <FaStar className="text-yellow-500" />;
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

  const getFanLevel = () => {
    const years = timeline.length;
    const stats = getTotalStats();
    const totalEvents = stats.totalReleases + stats.totalLives;
    
    if (years >= 8 && totalEvents >= 50) return { level: "伝説の古参ファン", icon: "👑", color: "text-yellow-500" };
    if (years >= 5 && totalEvents >= 30) return { level: "コアファン", icon: "💎", color: "text-blue-500" };
    if (years >= 3 && totalEvents >= 15) return { level: "熱心なファン", icon: "🔥", color: "text-red-500" };
    if (years >= 1 && totalEvents >= 5) return { level: "ファン", icon: "❤️", color: "text-pink-500" };
    return { level: "新参ファン", icon: "🌱", color: "text-green-500" };
  };

  const stats = getTotalStats();
  const fanLevel = getFanLevel();

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200">
      {/* 非表示のキャンバス（シェア画像生成用） */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎵 {userInfo.nickname}さんのReol年表
          </h1>
          <p className="text-gray-600 text-lg">
            {userInfo.startYear}年〜{new Date().getFullYear()}年 
            ({timeline.length}年間の軌跡)
          </p>
          
          {/* ファンレベル表示 */}
          <div className="mt-4 inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full">
            <span className="text-lg">{fanLevel.icon}</span>
            <span className="ml-2 font-semibold">{fanLevel.level}</span>
          </div>
          
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-lg">
              <FaMusic className="text-2xl mb-2" />
              <div className="text-3xl font-bold">{stats.totalReleases}</div>
              <div className="text-sm opacity-90">リリース作品</div>
            </div>
            <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-4 rounded-lg">
              <FaMicrophone className="text-2xl mb-2" />
              <div className="text-3xl font-bold">{stats.totalLives}</div>
              <div className="text-sm opacity-90">ライブ・イベント</div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg">
              <FaHeart className="text-2xl mb-2" />
              <div className="text-3xl font-bold">{stats.totalSongs}</div>
              <div className="text-sm opacity-90">楽曲との出会い</div>
            </div>
          </div>
        </div>

        {/* ビューモード切り替え */}
        <div className="flex justify-center space-x-2 mb-6">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 年表表示
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'stats' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 統計表示
          </button>
          <button
            onClick={() => setViewMode('memories')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'memories' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💭 思い出表示
          </button>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            <FaCamera />
            <span>画像でシェア</span>
          </button>
          <button
            onClick={downloadTimeline}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            <FaDownload />
            <span>データ保存</span>
          </button>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center space-x-2"
          >
            編集する
          </button>
          <button
            onClick={onReset}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center space-x-2"
          >
            新規作成
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      {viewMode === 'timeline' && (
        <TimelineView timeline={timeline} getTimelineIcon={getTimelineIcon} />
      )}
      
      {viewMode === 'stats' && (
        <StatsView timeline={timeline} stats={stats} userInfo={userInfo} />
      )}
      
      {viewMode === 'memories' && (
        <MemoriesView timeline={timeline} userInfo={userInfo} />
      )}
    </div>
  );
};

// タイムライン表示コンポーネント
const TimelineView = ({ timeline, getTimelineIcon }) => (
  <div className="space-y-6">
    {timeline.map((yearData, index) => (
      <div key={yearData.year} className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center">
            <div className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mr-4">
              {yearData.year}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{yearData.year}年</h2>
              <p className="text-blue-100">
                リリース {yearData.releases.length}件 • ライブ {yearData.lives.length}件
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* ユーザーイベント */}
          {yearData.userEvents.map((event, eventIndex) => (
            <div key={eventIndex} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-l-4 border-pink-400">
              <div className="mt-1 text-2xl">
                {getTimelineIcon(event.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}

          {/* リリース */}
          {yearData.releases.map((release, releaseIndex) => (
            <div key={releaseIndex} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-400">
              <div className="mt-1 text-2xl">
                <FaMusic className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">{release.title}</h4>
                <p className="text-gray-600">
                  {release.format} • {release.name}
                  {release.releaseDate && ` • ${new Date(release.releaseDate).toLocaleDateString('ja-JP')}`}
                </p>
                {release.songs && release.songs.length > 0 && (
                  <div className="mt-3">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                        🎵 収録曲 ({release.songs.length}曲) を見る
                      </summary>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {release.songs.map((song, songIndex) => (
                          <div key={songIndex} className="flex items-center space-x-2 p-2 bg-white rounded border">
                            <span className="text-gray-500 font-mono text-sm min-w-[24px]">{songIndex + 1}.</span>
                            <span className="flex-1">{song.songName}</span>
                            {song.musicVideoUrl && (
                              <BiCommentDetail className="text-blue-500" title="MV available" />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ライブ */}
          {yearData.lives.map((live, liveIndex) => (
            <div key={liveIndex} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-400">
              <div className="mt-1 text-2xl">
                <FaMicrophone className="text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">{live.title}</h4>
                <p className="text-gray-600">
                  {live.type} • {live.name}
                  {live.date && ` • ${new Date(live.date).toLocaleDateString('ja-JP')}`}
                </p>
                {live.items && live.items.length > 0 && (
                  <div className="mt-3">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-red-600 hover:text-red-800 font-semibold">
                        🎤 公演情報 ({live.items.length}公演) を見る
                      </summary>
                      <div className="mt-3 space-y-2">
                        {live.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center p-2 bg-white rounded border">
                            <span>{item.liveItemName || item.place}</span>
                            {item.date && (
                              <span className="text-gray-500 text-sm">
                                {new Date(item.date).toLocaleDateString('ja-JP')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}

          {yearData.releases.length === 0 && yearData.lives.length === 0 && yearData.userEvents.length === 0 && (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              この年は記録されているイベントがありません
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// 統計表示コンポーネント
const StatsView = ({ timeline, stats, userInfo }) => {
  const yearlyStats = timeline.map(yearData => ({
    year: yearData.year,
    releases: yearData.releases.length,
    lives: yearData.lives.length,
    songs: yearData.releases.reduce((sum, release) => sum + (release.songs?.length || 0), 0)
  }));

  const peakYear = yearlyStats.reduce((peak, current) => 
    (current.releases + current.lives) > (peak.releases + peak.lives) ? current : peak
  , yearlyStats[0]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 総合統計</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>ファン歴</span>
              <span className="font-bold">{timeline.length}年</span>
            </div>
            <div className="flex justify-between">
              <span>リリース作品</span>
              <span className="font-bold text-blue-600">{stats.totalReleases}作品</span>
            </div>
            <div className="flex justify-between">
              <span>ライブ・イベント</span>
              <span className="font-bold text-red-600">{stats.totalLives}回</span>
            </div>
            <div className="flex justify-between">
              <span>楽曲との出会い</span>
              <span className="font-bold text-green-600">{stats.totalSongs}曲</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 ピーク年</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{peakYear.year}年</div>
            <p className="text-gray-600">
              リリース{peakYear.releases}作品<br/>
              ライブ{peakYear.lives}回
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💫 あなたの特徴</h3>
          <div className="space-y-2 text-sm">
            <p>出会いのきっかけ: <strong>{userInfo.discoverySource}</strong></p>
            {userInfo.favoriteEra && (
              <p>好きな時代: <strong>{userInfo.favoriteEra}</strong></p>
            )}
            {userInfo.favoriteGenre && (
              <p>好きなジャンル: <strong>{userInfo.favoriteGenre}</strong></p>
            )}
          </div>
        </div>
      </div>

      {/* 年別グラフ */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 年別アクティビティ</h3>
        <div className="space-y-3">
          {yearlyStats.map(stat => (
            <div key={stat.year} className="flex items-center space-x-4">
              <div className="w-16 text-sm font-bold">{stat.year}</div>
              <div className="flex-1 flex space-x-2">
                <div className="flex items-center space-x-1">
                  <div 
                    className="bg-blue-500 h-4 rounded"
                    style={{ width: `${(stat.releases / Math.max(...yearlyStats.map(s => s.releases))) * 100}px` }}
                  />
                  <span className="text-xs">{stat.releases}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div 
                    className="bg-red-500 h-4 rounded"
                    style={{ width: `${(stat.lives / Math.max(...yearlyStats.map(s => s.lives))) * 100}px` }}
                  />
                  <span className="text-xs">{stat.lives}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-4 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"/>
            <span>リリース</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"/>
            <span>ライブ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 思い出表示コンポーネント  
const MemoriesView = ({ timeline, userInfo }) => {
  const firstYear = timeline[0];
  const recentYear = timeline[timeline.length - 1];
  
  const milestones = [];
  timeline.forEach(yearData => {
    yearData.userEvents.forEach(event => {
      if (event.type === 'discovery' || event.type === 'milestone') {
        milestones.push({ ...event, year: yearData.year });
      }
    });
    
    yearData.releases.forEach(release => {
      if (release.title.includes('フルアルバム') || release.title.includes('1st')) {
        milestones.push({
          type: 'release',
          title: `${release.title} リリース`,
          description: `記念すべき作品との出会い`,
          year: yearData.year
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">💭 あなたのReol思い出アルバム</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-bold text-lg mb-2">🌱 はじまりの瞬間</h4>
            <p className="text-gray-700">{userInfo.startYear}年に{userInfo.discoverySource}でReolと出会い、</p>
            <p className="text-gray-700">あなたの音楽人生が変わりました。</p>
            {firstYear && firstYear.userEvents.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                「{firstYear.userEvents[0].description}」
              </p>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-bold text-lg mb-2">🎵 現在の関係</h4>
            <p className="text-gray-700">{timeline.length}年間を共に過ごし、</p>
            <p className="text-gray-700">今もReolと歩み続けています。</p>
            {userInfo.favoriteEra && (
              <p className="text-sm text-gray-600 mt-2">
                特に{userInfo.favoriteEra}がお気に入り
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 記念すべき瞬間たち</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
              <div className="text-2xl">
                {milestone.type === 'discovery' ? '💫' : 
                 milestone.type === 'milestone' ? '🌟' : '🎵'}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{milestone.year}年 - {milestone.title}</h4>
                <p className="text-gray-600 text-sm">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎭 あなたとReolの物語</h3>
        <div className="prose max-w-none text-gray-700">
          <p>
            {userInfo.startYear}年、{userInfo.discoverySource}でReolと出会ったあなた。
            それから{timeline.length}年の歳月が流れ、数多くの楽曲とライブを通じて
            深い絆を築いてきました。
          </p>
          
          <p className="mt-4">
            これまでに{timeline.reduce((sum, year) => sum + year.releases.length, 0)}作品のリリースと、
            {timeline.reduce((sum, year) => sum + year.lives.length, 0)}回のライブ・イベントを共に体験。
            時には新しい楽曲に心を奪われ、時にはライブで感動の涙を流し、
            Reolと共に歩んできた道のりは、あなたにとってかけがえのない宝物です。
          </p>

          {userInfo.favoriteGenre && (
            <p className="mt-4">
              特に{userInfo.favoriteGenre}系の楽曲がお気に入りで、
              Reolの多彩な音楽性の中でもその魅力に深く惹かれているようですね。
            </p>
          )}
          
          <p className="mt-4 font-semibold text-purple-700">
            これからもReolと共に、新たな音楽の旅を続けていきましょう！
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimelineResult;
