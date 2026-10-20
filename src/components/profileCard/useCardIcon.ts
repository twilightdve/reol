/**
 * プロフィールカード(plan/48)のアイコン画像。サイト(サーバー)には送らず、この端末の localStorage にだけ置く
 * (2026-10-21 ユーザー「画像はサーバで保存しない」)。
 *
 * - カードの中身(QR・リンク・アカウントへの保存)には入れない。入れると QR に収まらず、サーバーにも残るため。
 *   なので画像が出るのは、作る画面・「見せる」画面・画像で保存したカードだけ。受け取った人の画面は頭文字のまま。
 * - 選んだ画像は長い辺 1280px までに縮めて「元の画像」として置き、切り取り範囲(IconCropper)も一緒に置く
 *   (あとで「位置を調整」できるように)。アイコンそのものは、その範囲を 256px の JPEG にしたもの(数十KB)。
 * - 元の画像が容量で置けない時は、アイコンだけ置く(位置の調整はできなくなる)。
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { IconCrop } from "./IconCropper";

const ICON_KEY = "reol-profile-card-icon";
const SOURCE_KEY = "reol-profile-card-icon-source";
const keyFor = (base: string, userId: string | null) => (userId ? `${base}:${userId}` : base);
const SIZE = 256;
const SOURCE_MAX = 1280;

export type IconSource = { src: string; crop: IconCrop | null };

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });

/** 選んだファイルを、長い辺 SOURCE_MAX までの JPEG(data URL)にする */
export const fileToSource = async (file: File): Promise<string> => {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, SOURCE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    if (!w || !h) throw new Error("empty image");
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
};

/** 元の画像の範囲を、正方形のアイコン(JPEG の data URL)にする */
const cropToIcon = async (src: string, crop: IconCrop): Promise<string> => {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, SIZE, SIZE);
  return canvas.toDataURL("image/jpeg", 0.85);
};

const write = (key: string, value: string): boolean => {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const useCardIcon = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // 静的HTMLと最初の描画は null(読み込み後に入れる。食い違いを避ける)
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [source, setSource] = useState<IconSource | null>(null);

  useEffect(() => {
    try {
      setIconSrc(window.localStorage.getItem(keyFor(ICON_KEY, userId)));
      const raw = window.localStorage.getItem(keyFor(SOURCE_KEY, userId));
      const parsed = raw ? (JSON.parse(raw) as IconSource) : null;
      setSource(parsed && typeof parsed.src === "string" ? parsed : null);
    } catch {
      setIconSrc(null);
      setSource(null);
    }
  }, [userId]);

  /**
   * 範囲を決めた時。アイコンを作って置く。
   * 置けなかった時(容量・プライベートモード)も、この画面を閉じるまでは使える
   */
  const applyCrop = useCallback(
    async (src: string, crop: IconCrop): Promise<"saved" | "unsaved" | "error"> => {
      let icon: string;
      try {
        icon = await cropToIcon(src, crop);
      } catch {
        return "error";
      }
      setIconSrc(icon);
      setSource({ src, crop });
      const iconSaved = write(keyFor(ICON_KEY, userId), icon);
      if (!write(keyFor(SOURCE_KEY, userId), JSON.stringify({ src, crop }))) {
        // 元の画像が置けない時は、古い元の画像を残さない(アイコンと食い違うため)
        try {
          window.localStorage.removeItem(keyFor(SOURCE_KEY, userId));
        } catch {
          // 何もしない
        }
      }
      return iconSaved ? "saved" : "unsaved";
    },
    [userId]
  );

  const clear = useCallback(() => {
    setIconSrc(null);
    setSource(null);
    try {
      window.localStorage.removeItem(keyFor(ICON_KEY, userId));
      window.localStorage.removeItem(keyFor(SOURCE_KEY, userId));
    } catch {
      // 消せなくても、この画面では外れている
    }
  }, [userId]);

  return { iconSrc, source, applyCrop, clear };
};

/** 画像で保存する時に canvas へ描くための読み込み */
export const loadIconImage = (src: string | null): Promise<HTMLImageElement | null> =>
  src ? loadImage(src).catch(() => null) : Promise.resolve(null);
