/**
 * セトリ表記 → songUuid のエイリアス辞書。
 *
 * 推奨運用: スプレッドシート `live_item_song.songUuid` 列に直接 UUID を書くことで
 * 表記揺れを吸収する。コード側で吸収したいときのみ、この辞書に追加する。
 */

export const SONG_ALIASES: Readonly<Record<string, string>> = {
  // 例:
  // "nil～極彩色": "0192aabb-cccc-7ddd-eeee-ffffffffffff",
};
