/**
 * 画面に出ている動画の枠(PlayerSlot)の要素を、slotId ごとに持つ(plan/60)。
 * GlobalPlayer はここを見て、再生中の枠がこのページにあれば、その上に重なる。
 * 要素は Redux に入れられない(シリアライズできない)ので、ここに置く。
 */
const slots = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const registerSlot = (slotId: string, el: HTMLElement) => {
  slots.set(slotId, el);
  notify();
  return () => {
    if (slots.get(slotId) === el) {
      slots.delete(slotId);
      notify();
    }
  };
};

export const getSlot = (slotId: string | undefined): HTMLElement | null =>
  (slotId && slots.get(slotId)) || null;

export const subscribeSlots = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
