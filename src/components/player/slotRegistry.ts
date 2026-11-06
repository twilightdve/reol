/**
 * 画面に出ている動画の枠(PlayerSlot)の要素を、slotId ごとに持つ(plan/60)。
 * GlobalPlayer はここを見て、再生中の枠がこのページにあれば、その上に重なる。
 * 要素は Redux に入れられない(シリアライズできない)ので、ここに置く。
 * 枠の動画(media)と、その枠で再生を始める関数(start。計測も含む)も持つ。iPhone などで押す前にプレイヤーを
 * 用意しておく枠を GlobalPlayer がここから選び、用意したプレイヤーが押されて流れ始めたら start を呼ぶ。
 */
export type SlotMedia = { videoId?: string; list?: string; start?: number; title: string };
type Slot = { el: HTMLElement; media: SlotMedia; start: () => void };
const slots = new Map<string, Slot>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const registerSlot = (slotId: string, el: HTMLElement, media: SlotMedia, start: () => void) => {
  slots.set(slotId, { el, media, start });
  notify();
  return () => {
    if (slots.get(slotId)?.el === el) {
      slots.delete(slotId);
      notify();
    }
  };
};

export const getSlot = (slotId: string | undefined): HTMLElement | null =>
  (slotId && slots.get(slotId)?.el) || null;

export const listSlots = () => [...slots.entries()].map(([slotId, slot]) => ({ slotId, ...slot }));

export const subscribeSlots = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
