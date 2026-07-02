import React from "react";
import { FaExclamation } from "react-icons/fa";
import RecommendList from "../recommend-list";
import { Recommend } from "../../../types/recommend";

interface HomeSectionProps {
  recommend: Recommend[];
}

const HomeSection: React.FC<HomeSectionProps> = ({ recommend }) => {
  return (
    <section id="HOME" style={{ contentVisibility: "auto" }} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
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
