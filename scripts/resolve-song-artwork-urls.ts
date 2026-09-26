// 楽曲ソーターのブラケット共有カード用に、曲のジャケット画像(Spotifyのトラックアートワーク)の
// URLをビルド時に解決するスクリプト。
//
// - 認証不要の Spotify oEmbed API (https://open.spotify.com/oembed) から thumbnail_url を取得するだけで、
//   画像そのものはダウンロード・自サイトに保存しない(公式画像を複製配信しない方針)。
//   ブラウザは Spotify の画像CDNから直接読み込む(CDNは Access-Control-Allow-Origin: * を返すため、
//   crossOrigin="anonymous" で読み込めば Canvas に描いても toBlob できる)。
// - spotifyTrackId が無い曲、oEmbed取得に失敗した曲は null とし、ビルド全体は止めない
//   (フロント側は画像が無い前提でプレースホルダー描画にフォールバックする)。

export interface SongArtworkInput {
  slug: string;
  spotifyTrackId: string | null;
}

export interface ResolveSongArtworkResult {
  urlBySlug: Map<string, string>;
  resolved: number;
  failed: number;
}

const CONCURRENCY = 5;

const resolveOne = async (spotifyTrackId: string): Promise<string | null> => {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(
      `https://open.spotify.com/track/${spotifyTrackId}`
    )}`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const oembed = (await res.json()) as { thumbnail_url?: string };
    return oembed.thumbnail_url ?? null;
  } catch {
    return null;
  }
};

// 曲ごとのジャケット画像URLを解決する
export const resolveSongArtworkUrls = async (
  songs: SongArtworkInput[]
): Promise<ResolveSongArtworkResult> => {
  const result: ResolveSongArtworkResult = { urlBySlug: new Map(), resolved: 0, failed: 0 };
  const queue = songs.filter(
    (s): s is SongArtworkInput & { spotifyTrackId: string } => !!s.slug && !!s.spotifyTrackId
  );

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const chunk = queue.slice(i, i + CONCURRENCY);
    const urls = await Promise.all(chunk.map((s) => resolveOne(s.spotifyTrackId)));
    chunk.forEach((s, j) => {
      const url = urls[j];
      if (url) {
        result.urlBySlug.set(s.slug, url);
        result.resolved++;
      } else {
        result.failed++;
      }
    });
  }

  return result;
};
