import React, { useEffect } from "react";
import { navigate } from "gatsby";
import SEO from "../../../components/SEO";

import { getDoc, doc } from "firebase/firestore";
import db from "../../../services/bbq2025/common";

const ResultWaitingPage = () => {
  const checkFlag = async () => {
    const docSnap = await getDoc(doc(db, "bbq2025_flags", "result"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.announce === true) {
        setTimeout(() => {
          navigate("/quiz/bbq2025/result");
        }, 1000);
      }
    }
  };
  useEffect(() => {
    checkFlag(); // 最初に一度だけ実行
  }, []);

  return (
    <div className="relative h-svh px-4 pt-2 pb-4 max-w-xl mx-auto bg-[#2F4D3A] font-tegaki text-white text-center">
      <div className="absolute top-0 bottom-0 left-0 right-0 m-auto h-24">
        <h1 className="text-2xl font-bold mb-4">回答完了！</h1>
        <p className="mb-4">
          すべての回答が完了しました
          <br />
          結果発表までお待ちください
        </p>
      </div>
    </div>
  );
};

export default ResultWaitingPage;

// 2025/5/3 開催の限定イベント用クイズ(終了済み)のため noindex
export const Head = () => (
  <>
    <SEO
      title="BBQ2025 クイズ(結果発表待ち)"
      description="2025年5月開催のファンイベント限定クイズの結果発表待ちページです(イベントは終了しました)。"
      path="/quiz/bbq2025/result-waiting/"
    />
    <meta name="robots" content="noindex" />
  </>
);
