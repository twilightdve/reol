/**
 * アーティスト活動歴に関する定数。
 *
 * コピーで「◯年分の活動」と書くときは年数をハードコードせず、
 * ここのヘルパーを使うこと(ハードコードすると毎年腐る)。
 */

/** れをる名義でのニコニコ動画活動開始年(活動歴の起点) */
export const ACTIVITY_START_YEAR = 2012;

/** REOL(ユニット)としての活動開始年 */
export const REOL_ERA_START_YEAR = 2015;

/**
 * 活動年数。SSGビルド時に評価されるため、再ビルドのたびに自動で更新される。
 * 例: 2026年のビルドなら 14
 */
export const activityYears = (): number =>
  new Date().getFullYear() - ACTIVITY_START_YEAR;
