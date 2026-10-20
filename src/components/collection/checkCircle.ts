/**
 * DISCOGRAPHY の所有・LIVE の参戦・PLACE の訪問の丸いチェック(コレクション台帳)の見た目。
 * 押していない時も ✓ を薄く出して、押せば付くと分かるようにする(2026-10-21 ユーザー「ただの◯でチェックできるアフォーダンスがない」)。
 */
export const checkCircleClass = (checked: boolean): string =>
  checked
    ? "border-bx-blue bg-bx-blue text-bx-bg"
    : "border-bx-ink3/70 text-bx-ink3/70 hover:border-bx-blue hover:text-bx-blue";
