import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import SEO from "../../components/SEO";

import { useLocation } from "@reach/router";
import { v4 as uuidv4 } from "uuid";

import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import db, { quizData } from "../../services/bbq2025/common";

const QuizPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const qParam = parseInt(query.get("q") || "1", 10);
  const question = quizData[qParam - 1];
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const nickname = localStorage.getItem("bbq2025_nickname");
    if (!nickname) {
      navigate("/quiz/bbq2025/intro");
      return;
    }

    let userHash = localStorage.getItem("bbq2025_user_hash");
    if (!userHash) {
      userHash = uuidv4();
      localStorage.setItem("bbq2025_user_hash", userHash);
    }

    const storedAnswers = JSON.parse(localStorage.getItem("bbq2025_answers") || "{}");
    setAnswers(storedAnswers);

    const firstUnansweredIndex = quizData.findIndex(q => !storedAnswers[q.id]);
    if (firstUnansweredIndex !== -1 && qParam > firstUnansweredIndex + 1) {
      navigate(`/quiz/bbq2025?q=${firstUnansweredIndex + 1}`);
    }
  }, [qParam]);

  const handleSelect = async (option) => {
    if (selected) return;
    setSelected(option);

    const updatedAnswers = { ...answers, [question.id]: option };
    setAnswers(updatedAnswers);
    localStorage.setItem("bbq2025_answers", JSON.stringify(updatedAnswers));

    const userHash = localStorage.getItem("bbq2025_user_hash") || "";
    const nickname = localStorage.getItem("bbq2025_nickname") || "";
    const score = quizData.reduce((acc, q) => acc + (updatedAnswers[q.id] === q.answer ? 1 : 0), 0);
    
    try {
      await setDoc(doc(db, "bbq2025_answers", userHash), {
        userHash,
        nickname,
        answers: quizData.map(q => updatedAnswers[q.id] ? q.options.indexOf(updatedAnswers[q.id]) : -1),
        score,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      // エラーログは本番環境では出力しない
      alert("送信に失敗しました。通信状況をご確認ください。");
    }

    if (qParam === quizData.length) {
      navigate("/quiz/bbq2025/result-waiting");
    } else {
      setTimeout(() => {
        setSelected(null);
        navigate(`/quiz/bbq2025?q=${qParam + 1}`);
      }, 500);
    }
  };

  if (!question) return <div>問題が存在しません。</div>;

  return (
    <div className="h-svh px-4 py-2 max-w-xl mx-auto bg-[#2F4D3A] overflow-y-hidden font-tegaki">
      <h2 className="font-bold mb-4 text-white">
        <span className="text-sm">Q.{qParam}／{quizData.length}</span>
        <br />
        <p className="text-xl py-2">{question.question}</p>
      </h2>
      <div className="space-y-2 h-full">
        {question.options.map((opt, idx) => {
          const optionLabels = ["①", "②", "③", "④"];
          return (
            <button
              key={idx}
              className="w-full h-1/6 bg-[#F3E7D3] rounded border-[#E8C55D] border-2 font-bold text-2xl active:bg-[#F3E7D3] text-left px-4"
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
            >
              {optionLabels[idx]} {opt}
            </button>
          );
        })}
      </div>
      {selected && <p className="mt-4 text-green-600">選択しました：{selected}</p>}
    </div>
  );
};

export default QuizPage;

// 2025/5/3 開催の限定イベント用クイズ(終了済み)のため noindex
export const Head = () => (
  <>
    <SEO
      title="BBQ2025 クイズ"
      description="2025年5月開催のファンイベント限定クイズです(イベントは終了しました)。"
      path="/quiz/bbq2025/"
    />
    <meta name="robots" content="noindex" />
  </>
);
