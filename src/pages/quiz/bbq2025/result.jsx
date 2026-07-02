import React, { useEffect, useState } from "react";
import { quizData } from "../../../services/bbq2025/common";
import SEO from "../../../components/SEO";
import { FaCheck } from "react-icons/fa";
import { navigate } from "gatsby";
import { default as resultImage } from "../../../images/event/20250503_BBQ/IMG_2316.webp";

const ResultPage = () => {
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const storedNickname = localStorage.getItem("bbq2025_nickname") || "";
    const storedAnswers = JSON.parse(localStorage.getItem("bbq2025_answers") || "{}");
    setNickname(storedNickname);
    setAnswers(storedAnswers);
  }, []);

  const correctCount = quizData.reduce((acc, q) => {
    return acc + (answers[q.id] === q.answer ? 1 : 0);
  }, 0);
  const accuracy = ((correctCount / quizData.length) * 100).toFixed(1); // 小数点1桁

  const handleStart = () => navigate("/quiz/bbq2025?q=1");

  return (
    <div className="px-4 pt-2 pb-4 max-w-xl mx-auto bg-[#2F4D3A] font-tegaki">
      <h1 className="text-2xl font-bold mb-4 text-white whitespace-nowrap">{nickname}さんの回答結果</h1>
      <ul className="space-y-4">
        <div className="flex justify-between items-center w-full">
          <div className="text-xl text-[#E8C55D] text-center w-[calc(100%-128px)]">
            正答率: <span className="font-bold">{accuracy}%</span><br/>
            （{correctCount} / {quizData.length}問）
          </div>
          <div className="w-32 h-32">
            <img className="" src={resultImage} />
          </div>
        </div>
        {quizData.map((q, idx) => (
          <li key={q.id} className="relative p-2 bg-[#F3E7D3] rounded border-[#E8C55D] border-2 text-base">
            <div className="w-80 px-1">
              <p className="text-sm font-semibold pb-1"><span className="text-xs">Q{idx + 1}.</span>&nbsp;{q.question}</p>
              <div className="ml-2 text-sm">
                <p className="">あなたの回答: {answers[q.id] || "未回答"}</p>
                <p className="">正解: <span className="text-[#A6262E]">{q.answer}</span></p>
              </div>
            </div>
            {answers[q.id] === q.answer && <span className="absolute right-2 bottom-2"><FaCheck className="m-auto text-3xl text-[#6E1D25]" /></span>}
          </li>
        ))}
      </ul>
      <div className="mt-8 mb-4 text-center">
        <button
            onClick={handleStart}
            className="bg-[#A6262E] active:bg-[#A6262E] text-white py-2 px-4 rounded disabled:bg-gray-400 font-bold w-44"
          >
            再挑戦する
        </button>        
      </div>
    </div>
  );
};

export default ResultPage;

// 2025/5/3 開催の限定イベント用クイズ(終了済み)のため noindex
export const Head = () => (
  <>
    <SEO
      title="BBQ2025 クイズ(結果)"
      description="2025年5月開催のファンイベント限定クイズの結果ページです(イベントは終了しました)。"
      path="/quiz/bbq2025/result/"
    />
    <meta name="robots" content="noindex" />
  </>
);


