import React from "react";
import { Link } from "gatsby";
import { FaExclamation } from "react-icons/fa";
import RecommendList from "../recommend-list";
import { Recommend } from "../../../types/recommend";
import { trackEvent } from "../../../utils/analytics";
import { activityYears } from "../../../constants/artist";

interface HomeSectionProps {
  recommend: Recommend[];
}

const HomeSection: React.FC<HomeSectionProps> = ({ recommend }) => {
  return (
    <section id="HOME" style={{ contentVisibility: "auto" }} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      {/* タグライン：初見の人にサイトの価値をひと言で伝える */}
      <div className="pt-4 px-2 text-center">
        <p className="text-lg sm:text-xl font-bold tracking-wide text-shadow">
          Reolの{activityYears()}年を、ぜんぶ遡れる。
        </p>
        <p className="mt-1 text-[11px] sm:text-sm text-gray-500 tracking-wide">
          楽曲・ライブ・セトリ・ロケ地まで。非公式ファンサイト !Legit
        </p>
      </div>

      {/* 入口3カード：初見の人が最初に触れる導線。sm以上で横3列、モバイルは縦積み */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 px-2">
        {/* はじめてのReol */}
        <Link
          to="/welcome/"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "はじめてのReol",
              card_type: "welcome",
            })
          }
          className="block h-full group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative h-full flex flex-col justify-between bg-gradient-to-br from-[#7b2ff7] via-[#5b1fc7] to-[#3a1080] p-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl">🔰</span>
                <span className="text-sm font-bold text-white">
                  はじめてのReol
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                代表曲と年代別ガイドで、ここから沼へ
              </p>
            </div>
            <div className="flex justify-end mt-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* ライブに行く（カード内に初参加ガイドへのサブリンクを併設） */}
        <div className="h-full flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <Link
            to="/live/"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "ライブに行く",
                card_type: "live",
              })
            }
            className="block flex-1 group"
          >
            <div className="relative h-full flex flex-col justify-between bg-gradient-to-br from-[#27489b] via-[#1a3a7a] to-[#102455] p-4">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl">🎤</span>
                  <span className="text-sm font-bold text-white">
                    ライブに行く
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  公演情報とセトリ
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
          <Link
            to="/bijigaku-navi/articles/live-tips-first-timer/"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "初参加ガイドを読む",
                card_type: "live_guide",
              })
            }
            className="block text-center text-[10px] sm:text-xs text-white/80 bg-[#102455] hover:bg-[#0b1a3f] py-1.5 transition-colors"
          >
            初参加ガイドを読む →
          </Link>
        </div>

        {/* データを掘る */}
        <Link
          to="/songs/stats/"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "データを掘る",
              card_type: "stats",
            })
          }
          className="block h-full group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative h-full flex flex-col justify-between bg-gradient-to-br from-[#0f766e] via-[#0c5f58] to-[#083c38] p-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl">📊</span>
                <span className="text-sm font-bold text-white">
                  データを掘る
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                全楽曲の演奏回数・初披露日を一覧
              </p>
            </div>
            <div className="flex justify-end mt-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Reolファンタイプ診断バナー */}
      <div className="my-4 px-2">
        <a
          href="/quiz/reol-type/"
          className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative bg-gradient-to-r from-[#1a1040] via-[#2d1b69] to-[#1a1040] p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl">🎵</span>
                  <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                    Reolファンタイプ診断
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  全20問の質問であなたのファンタイプを診断！
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* 美辞学ナビバナー */}
      <div className="my-4 px-2">
        <a
          href="/bijigaku-navi/"
          className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative bg-gradient-to-r from-[#27489b] via-[#1a3a7a] to-[#27489b] p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-icon text-xl text-[#D2AF57] tracking-wide drop-shadow-md">
                    美辞学ナビ
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  会場情報・アクセス・参加者情報をチェック
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 w-9 h-9 rounded-full bg-[#D2AF57]/20 flex items-center justify-center group-hover:bg-[#D2AF57]/30 transition-colors">
                <svg className="w-4 h-4 text-[#D2AF57] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>

      <h2
        id="RECOMMEND"
        className="font-bold text-lg pt-4 px-2 text-shadow tracking-wider"
      >
        <FaExclamation className="inline text-sm mb-1" />
        <span>Pick Up Post</span>
      </h2>
      <RecommendList data={recommend} />
    </section>
  );
};

export default HomeSection;
