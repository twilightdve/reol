import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuidv4 } from "uuid";

const IntroPage = () => {
  const [nickname, setNickname] = useState("");
  const [isRetry, setIsRetry] = useState(false);

  useEffect(() => {
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
    <div className="relative w-svw h-svh bg-[#2F4D3A] overflow-y-hidden font-tegaki text-center text-white">
      <div className="absolute top-0 bottom-0 left-0 right-0 max-w-xl px-4 py-2 m-auto h-60">
        <h1 className="text-2xl font-bold mb-2 whitespace-nowrap text-shadow">カルチュア・カリキュラム</h1>
        <p className="mb-4">BBQ編</p>
        <p className="mb-4 text-sm text-white">ニックネームを入力してクイズを開始してください</p>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border p-2 rounded w-full mb-4 text-black"
          placeholder="ニックネーム"
        />
        <button
          onClick={handleStart}
          disabled={!nickname.trim()}
          className="bg-[#A6262E] active:bg-[#A6262E] text-white py-2 px-4 rounded disabled:bg-gray-400 disabled:text-[#F3E7D3] font-bold"
        >
          {isRetry ? "再挑戦する" : "クイズを始める"}
        </button>
      </div>
    </div>
  );
};

export default IntroPage;

