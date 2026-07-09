import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { graphql } from "gatsby";
import { v4 as uuidv4 } from "uuid";
import PersonalTimelineResult from "../../components/timeline/PersonalTimelineResult";
import SEO from "../../components/SEO";

const TimelineGeneratorPage = ({ data }) => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    nickname: "",
    startYear: "",
    favoriteEra: "",
    favoriteGenre: "",
    discoverySource: "",
    favoriteAlbum: "",
    favoriteSong: "",
    liveExperience: "",
    reolPersonality: ""
  });
  const [timelineData, setTimelineData] = useState(null);

  const discographies = data.discography.discographyWithSongs;
  const liveInfos = data.live.liveInfos;

  // 全楽曲リストを抽出（重複除去、インスト版・リミックス等は除外して主要楽曲のみ）
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
            !song.songName.includes('edit') &&
            !allSongs.includes(song.songName)) {
            allSongs.push(song.songName);
          }
        });
      }
    });

    // アルファベット・あいうえお順でソート（日本語とアルファベットを適切に処理）
    return allSongs.sort((a, b) => {
      return a.localeCompare(b, 'ja', { numeric: true, sensitivity: 'base' });
    });
  };

  const songList = getAllSongs();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedData = localStorage.getItem("reol_timeline_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserInfo(parsed.userInfo || {});
      setTimelineData(parsed.timeline || null);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const generateTimeline = () => {
    const startYear = parseInt(userInfo.startYear);
    const currentYear = new Date().getFullYear();

    // 年表データを生成
    const timeline = [];

    for (let year = startYear; year <= currentYear; year++) {
      const yearData = {
        year,
        releases: discographies.filter(disc => {
          const releaseYear = disc.releaseDate ? new Date(disc.releaseDate).getFullYear() : null;
          return releaseYear === year;
        }),
        lives: liveInfos.filter(live => {
          const liveYear = live.date ? new Date(live.date).getFullYear() : null;
          return liveYear === year;
        }),
        userEvents: getUserEventsForYear(year, userInfo)
      };

      if (yearData.releases.length > 0 || yearData.lives.length > 0 || yearData.userEvents.length > 0) {
        timeline.push(yearData);
      }
    }

    const generatedData = {
      userInfo,
      timeline,
      generatedAt: new Date().toISOString()
    };

    setTimelineData(generatedData);
    localStorage.setItem("reol_timeline_data", JSON.stringify(generatedData));
    setStep(3);
  };

  const getUserEventsForYear = (year, userInfo) => {
    const events = [];

    if (year === parseInt(userInfo.startYear)) {
      let description = `${userInfo.discoverySource}でReolを知る`;
      if (userInfo.favoriteSong) {
        description += `。初めて聞いた「${userInfo.favoriteSong}」に心を奪われた`;
      }
      events.push({
        type: "discovery",
        title: `Reolとの運命的な出会い`,
        description
      });
    }

    // 2016年 - REOL結成
    if (year === 2016 && parseInt(userInfo.startYear) <= 2016) {
      events.push({
        type: "milestone",
        title: "REOL結成",
        description: "Giga・Okameとのユニット「REOL」始動。新たな音楽の幕開け"
      });
    }

    // 2017年 - REOLの終楽章
    if (year === 2017 && parseInt(userInfo.startYear) <= 2017) {
      events.push({
        type: "milestone",
        title: "REOL LAST LIVE「終楽章」",
        description: "REOLとしての活動に一区切り。ファンにとって特別な日"
      });
    }

    // 2020年 - ソロ活動再開
    if (year === 2020 && parseInt(userInfo.startYear) <= 2020) {
      events.push({
        type: "milestone",
        title: "ソロ活動再開",
        description: "「Reol」名義でのソロ活動スタート。新章の始まり"
      });
    }

    // 2021年 - 音沙汰
    if (year === 2021 && parseInt(userInfo.startYear) <= 2021) {
      events.push({
        type: "milestone",
        title: "インスタレーションコンサート「音沙汰」",
        description: "コロナ禍での新しいライブ体験。革新的な音楽表現"
      });
    }

    // 2024年 - No title
    if (year === 2024 && parseInt(userInfo.startYear) <= 2024) {
      events.push({
        type: "milestone",
        title: "Reol Oneman Live「No title」",
        description: "新たな音楽への挑戦。進化し続けるReolの象徴"
      });
    }

    // ユーザー固有の思い出を追加
    const yearsSinceStart = year - parseInt(userInfo.startYear);
    if (yearsSinceStart === 3) {
      events.push({
        type: "personal",
        title: `ファン歴3年目`,
        description: `${userInfo.discoverySource}での出会いから3年。すっかりReolの虜に`
      });
    }

    if (yearsSinceStart === 5) {
      events.push({
        type: "personal",
        title: `ファン歴5年目`,
        description: `5年間Reolと共に歩んできた。もう人生の一部`
      });
    }

    return events;
  };

  const resetTimeline = () => {
    setStep(1);
    setUserInfo({
      nickname: "",
      startYear: "",
      favoriteEra: "",
      favoriteGenre: "",
      discoverySource: "",
      favoriteAlbum: "",
      favoriteSong: "",
      liveExperience: "",
      reolPersonality: ""
    });
    setTimelineData(null);
    localStorage.removeItem("reol_timeline_data");
  };

  if (step === 3 && timelineData) {
    return (
      <PersonalTimelineResult
        timelineData={timelineData}
        discographies={discographies}
        liveInfos={liveInfos}
        onReset={resetTimeline}
        onBack={() => setStep(2)}
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="bg-bx-bg/60 border border-bx-line rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bx-yellow mb-4">
            🎵 Reol年表ジェネレーター
          </h1>
          <p className="text-bx-ink2 text-lg">
            あなたとReolとの特別な歩みを美しい年表で表現しましょう
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-bx-blue text-bx-bg' : 'border border-bx-line text-bx-ink2'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-bx-blue' : 'bg-bx-line'} rounded-full`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-bx-blue text-bx-bg' : 'border border-bx-line text-bx-ink2'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-bx-blue' : 'bg-bx-line'} rounded-full`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 3 ? 'bg-bx-blue text-bx-bg' : 'border border-bx-line text-bx-ink2'}`}>
                3
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-bx-ink2">
            <span className={step === 1 ? 'font-semibold text-bx-blue' : ''}>基本情報</span>
            <span className="mx-2">→</span>
            <span className={step === 2 ? 'font-semibold text-bx-blue' : ''}>詳細設定</span>
            <span className="mx-2">→</span>
            <span className={step === 3 ? 'font-semibold text-bx-blue' : ''}>年表完成</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">基本情報を入力してください</h2>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                ニックネーム
              </label>
              <input
                type="text"
                value={userInfo.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
                placeholder="あなたのニックネーム"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                Reolを知った年
              </label>
              <select
                value={userInfo.startYear}
                onChange={(e) => handleInputChange('startYear', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください</option>
                {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => 2012 + i).reverse().map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                どこでReolを知りましたか？
              </label>
              <select
                value={userInfo.discoverySource}
                onChange={(e) => handleInputChange('discoverySource', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください</option>
                <option value="YouTube">YouTube</option>
                <option value="ニコニコ動画">ニコニコ動画</option>
                <option value="Spotify">Spotify</option>
                <option value="Apple Music">Apple Music</option>
                <option value="Twitter（X）">Twitter（X）</option>
                <option value="TikTok">TikTok</option>
                <option value="友人・知人の紹介">友人・知人の紹介</option>
                <option value="ライブ・イベント">ライブ・イベント</option>
                <option value="ゲーム・アニメ">ゲーム・アニメ</option>
                <option value="音楽番組・TV">音楽番組・TV</option>
                <option value="ラジオ">ラジオ</option>
                <option value="CDショップ">CDショップ</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!userInfo.nickname || !userInfo.startYear || !userInfo.discoverySource}
              className="w-full bg-bx-yellow text-bx-bg py-4 px-6 rounded-lg font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity duration-300"
            >
              次のステップへ ✨
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-bx-ink">
                ✨ より詳細な年表にしませんか？
              </h2>
              <p className="text-bx-ink2">
                基本情報の入力が完了しました。次の画面で思い出深い楽曲や参戦ライブを選択して、あなただけの特別な年表を作成できます。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                好きな時代
              </label>
              <select
                value={userInfo.favoriteEra}
                onChange={(e) => handleInputChange('favoriteEra', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください（任意）</option>
                <option value="歌ってみた時代">歌ってみた時代（〜2016）</option>
                <option value="REOL時代">REOL時代（2016〜2020）</option>
                <option value="Reol時代">Reol時代（2020〜現在）</option>
                <option value="全時代">全時代好き</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                好きなアルバム・EP
              </label>
              <select
                value={userInfo.favoriteAlbum}
                onChange={(e) => handleInputChange('favoriteAlbum', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください（任意）</option>
                <option value="No title">No title</option>
                <option value="極彩色">極彩色</option>
                <option value="Σ">Σ</option>
                <option value="エンドレスEP">エンドレスEP</option>
                <option value="虚構集">虚構集</option>
                <option value="事実上">事実上</option>
                <option value="文明EP">文明EP</option>
                <option value="金字塔">金字塔</option>
                <option value="第六感">第六感</option>
                <option value="BLACK BOX">BLACK BOX</option>
                <option value="全部好き">全部好き</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                思い出深い楽曲
              </label>
              <select
                value={userInfo.favoriteSong}
                onChange={(e) => handleInputChange('favoriteSong', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください（任意）</option>
                {songList.map(song => (
                  <option key={song} value={song}>{song}</option>
                ))}
                <option value="その他">その他</option>
              </select>
              {userInfo.favoriteSong === "その他" && (
                <input
                  type="text"
                  placeholder="楽曲名を入力してください"
                  className="w-full p-3 mt-2 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
                  onChange={(e) => handleInputChange('favoriteSong', e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                ライブ・イベント参加経験
              </label>
              <select
                value={userInfo.liveExperience}
                onChange={(e) => handleInputChange('liveExperience', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください（任意）</option>
                <option value="参加経験あり">参加経験あり</option>
                <option value="参加したことがない">参加したことがない</option>
                <option value="参加したいと思っている">参加したいと思っている</option>
                <option value="遠方で参加が難しい">遠方で参加が難しい</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bx-ink2 mb-2">
                Reolの魅力はどこ？
              </label>
              <select
                value={userInfo.reolPersonality}
                onChange={(e) => handleInputChange('reolPersonality', e.target.value)}
                className="w-full p-3 bg-white/5 border border-bx-line rounded-lg text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
              >
                <option value="">選択してください（任意）</option>
                <option value="歌声の美しさ">歌声の美しさ</option>
                <option value="楽曲の独創性">楽曲の独創性</option>
                <option value="歌詞の世界観">歌詞の世界観</option>
                <option value="アーティストとしての成長">アーティストとしての成長</option>
                <option value="多様な音楽性">多様な音楽性</option>
                <option value="ライブパフォーマンス">ライブパフォーマンス</option>
                <option value="全てが魅力的">全てが魅力的</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => setStep(1)}
                className="w-full bg-white/10 border border-bx-line text-bx-ink py-4 px-6 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                ← 戻る
              </button>
              <button
                onClick={generateTimeline}
                className="w-full bg-bx-yellow text-bx-bg py-4 px-6 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity duration-300"
              >
                🎶 楽曲・ライブ選択へ進む
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Head = () => (
  <SEO
    title="Reol年表ジェネレーター(作成)"
    description="あなたとReolとの歩みを美しい年表で表現。出会いから現在まで、思い出深い瞬間を振り返り、シェアできる特別な年表を作成しましょう。"
    path="/timeline/generator/"
  />
);

export const query = graphql`
  query TimelineGeneratorPage {
    discography {
      discographyWithSongs {
        discographyUuid
        title
        releaseDate
        name
        format
        siteUrl
        songs {
          songUuid
          songName
          musicVideoUrl
          spotifyTrackId
        }
      }
    }
    live {
      liveInfos {
        liveUuid
        type
        title
        name
        date
        items {
          liveItemName
          date
          place
        }
      }
    }
  }
`;

export default TimelineGeneratorPage;
