/**
 * アルバム『極彩色』の公式 XFD(Reol Official、11:55)。MV の無い収録曲の記事は、表紙にこれを曲の場面から置く(2026-10-29 ユーザー)。
 * 開始位置(秒)はユーザー指定(2026-10-29)。推定しない(『虚構集』で画面から推定して10秒ずれた)。null の曲は先頭から再生する。
 * MONSTER(6:35)は reol-song-026 の中に持っている。
 */
export const GOKUSAISHIKI_XFD_ID = "AwfhX1REZ50";

const START: Record<string, number | null> = {
  生命線: 64, // 1:04
  水底游歩道: 96, // 1:36
  ハルシアン: 131, // 2:11
};

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/** 記事の表紙に置く XFD(OfficialMedia に渡す形) */
export const gokusaishikiXfd = (song: string) => {
  const start = START[song] ?? null;
  return {
    videoId: GOKUSAISHIKI_XFD_ID,
    start: start ?? undefined,
    href: `https://www.youtube.com/watch?v=${GOKUSAISHIKI_XFD_ID}${start ? `&t=${start}s` : ""}`,
    text: start ? `『極彩色』XFD の「${song}」(${mmss(start)}〜)を観る` : `『極彩色』XFD を観る`,
  };
};
