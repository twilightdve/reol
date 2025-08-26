import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaMusic, FaMicrophone, FaShare, FaDownload, FaHeart, FaStar, FaInstagram, FaTwitter } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

const InfographicTimelineResult = ({ timelineData, onReset, onBack }) => {
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic'); // 'classic', 'modern', 'vintage'
  const canvasRef = useRef(null);
  
  const { userInfo, timeline } = timelineData;

  // 統計情報を計算
  const getTotalStats = () => {
    let totalReleases = 0;
    let totalLives = 0;
    let totalSongs = 0;
    
    timeline.forEach(year => {
      totalReleases += year.releases?.length || 0;
      totalLives += year.lives?.length || 0;
      year.releases?.forEach(release => {
        totalSongs += release.songs?.length || 0;
      });
    });

    return { totalReleases, totalLives, totalSongs };
  };

  // ファンレベルを判定
  const getFanLevel = () => {
    const years = timeline.length;
    const stats = getTotalStats();
    
    if (years >= 10) return { level: "伝説のファン", icon: "👑", color: "#FFD700" };
    if (years >= 7) return { level: "古参ファン", icon: "⭐", color: "#FF6B6B" };
    if (years >= 5) return { level: "中堅ファン", icon: "🎵", color: "#4ECDC4" };
    if (years >= 3) return { level: "熱心なファン", icon: "💖", color: "#45B7D1" };
    if (years >= 1) return { level: "新参ファン", icon: "✨", color: "#96CEB4" };
    return { level: "ビギナー", icon: "🌱", color: "#FECA57" };
  };

  // メインのインフォグラフィック画像を生成
  const generateInfographic = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Instagram投稿サイズ (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;
    
    const stats = getTotalStats();
    const fanLevel = getFanLevel();
    const years = timeline.length;

    // テンプレート別の背景を描画
    if (selectedTemplate === 'classic') {
      drawClassicBackground(ctx, canvas);
    } else if (selectedTemplate === 'modern') {
      drawModernBackground(ctx, canvas);
    } else {
      drawVintageBackground(ctx, canvas);
    }

    // メインタイトル
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px "Noto Sans JP", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText(`${userInfo.nickname}さんの`, canvas.width / 2, 120);
    ctx.fillText('Reol年表', canvas.width / 2, 180);

    // ファンレベルバッジ
    ctx.shadowBlur = 0;
    drawFanLevelBadge(ctx, canvas.width / 2, 240, fanLevel);

    // 期間表示
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${userInfo.startYear}年 〜 ${new Date().getFullYear()}年`, canvas.width / 2, 320);
    ctx.font = '28px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${years}年間の軌跡`, canvas.width / 2, 360);

    // 統計情報ボックス
    drawStatsBox(ctx, 540, 420, stats);

    // 出会いのストーリー
    drawDiscoveryStory(ctx, 540, 600, userInfo);

    // 年表ハイライト
    drawTimelineHighlights(ctx, 540, 750, timeline.slice(0, 4));

    // ハッシュタグ
    ctx.fillStyle = '#E1E8ED';
    ctx.font = 'bold 24px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('#Reol年表 #ReolFan #音楽好きと繋がりたい', canvas.width / 2, 1020);

    // 画像URLを生成
    const imageUrl = canvas.toDataURL('image/png');
    setShareImageUrl(imageUrl);
  };

  // クラシックな背景
  const drawClassicBackground = (ctx, canvas) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#F093FB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 装飾的な円
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width * 0.2, canvas.height * 0.8, 100, 0, Math.PI * 2);
    ctx.fill();
  };

  // モダンな背景
  const drawModernBackground = (ctx, canvas) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.3, '#4ECDC4');
    gradient.addColorStop(0.6, '#45B7D1');
    gradient.addColorStop(1, '#96CEB4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 幾何学模様
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(
        (canvas.width / 6) * (i + 0.5),
        canvas.height * 0.15,
        30,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  // ヴィンテージな背景
  const drawVintageBackground = (ctx, canvas) => {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.7, '#654321');
    gradient.addColorStop(1, '#2F1B14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ヴィンテージ風の装飾
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.stroke();
  };

  // ファンレベルバッジを描画
  const drawFanLevelBadge = (ctx, x, y, fanLevel) => {
    // バッジの背景
    ctx.fillStyle = fanLevel.color;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();

    // アイコン
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(fanLevel.icon, x, y + 10);

    // レベル名
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(fanLevel.level, x, y + 85);
  };

  // 統計情報ボックスを描画
  const drawStatsBox = (ctx, x, y, stats) => {
    // 背景ボックス
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x - 250, y - 80, 500, 120);

    // 統計情報
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px "Noto Sans JP", Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // 3つの統計を横並び
    const statWidth = 160;
    const startX = x - 240;
    
    // リリース数
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('🎵', startX + statWidth * 0 + 80, y - 30);
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${stats.totalReleases}`, startX + statWidth * 0 + 80, y + 10);
    ctx.font = '18px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('作品', startX + statWidth * 0 + 80, y + 35);

    // ライブ数
    ctx.fillStyle = '#4ECDC4';
    ctx.font = 'bold 36px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('🎤', startX + statWidth * 1 + 80, y - 30);
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${stats.totalLives}`, startX + statWidth * 1 + 80, y + 10);
    ctx.font = '18px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('ライブ', startX + statWidth * 1 + 80, y + 35);

    // 楽曲数
    ctx.fillStyle = '#45B7D1';
    ctx.font = 'bold 36px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('🎶', startX + statWidth * 2 + 80, y - 30);
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${stats.totalSongs}`, startX + statWidth * 2 + 80, y + 10);
    ctx.font = '18px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText('楽曲', startX + statWidth * 2 + 80, y + 35);
  };

  // 出会いのストーリーを描画
  const drawDiscoveryStory = (ctx, x, y, userInfo) => {
    // 背景ボックス
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x - 250, y - 50, 500, 100);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px "Noto Sans JP", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💫 出会いのきっかけ', x, y - 15);
    
    ctx.font = '20px "Noto Sans JP", Arial, sans-serif';
    ctx.fillText(`${userInfo.discoverySource}でReolを発見`, x, y + 15);
    
    if (userInfo.favoriteSong) {
      ctx.font = '18px "Noto Sans JP", Arial, sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(`初めて聞いた「${userInfo.favoriteSong}」`, x, y + 40);
    }
  };

  // 年表ハイライトを描画
  const drawTimelineHighlights = (ctx, x, y, highlights) => {
    // 背景ボックス
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x - 250, y - 60, 500, 150);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px "Noto Sans JP", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📅 思い出のハイライト', x, y - 25);

    // 最大4年分のハイライト
    highlights.slice(0, 4).forEach((yearData, index) => {
      const itemY = y + (index * 25) + 10;
      ctx.font = '18px "Noto Sans JP", Arial, sans-serif';
      ctx.fillStyle = '#555555';
      
      if (yearData.releases.length > 0) {
        ctx.fillText(`${yearData.year}年: ${yearData.releases[0].title}`, x, itemY);
      } else if (yearData.lives.length > 0) {
        ctx.fillText(`${yearData.year}年: ${yearData.lives[0].title}`, x, itemY);
      } else if (yearData.userEvents.length > 0) {
        ctx.fillText(`${yearData.year}年: ${yearData.userEvents[0].title}`, x, itemY);
      }
    });
  };

  // 画像をダウンロード
  const downloadImage = () => {
    if (shareImageUrl) {
      const link = document.createElement('a');
      link.download = `${userInfo.nickname}_Reol年表.png`;
      link.href = shareImageUrl;
      link.click();
    }
  };

  // SNSシェア
  const shareToTwitter = () => {
    const text = `${userInfo.nickname}さんのReol年表✨\n${userInfo.startYear}年から${timeline.length}年間のReolとの軌跡 🎵\n\n#Reol年表 #ReolFan #音楽好きと繋がりたい`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    generateInfographic();
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            🎨 あなたのReol年表
          </h1>
          <p className="text-gray-600 text-lg">
            SNSでシェアしたくなるインフォグラフィック形式
          </p>
        </div>

        {/* テンプレート選択 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">🎨 デザインテンプレート</h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setSelectedTemplate('classic')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTemplate === 'classic' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              クラシック
            </button>
            <button
              onClick={() => setSelectedTemplate('modern')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTemplate === 'modern' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              モダン
            </button>
            <button
              onClick={() => setSelectedTemplate('vintage')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTemplate === 'vintage' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ヴィンテージ
            </button>
          </div>
        </div>

        {/* 生成された画像 */}
        <div className="text-center mb-8">
          <canvas
            ref={canvasRef}
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          {/* シェア・ダウンロードボタン */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadImage}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <FaDownload className="mr-2" />
              画像をダウンロード
            </button>
            
            <button
              onClick={shareToTwitter}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg"
            >
              <BsTwitterX className="mr-2" />
              Xでシェア
            </button>
            
            <button
              onClick={() => {
                if (navigator.share && shareImageUrl) {
                  navigator.share({
                    title: `${userInfo.nickname}さんのReol年表`,
                    text: `${userInfo.startYear}年から${timeline.length}年間のReolとの軌跡`,
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg"
            >
              <FaShare className="mr-2" />
              他のSNSでシェア
            </button>
          </div>

          {/* 戻る・リセットボタン */}
          <div className="flex justify-center space-x-4 pt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              ← 設定を変更
            </button>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
            >
              最初からやり直し
            </button>
          </div>
        </div>

        {/* 利用説明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 使い方ヒント</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 生成された画像は1080×1080のSNS投稿に最適なサイズです</li>
            <li>• 「画像をダウンロード」でPNG形式で保存できます</li>
            <li>• Instagram、Twitter、FacebookなどでシェアしてReolファン同士で繋がりましょう！</li>
            <li>• デザインテンプレートを変更して、お気に入りのスタイルを見つけてください</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfographicTimelineResult;
