/**
 * プロフィールカード(plan/48)のアイコン画像。サイト(サーバー)には送らず、この端末の localStorage にだけ置く
 * (2026-10-21 ユーザー「画像はサーバで保存しない」)。
 *
 * - カードの中身(QR・リンク・アカウントへの保存)には入れない。入れると QR に収まらず、サーバーにも残るため。
 *   なので画像が出るのは、作る画面・「見せる」画面・画像で保存したカードだけ。受け取った人の画面は頭文字のまま。
 * - 選んだ画像は真ん中を正方形に切り抜き、256px の JPEG に縮めて置く(数十KB)。
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const STORAGE_KEY = "reol-profile-card-icon";
const keyFor = (userId: string | null) => (userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY);
const SIZE = 256;

/** 画像ファイルを、真ん中を切り抜いた正方形の JPEG(data URL)にする */
const toSquareDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        if (!side) throw new Error("empty image");
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });

export const useCardIcon = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // 静的HTMLと最初の描画は null(読み込み後に入れる。食い違いを避ける)
  const [iconSrc, setIconSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIconSrc(window.localStorage.getItem(keyFor(userId)));
    } catch {
      setIconSrc(null);
    }
  }, [userId]);

  /** 画像を選んだ時。保存できなかった時(容量・プライベートモード)も、この画面を閉じるまでは使える */
  const setFromFile = useCallback(
    async (file: File): Promise<"saved" | "unsaved" | "error"> => {
      let src: string;
      try {
        src = await toSquareDataUrl(file);
      } catch {
        return "error";
      }
      setIconSrc(src);
      try {
        window.localStorage.setItem(keyFor(userId), src);
        return "saved";
      } catch {
        return "unsaved";
      }
    },
    [userId]
  );

  const clear = useCallback(() => {
    setIconSrc(null);
    try {
      window.localStorage.removeItem(keyFor(userId));
    } catch {
      // 消せなくても、この画面では外れている
    }
  }, [userId]);

  return { iconSrc, setFromFile, clear };
};

/** 画像で保存する時に canvas へ描くための読み込み */
export const loadIconImage = (src: string | null): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
