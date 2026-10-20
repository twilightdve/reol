/**
 * プロフィールカード(plan/48)のアイコン画像の切り取り範囲を決める画面(2026-10-21 ユーザー「切り取り領域を編集できるようにしたい」)。
 * 丸い枠の中に入る部分がアイコンになる。ドラッグで動かす・スライダー / ピンチ / ホイールで拡大。
 * 結果は元画像の中の正方形(px)で返す。
 */
import React, { useCallback, useEffect, useRef, useState } from "react";

export type IconCrop = { x: number; y: number; size: number };

const STAGE = 280;
const MAX_ZOOM = 4;

type View = { z: number; x: number; y: number };

export const IconCropper: React.FC<{
  src: string;
  /** 前に決めた範囲(位置を調整し直す時) */
  initial?: IconCrop | null;
  onCancel: () => void;
  onConfirm: (crop: IconCrop) => void;
}> = ({ src, initial, onCancel, onConfirm }) => {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<View>({ z: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; z: number } | null>(null);

  // 拡大1倍で、短い辺が枠いっぱい
  const base = natural ? STAGE / Math.min(natural.w, natural.h) : 1;

  /** 枠の外に余白が出ないように位置を収める */
  const clamp = useCallback(
    (v: View): View => {
      if (!natural) return v;
      const z = Math.min(MAX_ZOOM, Math.max(1, v.z));
      const w = natural.w * base * z;
      const h = natural.h * base * z;
      return { z, x: Math.min(0, Math.max(STAGE - w, v.x)), y: Math.min(0, Math.max(STAGE - h, v.y)) };
    },
    [natural, base]
  );

  /** 枠の真ん中を動かさずに拡大率を変える */
  const zoomTo = useCallback(
    (z: number) =>
      setView((v) => {
        const cx = (STAGE / 2 - v.x) / (base * v.z);
        const cy = (STAGE / 2 - v.y) / (base * v.z);
        const nz = Math.min(MAX_ZOOM, Math.max(1, z));
        return clamp({ z: nz, x: STAGE / 2 - cx * base * nz, y: STAGE / 2 - cy * base * nz });
      }),
    [base, clamp]
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const n = { w: img.naturalWidth, h: img.naturalHeight };
      setNatural(n);
      const b = STAGE / Math.min(n.w, n.h);
      if (initial && initial.size > 0) {
        const z = Math.min(MAX_ZOOM, Math.max(1, Math.min(n.w, n.h) / initial.size));
        setView({ z, x: -initial.x * b * z, y: -initial.y * b * z });
      } else {
        // 最初は真ん中
        setView({ z: 1, x: (STAGE - n.w * b) / 2, y: (STAGE - n.h * b) / 2 });
      }
    };
    img.src = src;
  }, [src, initial]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: view.z };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart.current.dist > 0) zoomTo((pinchStart.current.z * dist) / pinchStart.current.dist);
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  // ホイールでの拡大(ページがスクロールしないよう passive でない登録)
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const nz = Math.min(MAX_ZOOM, Math.max(1, v.z * Math.exp(-e.deltaY * 0.002)));
        const cx = (STAGE / 2 - v.x) / (base * v.z);
        const cy = (STAGE / 2 - v.y) / (base * v.z);
        return clamp({ z: nz, x: STAGE / 2 - cx * base * nz, y: STAGE / 2 - cy * base * nz });
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [base, clamp]);

  // Esc で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const confirm = () => {
    if (!natural) return;
    const scale = base * view.z;
    onConfirm({ x: -view.x / scale, y: -view.y / scale, size: STAGE / scale });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="アイコンの範囲を決める" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-bx-line bg-bx-bg p-5 text-bx-ink">
        <p className="text-[15px] font-bold">アイコンの範囲</p>
        <p className="mt-1 text-[12px] text-bx-ink3">丸の中がアイコンになります。ドラッグで動かし、スライダー(スマホは2本指)で拡大できます。</p>
        <div
          ref={stageRef}
          className="relative mx-auto mt-4 cursor-grab touch-none select-none overflow-hidden rounded-lg bg-black active:cursor-grabbing"
          style={{ width: STAGE, height: STAGE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {natural && (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ left: view.x, top: view.y, width: natural.w * base * view.z, height: natural.h * base * view.z }}
            />
          )}
          {/* 丸の外を暗くする */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,.55)]" />
        </div>
        <label className="mt-4 flex items-center gap-3 text-[12px] text-bx-ink3">
          拡大
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={view.z}
            onChange={(e) => zoomTo(Number(e.target.value))}
            className="flex-1 accent-[#5b8def]"
            aria-label="拡大"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-full border border-bx-line px-5 py-2 text-[13px] font-bold">
            やめる
          </button>
          <button type="button" onClick={confirm} disabled={!natural} className="rounded-full bg-bx-blue px-5 py-2 text-[13px] font-extrabold text-bx-bg disabled:opacity-40">
            決める
          </button>
        </div>
      </div>
    </div>
  );
};
