import { OWNER_USER_ID } from "./owner";

/**
 * プロフィールカード(plan/48)を試験中は運営だけが作れるようにする切り替え(2026-10-18 ユーザー「一旦自分だけが見れる機能にして」)。
 * false にすると元に戻る(誰でも作れる・メニューに出る・検索とサイトマップに載る)。
 * 2026-10-21 ユーザー「全体公開して」で false にした(true でまた運営だけに戻る)。
 * 表示の切り替えで、閲覧の制限ではない。受け取る画面(/card/view/)はどちらでも誰でも見られる。
 */
export const PROFILE_CARD_OWNER_ONLY = false;

/** このユーザーがカードを作れるか(ログインしていない時は userId なし) */
export const canCreateProfileCard = (userId?: string | null): boolean => !PROFILE_CARD_OWNER_ONLY || userId === OWNER_USER_ID;
