import React, { useEffect, useState } from "react";
import { Link } from "gatsby";

type SimilarLive = {
  liveUuid: string;
  liveSlug: string;
  title: string;
  date: string;
  sharedCount: number;
  score: number;
  sharedSongUuids: string[];
};

let cached: Record<string, SimilarLive[]> | null = null;
let inflight: Promise<Record<string, SimilarLive[]>> | null = null;
const fetchSimilarity = (): Promise<Record<string, SimilarLive[]>> => {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/static/data/liveSimilarity.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Record<string, SimilarLive[]>>;
    })
    .then((d) => {
      cached = d;
      inflight = null;
      return d;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
};

const RelatedLives: React.FC<{ liveUuid: string }> = ({ liveUuid }) => {
  const [items, setItems] = useState<SimilarLive[] | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchSimilarity()
      .then((m) => {
        if (cancelled) return;
        setItems(m[liveUuid] ?? []);
      })
      .catch(() => !cancelled && setItems(null));
    return () => {
      cancelled = true;
    };
  }, [liveUuid]);

  if (items === undefined) return null;
  if (!items || items.length === 0) return null;

  return (
    <div className="px-2 py-3 text-xs">
      <h5 className="font-semibold mb-2 text-gray-800 tracking-widest underline underline-offset-4 decoration-dashed decoration-1">
        セトリが似ているLIVE
      </h5>
      <ul className="space-y-1">
        {items.map((s) => (
          <li key={s.liveUuid} className="leading-snug">
            <Link
              to={`/?liveSlug=${s.liveSlug}#live-${s.liveSlug}`}
              className="underline underline-offset-2 decoration-dotted hover:opacity-80 text-gray-800"
            >
              {s.title}
            </Link>
            <span className="text-gray-500 ml-1">
              {s.date} ／ 共通 {s.sharedCount} 曲・類似度 {(s.score * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedLives;
