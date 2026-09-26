import { useEffect } from "react";

/**
 * モーダル/ドロワー表示中、背景ページのスクロールを止める。
 * 呼び出し元コンポーネントがマウントされている間だけ効かせる。
 */
export const useBodyScrollLock = () => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
};
