import React, { useEffect, useState } from "react";
import { quizData } from "../common";
import { FaCheck } from "react-icons/fa";

const ResultPage = () => {
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const storedNickname = localStorage.getItem("bbq2025_nickname") || "";
    const storedAnswers = JSON.parse(localStorage.getItem("bbq2025_answers") || "{}");
    setNickname(storedNickname);
    setAnswers(storedAnswers);
  }, []);

  const correctCount = quizData.reduce((acc, q) => {
    return acc + (answers[q.id] === q.answer ? 1 : 0);
  }, 0);
  const accuracy = ((correctCount / quizData.length) * 100).toFixed(1); // 小数点1桁


  return (
    <div className="px-4 pt-2 pb-4 max-w-xl mx-auto bg-[#2F4D3A] font-tegaki">
      <h1 className="text-2xl font-bold mb-4 text-white whitespace-nowrap">{nickname}さんの回答結果</h1>
      <ul className="space-y-4">
        <div className="text-lg mb-6 text-[#E8C55D]">
          正答率: <span className="font-bold">{accuracy}%</span>（{correctCount} / {quizData.length}問）
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
    </div>
  );
};

export default ResultPage;


