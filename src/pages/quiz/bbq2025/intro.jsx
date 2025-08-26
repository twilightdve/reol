import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuidv4 } from "uuid";
import { default as introImage } from "../../../images/event/20250503_BBQ/IMG_2314.webp";
import { default as stampImage } from "../../../images/event/20250503_BBQ/IMG_2328.webp";

const IntroPage = () => {
  if (typeof window === "undefined") return;
    
  const [nickname, setNickname] = useState(localStorage.getItem("bbq2025_nickname") ?? "");
  const [isRetry, setIsRetry] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedAnswers = JSON.parse(localStorage.getItem("bbq2025_answers") || "{}");
    const hasAnswers = Object.keys(savedAnswers).length > 0;
    setIsRetry(hasAnswers);
  }, []);

  const handleStart = () => {
    if (!nickname.trim()) return;
    localStorage.setItem("bbq2025_nickname", nickname);
    if (!localStorage.getItem("bbq2025_user_hash")) {
      const userHash = uuidv4();
      localStorage.setItem("bbq2025_user_hash", userHash);
    }
    navigate("/quiz/bbq2025?q=1");
  };

  return (
    <div className="flex flex-col justify-center px-4 w-svw h-svh max-w-xl mx-auto bg-[#2F4D3A] overflow-y-hidden font-tegaki text-center text-white">
      <h1 className="text-2xl font-bold mb-2 tracking-widest drop-shadow-[0_3px_6px_rgba(255,191,0,0.6)]">カルチュア・カリキュラム</h1>
      <p className="mb-4 tracking-widest">〜BBQ編〜</p>
      <div className="flex flex-row justify-around w-full h-56 mb-4">
        <div className="max-w-60 w-4/6">
          <img src={stampImage}/>
        </div>
        <div className="relative max-w-52 max-h-60 w-2/6">
          <img className="absolute bottom-0 right-0" src={introImage}/>
        </div>
      </div>
      <p className="mb-4 text-sm text-white">ニックネームを入力してクイズを開始してください</p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded w-full mb-4 text-black bg-[#F3E7D3]"
        placeholder={nickname.length > 0 ? nickname : "ニックネーム"}
      />
      <button
        onClick={handleStart}
        disabled={!nickname.trim()}
        className="bg-[#A6262E] active:bg-[#A6262E] text-white py-2 px-4 rounded disabled:bg-gray-400 disabled:text-[#F3E7D3] font-bold"
      >
        {isRetry ? "再挑戦する" : "クイズを始める"}
      </button>
    </div>
  );
};

export default IntroPage;

