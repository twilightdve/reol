import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { X } from "lucide-react";
import { useCollectionOwned } from "../../hooks/useCollectionOwned";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

interface CollectionDialogProps {
  onClose: () => void;
}

interface DiscographyEntry {
  discographyUuid: string;
  releaseDate: string | null;
}

interface LiveItemEntry {
  liveItemUuid: string;
  date: string | null;
}

interface QueryData {
  siteStats: { siteStats: { songCount: number; liveItemCount: number } };
  place: { places: Array<{ placeUuid: string }> };
  discography: { discographyWithSongs: DiscographyEntry[] };
  live: { liveInfos: Array<{ items: LiveItemEntry[] }> };
}

const BADGE_THRESHOLDS = [25, 50, 75, 100];

/**
 * コレクション台帳(所有/視聴済み・参戦済み・巡礼済み)の個人向けサマリー。
 * plan/25の方針(2026-07-30): 他者との比較や未所有を煽る表現は一切入れず、
 * 「持っている分だけ自己満足で誇れる」表示に限定する。未達成バッジは出さない。
 */
export const CollectionDialog: React.FC<CollectionDialogProps> = ({ onClose }) => {
  useBodyScrollLock();
  const data = useStaticQuery<QueryData>(graphql`
    query CollectionDialogQuery {
      siteStats {
        siteStats {
          songCount
          liveItemCount
        }
      }
      place {
        places {
          placeUuid
        }
      }
      discography {
        discographyWithSongs {
          discographyUuid
          releaseDate
        }
      }
      live {
        liveInfos {
          items {
            liveItemUuid
            date
          }
        }
      }
    }
  `);

  const { owned, mounted: ownedMounted } = useCollectionOwned("owned");
  const { owned: attended, mounted: attendedMounted } = useCollectionOwned("attended");
  const { owned: visited, mounted: visitedMounted } = useCollectionOwned("visited");

  const songCount = data.siteStats.siteStats.songCount;
  const liveItemCount = data.siteStats.siteStats.liveItemCount;
  const placeCount = data.place.places.length;

  const ownedCount = ownedMounted ? owned.size : 0;
  const attendedCount = attendedMounted ? attended.size : 0;
  const visitedCount = visitedMounted ? visited.size : 0;

  const liveItemList = data.live.liveInfos.flatMap((li) => li.items);

  const yearStats = (() => {
    const yearMap: Record<
      string,
      { ownedTotal: number; ownedHave: number; attendedTotal: number; attendedHave: number }
    > = {};

    data.discography.discographyWithSongs.forEach((d) => {
      const year = d.releaseDate?.slice(0, 4);
      if (!year) return;
      if (!yearMap[year]) {
        yearMap[year] = { ownedTotal: 0, ownedHave: 0, attendedTotal: 0, attendedHave: 0 };
      }
      yearMap[year].ownedTotal += 1;
      if (ownedMounted && owned.has(d.discographyUuid)) yearMap[year].ownedHave += 1;
    });

    liveItemList.forEach((it) => {
      const year = it.date?.slice(0, 4);
      if (!year) return;
      if (!yearMap[year]) {
        yearMap[year] = { ownedTotal: 0, ownedHave: 0, attendedTotal: 0, attendedHave: 0 };
      }
      yearMap[year].attendedTotal += 1;
      if (attendedMounted && attended.has(it.liveItemUuid)) yearMap[year].attendedHave += 1;
    });

    return Object.entries(yearMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, v]) => ({ year, ...v }));
  })();

  const achievedBadges = (label: string, count: number, total: number): string[] => {
    if (total === 0) return [];
    const rate = (count / total) * 100;
    return BADGE_THRESHOLDS.filter((t) => rate >= t).map((t) => `${label} ${t}%達成`);
  };

  const badges = [
    ...achievedBadges("DISCOGRAPHY", ownedCount, songCount),
    ...achievedBadges("LIVE参戦", attendedCount, liveItemCount),
    ...achievedBadges("PLACE巡礼", visitedCount, placeCount),
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bx-bg border border-bx-line rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-bx-ink">コレクション</h3>
          <button onClick={onClose} className="text-bx-ink2 hover:text-bx-ink" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <SummaryRow label="DISCOGRAPHY 所有/視聴済み" count={ownedCount} total={songCount} />
          <SummaryRow label="LIVE 参戦済み" count={attendedCount} total={liveItemCount} />
          <SummaryRow label="PLACE 巡礼済み" count={visitedCount} total={placeCount} />
        </div>

        {badges.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-bx-ink3 mb-2">達成バッジ</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-bx-yellow/15 text-bx-yellow border border-bx-yellow/30"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {yearStats.length > 0 && (
          <div>
            <p className="text-xs text-bx-ink3 mb-2">年代別カバー状況</p>
            <div className="space-y-2">
              {yearStats.map(({ year, ownedTotal, ownedHave, attendedTotal, attendedHave }) => {
                const total = ownedTotal + attendedTotal;
                const have = ownedHave + attendedHave;
                if (total === 0) return null;
                const pct = Math.round((have / total) * 100);
                return (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-xs text-bx-ink2 w-12 flex-shrink-0">{year}</span>
                    <div className="flex-1 h-2 rounded-full bg-bx-surface/10 overflow-hidden">
                      <div className="h-full bg-bx-blue rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-bx-ink3 w-10 text-right flex-shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; count: number; total: number }> = ({
  label,
  count,
  total,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-bx-ink2">{label}</span>
        <span className="text-sm font-semibold text-bx-ink">
          {count} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-bx-surface/10 overflow-hidden">
        <div className="h-full bg-bx-yellow rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
