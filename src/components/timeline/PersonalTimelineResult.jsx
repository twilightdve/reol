import React, { useState, useEffect, useRef } from "react";
import { FaMusic, FaMicrophone, FaPlus, FaTimes, FaCalendarAlt, FaDownload, FaShare, FaStar, FaHeart } from "react-icons/fa";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";

const PersonalTimelineResult = ({ timelineData, discographies, liveInfos, onReset, onBack }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedLives, setSelectedLives] = useState([]);
  const [viewMode, setViewMode] = useState('songs'); // 'songs' or 'lives'
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const timelineRef = useRef(null);
  const imagePreviewRef = useRef(null);
  
  const { userInfo } = timelineData;

  // 全楽曲リストを取得
  const getAllSongs = () => {
    const allSongs = [];
    discographies.forEach(disc => {
      if (disc.songs) {
        disc.songs.forEach(song => {
          if (song.songName && 
              !song.songName.includes('Instrumental') &&
              !song.songName.includes('(Anime Size)') &&
              !song.songName.includes('Remix') &&
              !song.songName.includes('-Opening-') &&
              !song.songName.includes('-Ending-') &&
              !song.songName.includes('-Interlude-') &&
              !song.songName.includes('-BWW SCREAM-') &&
              !song.songName.includes('-#000000-') &&
              !song.songName.includes('-Neo Nostalgia-') &&
              !song.songName.includes('edit')) {
            const existingSong = allSongs.find(s => s.songName === song.songName);
            if (!existingSong) {
              allSongs.push({
                songName: song.songName,
                releaseDate: disc.releaseDate,
                albumTitle: disc.title,
                discographyUuid: disc.discographyUuid,
                songUuid: song.songUuid
              });
            }
          }
        });
      }
    });
    return allSongs.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  };

  // 全ライブリストを取得
  const getAllLives = () => {
    return liveInfos.filter(live => live.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const songList = getAllSongs();
  const liveList = getAllLives();

  // 検索フィルター
  const filteredSongs = songList.filter(song => 
    song.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.albumTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLives = liveList.filter(live => 
    live.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    live.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 楽曲を選択
  const toggleSongSelection = (song) => {
    setSelectedSongs(prev => {
      const exists = prev.find(s => s.songUuid === song.songUuid);
      if (exists) {
        return prev.filter(s => s.songUuid !== song.songUuid);
      } else {
        return [...prev, { ...song, addedDate: new Date().toISOString(), comment: '' }];
      }
    });
  };

  // ライブを選択
  const toggleLiveSelection = (live) => {
    setSelectedLives(prev => {
      const exists = prev.find(l => l.liveUuid === live.liveUuid);
      if (exists) {
        return prev.filter(l => l.liveUuid !== live.liveUuid);
      } else {
        return [...prev, { ...live, addedDate: new Date().toISOString(), comment: '' }];
      }
    });
  };

  // 楽曲のコメントを更新
  const updateSongComment = (songUuid, comment) => {
    setSelectedSongs(prev => 
      prev.map(song => 
        song.songUuid === songUuid ? { ...song, comment } : song
      )
    );
  };

  // ライブのコメントを更新
  const updateLiveComment = (liveUuid, comment) => {
    setSelectedLives(prev => 
      prev.map(live => 
        live.liveUuid === liveUuid ? { ...live, comment } : live
      )
    );
  };

  // 年表を年別に整理
  const organizeTimelineByYear = () => {
    const timelineByYear = {};

    // 楽曲を年別に整理
    selectedSongs.forEach(song => {
      const year = new Date(song.releaseDate).getFullYear();
      if (!timelineByYear[year]) {
        timelineByYear[year] = { songs: [], lives: [] };
      }
      timelineByYear[year].songs.push(song);
    });

    // ライブを年別に整理
    selectedLives.forEach(live => {
      const year = new Date(live.date).getFullYear();
      if (!timelineByYear[year]) {
        timelineByYear[year] = { songs: [], lives: [] };
      }
      timelineByYear[year].lives.push(live);
    });

    return timelineByYear;
  };

  const timelineByYear = organizeTimelineByYear();
  const years = Object.keys(timelineByYear).sort((a, b) => parseInt(a) - parseInt(b));

  // 画像生成機能
  const generateTimelineImage = async () => {
    if (!timelineRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      // 紙吹雪アニメーション
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // キャンバスに描画
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 高解像度
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 800
      });

      // 画像をダウンロード
      const link = document.createElement('a');
      link.download = `${userInfo.nickname}のReol年表_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();

      // さらに紙吹雪
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }, 300);

    } catch (error) {
      console.error('画像生成でエラーが発生しました:', error);
      alert('画像の生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // SNS用のコンパクトな年表画像を生成
  const generateSNSImage = () => {
    setShowImagePreview(true);
  };

  return (
    <div className="min-h-screen px-2 py-2 max-w-6xl mx-auto bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3">
          <h1 className="text-lg font-bold mb-1">
            🎵 {userInfo.nickname}さんの思い出年表
          </h1>
          <p className="text-xs opacity-90">
            思い出深い楽曲とライブを選んで、あなただけの年表を作成
          </p>
        </div>

        <div className="p-3">
          {/* 選択モードタブ */}
          <div className="flex justify-center mb-3">
            <div className="bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('songs')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center ${
                  viewMode === 'songs' 
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white'
                }`}
              >
                <FaMusic className="mr-1" style={{fontSize: '10px'}} />
                楽曲選択
                {selectedSongs.length > 0 && (
                  <span className="ml-1 bg-white text-purple-500 rounded-full px-1 py-0.5 text-xs">
                    {selectedSongs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('lives')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center ${
                  viewMode === 'lives' 
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-white'
                }`}
              >
                <FaMicrophone className="mr-1" style={{fontSize: '10px'}} />
                ライブ選択
                {selectedLives.length > 0 && (
                  <span className="ml-1 bg-white text-blue-500 rounded-full px-1 py-0.5 text-xs">
                    {selectedLives.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* 選択エリア */}
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-bold mb-1 flex items-center">
                  {viewMode === 'songs' ? (
                    <>
                      <FaMusic className="mr-1 text-purple-500 text-xs" />
                      楽曲選択
                    </>
                  ) : (
                    <>
                      <FaMicrophone className="mr-1 text-blue-500 text-xs" />
                      ライブ選択
                    </>
                  )}
                </h2>

                {/* 検索バー */}
                <input
                  type="text"
                  placeholder={viewMode === 'songs' ? '楽曲名で検索...' : 'ライブ名で検索...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent mb-1"
                />

                {/* リスト */}
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {viewMode === 'songs' ? (
                    filteredSongs.map(song => {
                      const isSelected = selectedSongs.find(s => s.songUuid === song.songUuid);
                      return (
                        <div
                          key={song.songUuid}
                          onClick={() => toggleSongSelection(song)}
                          className={`p-0.5 rounded border cursor-pointer transition-all ${
                            isSelected 
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1">
                                <h3 className="font-medium text-gray-800 text-xs truncate leading-none">{song.songName}</h3>
                                <span className="text-xs text-gray-400 font-normal">({new Date(song.releaseDate).getFullYear()})</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate leading-none mt-0.5">{song.albumTitle}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full border flex items-center justify-center ml-1 flex-shrink-0 ${
                              isSelected 
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-0.5 h-0.5 bg-white rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    filteredLives.map(live => {
                      const isSelected = selectedLives.find(l => l.liveUuid === live.liveUuid);
                      return (
                        <div
                          key={live.liveUuid}
                          onClick={() => toggleLiveSelection(live)}
                          className={`p-0.5 rounded border cursor-pointer transition-all ${
                            isSelected 
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1">
                                <h3 className="font-medium text-gray-800 text-xs truncate leading-none">{live.title}</h3>
                                <span className="text-xs text-gray-400 font-normal">
                                  ({new Date(live.date).getFullYear()}.{new Date(live.date).getMonth() + 1})
                                </span>
                              </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full border flex items-center justify-center ml-1 flex-shrink-0 ${
                              isSelected 
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-0.5 h-0.5 bg-white rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 年表プレビューエリア */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-green-500 text-sm" />
                年表プレビュー
              </h2>

              {years.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <FaCalendarAlt className="text-lg mx-auto mb-1 opacity-50" />
                  <p className="text-xs">楽曲やライブを選択すると<br />年表がここに表示されます</p>
                </div>
              ) : (
                <div ref={timelineRef} className="relative bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
                  {/* メインタイムライン軸 - 太く目立つように */}
                  <div className="absolute left-8 top-4 bottom-4 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 rounded-full shadow-lg"></div>
                  
                  <div className="space-y-8 relative z-10">
                    {years.map((year, yearIndex) => {
                      const yearData = timelineByYear[year];
                      const totalItems = yearData.songs.length + yearData.lives.length;
                      
                      return (
                        <div key={year} className="relative">
                          {/* 年の大きな表示 - 左側に配置 */}
                          <div className="absolute left-0 top-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">{year}</span>
                            </div>
                          </div>
                          
                          {/* イベントカード - 右側に横並び */}
                          <div className="ml-20 space-y-3">
                            {/* 楽曲カード */}
                            {yearData.songs.map((song, songIndex) => (
                              <div key={song.songUuid} className="relative">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-3 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <FaMusic className="text-white text-xs" />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-gray-800 text-sm">{song.songName}</h4>
                                        <p className="text-gray-500 text-xs">
                                          {new Date(song.releaseDate).getFullYear()}年{new Date(song.releaseDate).getMonth() + 1}月
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => toggleSongSelection(song)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                      <FaTimes className="text-xs" />
                                    </button>
                                  </div>
                                  {/* コメント入力欄 */}
                                  <div className="mt-2">
                                    <textarea
                                      placeholder="この楽曲への思い入れやエピソードを書いてみましょう..."
                                      value={song.comment || ''}
                                      onChange={(e) => updateSongComment(song.songUuid, e.target.value)}
                                      className="w-full p-2 text-xs border border-purple-200 rounded bg-white/70 focus:bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none transition-all"
                                      rows="2"
                                    />
                                  </div>
                                  {song.comment && (
                                    <div className="mt-1 p-2 bg-white/80 rounded text-xs text-gray-700 italic border-l-2 border-purple-300">
                                      "{song.comment}"
                                    </div>
                                  )}
                                </div>
                                {/* 接続線 */}
                                <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-purple-400 transform -translate-x-4 -translate-y-0.5"></div>
                              </div>
                            ))}

                            {/* ライブカード */}
                            {yearData.lives.map((live, liveIndex) => (
                              <div key={live.liveUuid} className="relative">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-3 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FaMicrophone className="text-white text-xs" />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-gray-800 text-sm">{live.title}</h4>
                                        <p className="text-gray-500 text-xs">
                                          {new Date(live.date).getFullYear()}年{new Date(live.date).getMonth() + 1}月
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => toggleLiveSelection(live)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                      <FaTimes className="text-xs" />
                                    </button>
                                  </div>
                                  {/* コメント入力欄 */}
                                  <div className="mt-2">
                                    <textarea
                                      placeholder="このライブの思い出や感想を書いてみましょう..."
                                      value={live.comment || ''}
                                      onChange={(e) => updateLiveComment(live.liveUuid, e.target.value)}
                                      className="w-full p-2 text-xs border border-blue-200 rounded bg-white/70 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none transition-all"
                                      rows="2"
                                    />
                                  </div>
                                  {live.comment && (
                                    <div className="mt-1 p-2 bg-white/80 rounded text-xs text-gray-700 italic border-l-2 border-blue-300">
                                      "{live.comment}"
                                    </div>
                                  )}
                                </div>
                                {/* 接続線 */}
                                <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-blue-400 transform -translate-x-4 -translate-y-0.5"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 統計情報 */}
          {(selectedSongs.length > 0 || selectedLives.length > 0) && (
            <div className="mt-3 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded p-2 border border-purple-200">
              <h3 className="text-sm font-bold mb-2 text-center text-gray-800">
                📊 サマリー
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center bg-white rounded p-1 shadow-sm">
                  <div className="text-lg font-bold text-purple-600">{selectedSongs.length}</div>
                  <div className="text-xs text-gray-600">楽曲</div>
                </div>
                <div className="text-center bg-white rounded p-1 shadow-sm">
                  <div className="text-lg font-bold text-blue-600">{selectedLives.length}</div>
                  <div className="text-xs text-gray-600">ライブ</div>
                </div>
                <div className="text-center bg-white rounded p-1 shadow-sm">
                  <div className="text-lg font-bold text-green-600">{years.length}</div>
                  <div className="text-xs text-gray-600">年数</div>
                </div>
                <div className="text-center bg-white rounded p-1 shadow-sm">
                  <div className="text-lg font-bold text-orange-600">
                    {years.length > 0 ? Math.max(...years.map(y => parseInt(y))) - Math.min(...years.map(y => parseInt(y))) + 1 : 0}
                  </div>
                  <div className="text-xs text-gray-600">期間</div>
                </div>
              </div>
              
              {years.length > 0 && (
                <div className="mt-2 text-center">
                  <p className="text-gray-700 text-xs">
                    <span className="font-semibold text-purple-600">{Math.min(...years.map(y => parseInt(y)))}年</span>
                    から
                    <span className="font-semibold text-blue-600">{Math.max(...years.map(y => parseInt(y)))}年</span>
                    まで、Reolと共に歩んだ時間
                  </p>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-all"
            >
              ← 設定変更
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-all"
            >
              やり直し
            </button>
            {(selectedSongs.length > 0 || selectedLives.length > 0) && (
              <>
                <button
                  onClick={generateTimelineImage}
                  disabled={isGeneratingImage}
                  className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center ${
                    isGeneratingImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-1 text-xs" />
                      画像DL
                    </>
                  )}
                </button>
                <button
                  onClick={generateSNSImage}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-md text-sm font-medium hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center"
                >
                  <FaShare className="mr-1 text-xs" />
                  SNS用
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SNS用画像プレビューモーダル */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">SNS用画像プレビュー</h2>
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div ref={imagePreviewRef} className="bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-600 text-white p-8 rounded-xl">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold mb-2">🎵 {userInfo.nickname}さんの</h1>
                  <h1 className="text-3xl font-bold mb-4">Reol思い出年表</h1>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      楽曲 {selectedSongs.length}曲
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      ライブ {selectedLives.length}回
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {years.length}年間
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {years.slice(0, 4).map(year => {
                    const yearData = timelineByYear[year];
                    return (
                      <div key={year} className="bg-white bg-opacity-10 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-2">{year}年</h3>
                        {yearData.songs.slice(0, 2).map(song => (
                          <div key={song.songUuid} className="text-sm mb-2">
                            <div className="font-medium">🎵 {song.songName}</div>
                            {song.comment && (
                              <div className="text-xs mt-1 italic opacity-80">"{song.comment.slice(0, 40)}{song.comment.length > 40 ? '...' : ''}"</div>
                            )}
                          </div>
                        ))}
                        {yearData.lives.slice(0, 2).map(live => (
                          <div key={live.liveUuid} className="text-sm mb-2">
                            <div className="font-medium">🎤 {live.title}</div>
                            {live.comment && (
                              <div className="text-xs mt-1 italic opacity-80">"{live.comment.slice(0, 40)}{live.comment.length > 40 ? '...' : ''}"</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-sm opacity-80">
                  #Reol #年表ジェネレーター #思い出
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={async () => {
                    try {
                      const canvas = await html2canvas(imagePreviewRef.current, {
                        backgroundColor: null,
                        scale: 2,
                        width: 800,
                        height: 600
                      });
                      const link = document.createElement('a');
                      link.download = `${userInfo.nickname}のReol年表_SNS用.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                      setShowImagePreview(false);
                    } catch (error) {
                      console.error('SNS画像生成エラー:', error);
                    }
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center"
                >
                  <FaDownload className="mr-2" />
                  SNS用画像をダウンロード
                </button>
                <button
                  onClick={() => {
                    const text = `${userInfo.nickname}のReol思い出年表を作成しました！🎵\n楽曲${selectedSongs.length}曲、ライブ${selectedLives.length}回の思い出が詰まった${years.length}年間の軌跡です✨\n\n#Reol #年表ジェネレーター #思い出`;
                    navigator.clipboard.writeText(text);
                    alert('SNS投稿用テキストをコピーしました！');
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center"
                >
                  <FaShare className="mr-2" />
                  投稿テキストをコピー
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTimelineResult;
