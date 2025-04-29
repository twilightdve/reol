import React, { useEffect } from "react";
import { navigate } from "gatsby";

import { getDoc, doc } from "firebase/firestore";
import db from "../common";

const ResultWaitingPage = () => {
  const checkFlag = async () => {
    const docSnap = await getDoc(doc(db, "bbq2025_flags", "result"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(data)
      if (data.announce === true) {
        navigate("/quiz/bbq2025/result");
      }
    }
  };
  useEffect(() => {
    checkFlag(); // 最初に一度だけ実行
  }, []);

  return (
    <div className="relative h-svh px-4 pt-2 pb-4 max-w-xl m-auto bg-[#2F4D3A] font-tegaki text-white text-center">
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
