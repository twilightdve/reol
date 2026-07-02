import React from "react";
import { navigate } from "gatsby";
import { FaCalendarAlt, FaMusic, FaMicrophone, FaHeart, FaArrowRight } from "react-icons/fa";
import { HeadFC } from "gatsby";
import SEO from "../../components/SEO";

const TimelineIntroPage = () => {
  const handleStart = () => {
    navigate("/timeline/generator");
  };

  const features = [
    {
      icon: <FaCalendarAlt className="text-blue-500 text-3xl" />,
      title: "個人年表作成",
      description: "あなたがReolを知った年から現在までの軌跡を自動生成"
    },
    {
      icon: <FaMusic className="text-green-500 text-3xl" />,
      title: "作品履歴",
      description: "リリースされた全作品と楽曲を時系列で表示"
    },
    {
      icon: <FaMicrophone className="text-red-500 text-3xl" />,
      title: "ライブ履歴",
      description: "参加可能だったライブやツアー情報を網羅"
    },
    {
      icon: <FaHeart className="text-pink-500 text-3xl" />,
      title: "思い出振り返り",
      description: "Reolとの出会いから現在までの思い出を可視化"
    }
  ];

  const sampleTimeline = [
    { year: "2016", event: "「LUVORATORRRRRY!」でReolと出会う", type: "discovery" },
    { year: "2017", event: "1stアルバム「Σ」リリース", type: "release" },
    { year: "2018", event: "初ワンマンライブ「刮目相待」", type: "live" },
    { year: "2024", event: "横浜アリーナ公演「No title」", type: "live" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヒーローセクション */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎵 Reol年表ジェネレーター
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            あなたがReolと歩んできた軌跡を美しい年表として可視化。
            <br />
            出会いから現在まで、すべての瞬間を振り返ろう。
          </p>
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
          >
            <span>年表を作成する</span>
            <FaArrowRight />
          </button>
        </div>

        {/* 特徴セクション */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* サンプル年表 */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            サンプル年表
          </h2>
          <div className="space-y-6">
            {sampleTimeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold">
                  {item.year}
                </div>
                <div className="flex-1">
                  <div className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'discovery' ? 'bg-green-50 border-green-500' :
                    item.type === 'release' ? 'bg-blue-50 border-blue-500' :
                    'bg-red-50 border-red-500'
                  }`}>
                    <p className="text-gray-800 font-medium">{item.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              ※実際の年表にはより詳細な情報が含まれます
            </p>
          </div>
        </div>

        {/* 使い方 */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            使い方
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">基本情報入力</h3>
              <p className="text-gray-600 text-sm">
                ニックネームとReolを知った年を入力
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">詳細設定</h3>
              <p className="text-gray-600 text-sm">
                好きな時代やジャンルなどを選択（任意）
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">年表生成</h3>
              <p className="text-gray-600 text-sm">
                美しい年表が自動生成され、シェア可能
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            あなただけのReol年表を作成しよう
          </h2>
          <p className="text-gray-600 mb-8">
            数分で完成、いつでも見返せる思い出の年表
          </p>
          <button
            onClick={handleStart}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            今すぐ作成する
          </button>
        </div>
      </div>
    </div>
  );
};

export const Head = () => (
  <SEO
    title="Reol年表ジェネレーター"
    description="あなたがReolと歩んできた軌跡を美しい年表として可視化。出会いから現在まで、すべての瞬間を振り返ろう。"
    path="/timeline/"
  />
);

export default TimelineIntroPage;
