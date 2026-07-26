import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { graphql, HeadFC, Link, PageProps } from 'gatsby'
import { ArrowLeft, MapPin } from 'lucide-react'
import SEO from '../../components/SEO'
import { LiveInfo } from '../../types/live'
import {
  PREFECTURE_LIST,
  PrefectureName,
  extractPrefecture,
} from '../../utils/extractPrefecture'
import type { PrefectureCountMap } from '../../components/live/LiveHeatmap'

// Leaflet は SSR 不可なので動的読み込み
const LiveHeatmap = lazy(() => import('../../components/live/LiveHeatmap'))

type LiveTypeFilter = 'all' | 'oneman' | 'event'

interface HeatmapQuery {
  live: {
    liveInfos: LiveInfo[]
  }
}

interface AggregatedItem {
  liveUuid: string
  liveTitle: string
  liveType: string
  date: string
  place: string | null
  address: string | null
  prefecture: PrefectureName | null
  overseasRegion: string | null
  overseasSubRegion: string | null
}

type SelectedRegion =
  | { kind: 'jp'; name: PrefectureName }
  | { kind: 'overseas'; name: string }
  | null

const ReolHeatmapPage: React.FC<PageProps<HeatmapQuery>> = ({ data }) => {
  const [typeFilter, setTypeFilter] = React.useState<LiveTypeFilter>('all')
  const [selected, setSelected] = React.useState<SelectedRegion>(null)
  // Leaflet は SSR 環境で window を要求する。クライアントマウント後にだけ描画する。
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const allItems = useMemo<AggregatedItem[]>(() => {
    const out: AggregatedItem[] = []
    for (const live of data.live.liveInfos) {
      for (const item of live.items ?? []) {
        const { prefecture, overseasRegion, overseasSubRegion } =
          extractPrefecture(item.address, item.place)
        out.push({
          liveUuid: live.liveUuid,
          liveTitle: live.title,
          liveType: live.type,
          date: item.date ?? live.date,
          place: item.place,
          address: item.address,
          prefecture,
          overseasRegion,
          overseasSubRegion,
        })
      }
    }
    return out
  }, [data])

  const filteredItems = useMemo(
    () =>
      allItems.filter((it) =>
        typeFilter === 'all' ? true : it.liveType === typeFilter
      ),
    [allItems, typeFilter]
  )

  const counts = useMemo<PrefectureCountMap>(() => {
    const map: PrefectureCountMap = {}
    for (const it of filteredItems) {
      if (!it.prefecture) continue
      map[it.prefecture] = (map[it.prefecture] ?? 0) + 1
    }
    return map
  }, [filteredItems])

  const overseasCountsMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const it of filteredItems) {
      if (!it.overseasRegion) continue
      map[it.overseasRegion] = (map[it.overseasRegion] ?? 0) + 1
    }
    return map
  }, [filteredItems])

  // 「県/市/州」単位の集計 (例: { 新北市: 2, Massachusetts: 1 })
  const overseasSubCountsMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const it of filteredItems) {
      if (!it.overseasSubRegion) continue
      map[it.overseasSubRegion] = (map[it.overseasSubRegion] ?? 0) + 1
    }
    return map
  }, [filteredItems])

  // ランキングに並べる「海外サブ地域」一覧。同じ国の中でサブが複数ありうるため
  // [「台湾・新北市」, count] のように表示する。
  const overseasSubRanking = useMemo(() => {
    type Row = { region: string; sub: string; count: number }
    const rows: Row[] = []
    const seen = new Set<string>()
    for (const it of filteredItems) {
      if (!it.overseasRegion) continue
      const sub = it.overseasSubRegion ?? '(不明)'
      const key = `${it.overseasRegion}::${sub}`
      if (seen.has(key)) continue
      seen.add(key)
      const count = filteredItems.filter(
        (x) =>
          x.overseasRegion === it.overseasRegion &&
          (x.overseasSubRegion ?? '(不明)') === sub
      ).length
      rows.push({ region: it.overseasRegion, sub, count })
    }
    return rows.sort((a, b) => b.count - a.count)
  }, [filteredItems])

  const overseasCounts = useMemo(
    () =>
      Object.entries(overseasCountsMap).sort((a, b) => b[1] - a[1]) as [
        string,
        number,
      ][],
    [overseasCountsMap]
  )

  const unknownCount = filteredItems.filter(
    (it) => !it.prefecture && !it.overseasRegion
  ).length

  // 地域別ランキング
  // - 都道府県は 0 件も全て表示 (47 ぶん)
  // - 海外は「国・サブ地域」単位 (例: 台湾・新北市) で 1 件以上のみ表示
  type RankingEntry = {
    region: string
    count: number
    kind: 'jp' | 'overseas'
    order: number
    /** マップパン用: 'jp' は都道府県名、'overseas' は admin1 サブ名 (なければ国名) */
    targetName: string
  }
  const ranking = useMemo<RankingEntry[]>(() => {
    const jpEntries: RankingEntry[] = PREFECTURE_LIST.map((p, i) => ({
      region: p,
      count: counts[p] ?? 0,
      kind: 'jp',
      order: i,
      targetName: p,
    }))
    const overseasEntries: RankingEntry[] = overseasSubRanking.map((r, i) => ({
      region:
        r.sub === '(不明)' ? r.region : `${r.region}・${r.sub}`,
      count: r.count,
      kind: 'overseas',
      order: 1000 + i,
      targetName: r.sub === '(不明)' ? r.region : r.sub,
    }))
    return [...jpEntries, ...overseasEntries].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.order - b.order
    })
  }, [counts, overseasSubRanking])

  const totalJP = Object.values(counts).reduce<number>(
    (s, c) => s + (c ?? 0),
    0
  )
  const totalOverseas = overseasCounts.reduce((s, [, c]) => s + c, 0)
  const visitedJP = PREFECTURE_LIST.filter((p) => (counts[p] ?? 0) > 0).length

  // 選択中エリアに属する公演を抽出
  const selectedItems = useMemo<AggregatedItem[]>(() => {
    if (!selected) return []
    if (selected.kind === 'jp') {
      return filteredItems.filter((it) => it.prefecture === selected.name)
    }
    // overseas: name は国名 (例: '香港') か admin1 名 (例: 'Massachusetts')
    return filteredItems.filter(
      (it) =>
        it.overseasRegion === selected.name ||
        it.overseasSubRegion === selected.name
    )
  }, [filteredItems, selected])

  // 選択中エリアの「会場別」グループ
  const selectedVenues = useMemo(() => {
    const map = new Map<
      string,
      { place: string; address: string | null; count: number }
    >()
    for (const it of selectedItems) {
      const key = it.place ?? it.address ?? '(会場不明)'
      const cur = map.get(key)
      if (cur) cur.count += 1
      else
        map.set(key, {
          place: it.place ?? '(会場不明)',
          address: it.address,
          count: 1,
        })
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [selectedItems])

  // 会場別ランキング (全体)
  const venueRanking = useMemo(() => {
    const map = new Map<
      string,
      {
        place: string
        address: string | null
        prefecture: PrefectureName | null
        overseasRegion: string | null
        overseasSubRegion: string | null
        count: number
      }
    >()
    for (const it of filteredItems) {
      if (!it.place) continue
      const key = it.place
      const cur = map.get(key)
      if (cur) cur.count += 1
      else
        map.set(key, {
          place: it.place,
          address: it.address,
          prefecture: it.prefecture,
          overseasRegion: it.overseasRegion,
          overseasSubRegion: it.overseasSubRegion,
          count: 1,
        })
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [filteredItems])

  return (
    <div className="min-h-screen bg-bx-bg">
      <header className="bg-bx-bg shadow-sm border-b border-bx-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/live/"
            className="inline-flex items-center gap-2 text-bx-blueLight hover:text-bx-blue font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            LIVE 一覧へ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-bx-ink">
            <MapPin className="w-6 h-6 text-bx-blueLight" />
            Reol 公演ヒートマップ
          </h1>
          <p className="mt-1 text-sm text-bx-ink3">
            これまでに開催された Reol の公演を都道府県別に可視化しています。色が濃いほど公演数が多い地域です。
          </p>
        </div>

        {/* タイプフィルタ */}
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'すべて', color: 'bg-purple-600' },
              { key: 'oneman', label: 'ワンマン', color: 'bg-pink-600' },
              { key: 'event', label: 'イベント', color: 'bg-blue-600' },
            ] as { key: LiveTypeFilter; label: string; color: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                typeFilter === t.key
                  ? `${t.color} text-white shadow`
                  : 'bg-bx-bg text-bx-ink3 border border-bx-line hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* マップ */}
        <Suspense
          fallback={
            <div className="h-[320px] rounded-lg border border-bx-line bg-bx-line/30 flex items-center justify-center text-bx-ink3 text-sm">
              地図を読み込み中...
            </div>
          }
        >
          {mounted ? (
            <LiveHeatmap
              counts={counts}
              overseasCounts={overseasCountsMap}
              overseasSubCounts={overseasSubCountsMap}
              venueCounts={Object.fromEntries(
                venueRanking.map((v) => [v.place, v.count])
              )}
              selectedPrefecture={selected?.kind === 'jp' ? selected.name : null}
              selectedOverseasRegion={
                selected?.kind === 'overseas' ? selected.name : null
              }
              onSelectPrefecture={(name) =>
                setSelected((prev) =>
                  prev?.kind === 'jp' && prev.name === name
                    ? null
                    : { kind: 'jp', name }
                )
              }
              onSelectOverseas={(name) =>
                setSelected((prev) =>
                  prev?.kind === 'overseas' && prev.name === name
                    ? null
                    : { kind: 'overseas', name }
                )
              }
            />
          ) : (
            <div className="h-[320px] rounded-lg border border-bx-line bg-bx-line/30 flex items-center justify-center text-bx-ink3 text-sm">
              地図を読み込み中...
            </div>
          )}
        </Suspense>

        {/* 選択中エリアの会場一覧 */}
        {selected && (
          <div className="mt-3 bg-bx-bg rounded-lg border border-bx-line p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-sm text-bx-ink">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                    selected.kind === 'jp' ? 'bg-bx-yellow' : 'bg-blue-500'
                  }`}
                />
                {selected.name} の会場 ({selectedVenues.length})
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-bx-ink3 hover:text-bx-ink underline"
              >
                選択解除
              </button>
            </div>
            {selectedVenues.length === 0 ? (
              <p className="text-xs text-bx-ink3">
                このエリアでの公演データはまだありません
              </p>
            ) : (
              <ul className="text-xs divide-y divide-bx-line">
                {selectedVenues.map((v) => (
                  <li
                    key={`${v.place}-${v.address ?? ''}`}
                    className="py-1.5 flex items-start gap-2"
                  >
                    <span className="flex-1">
                      <span className="font-medium text-bx-ink">
                        {v.place}
                      </span>
                      {v.address && (
                        <span className="block text-[10px] text-bx-ink3">
                          {v.address}
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-bx-yellow text-xs">
                      {v.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* サマリー */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-bx-bg border border-bx-line rounded p-2">
            <div className="text-bx-ink3">国内公演</div>
            <div className="text-lg font-bold text-bx-yellow">{totalJP}</div>
          </div>
          <div className="bg-bx-bg border border-bx-line rounded p-2">
            <div className="text-bx-ink3">海外公演</div>
            <div className="text-lg font-bold text-bx-blue">{totalOverseas}</div>
          </div>
          <div className="bg-bx-bg border border-bx-line rounded p-2">
            <div className="text-bx-ink3">参加都道府県</div>
            <div className="text-lg font-bold text-bx-yellow">{visitedJP} / 47</div>
          </div>
          <div className="bg-bx-bg border border-bx-line rounded p-2">
            <div className="text-bx-ink3">不明 / 未確定</div>
            <div className="text-lg font-bold text-bx-ink3">{unknownCount}</div>
          </div>
        </div>

        {/* 地域別ランキング (国内 47 都道府県 + 海外地域 1件以上) */}
        <div className="mt-4">
          <section className="bg-bx-bg rounded-lg border border-bx-line p-3">
            <h2 className="font-bold text-sm mb-2 text-bx-ink">
              地域別ランキング
            </h2>
            {ranking.length === 0 ? (
              <p className="text-xs text-bx-ink3">該当データがありません</p>
            ) : (
              <ol className="text-xs divide-y divide-bx-line max-h-[480px] overflow-y-auto pr-1">
                {ranking.map((r, i) => {
                  const top = ranking[0]?.count || 1
                  const ratio = r.count / top
                  const isOverseas = r.kind === 'overseas'
                  const targetSelected: SelectedRegion = isOverseas
                    ? { kind: 'overseas', name: r.targetName }
                    : { kind: 'jp', name: r.targetName as PrefectureName }
                  return (
                    <li
                      key={`${r.kind}-${r.region}`}
                      className="py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/5"
                      onClick={() => setSelected(targetSelected)}
                    >
                      <span className="w-7 text-right text-bx-ink3">{i + 1}.</span>
                      <span className="w-28 truncate flex items-center gap-1 text-bx-ink">
                        {r.region}
                      </span>
                      <div className="flex-1 bg-bx-line/50 rounded h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            isOverseas ? 'bg-blue-500' : 'bg-bx-yellow'
                          }`}
                          style={{
                            width: `${
                              r.count > 0 ? Math.max(4, ratio * 100) : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span
                        className={`w-8 text-right font-mono font-bold ${
                          isOverseas ? 'text-bx-blue' : 'text-bx-yellow'
                        }`}
                      >
                        {r.count}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>

        {/* 会場別ランキング */}
        <div className="mt-4">
          <section className="bg-bx-bg rounded-lg border border-bx-line p-3">
            <h2 className="font-bold text-sm mb-2 text-bx-ink">
              会場別ランキング
            </h2>
            {venueRanking.length === 0 ? (
              <p className="text-xs text-bx-ink3">該当データがありません</p>
            ) : (
              <ol className="text-xs divide-y divide-bx-line max-h-[480px] overflow-y-auto pr-1">
                {venueRanking.map((v, i) => {
                  const top = venueRanking[0]?.count || 1
                  const ratio = v.count / top
                  const isOverseas = !!v.overseasRegion
                  const areaLabel = isOverseas
                    ? v.overseasSubRegion
                      ? `${v.overseasRegion}・${v.overseasSubRegion}`
                      : v.overseasRegion
                    : v.prefecture ?? '(地域不明)'
                  // 行タップで地図中心を移動: admin1 サブ地域 > 国 > 都道府県
                  const targetSelected: SelectedRegion = isOverseas
                    ? {
                        kind: 'overseas',
                        name: v.overseasSubRegion ?? v.overseasRegion ?? '',
                      }
                    : v.prefecture
                      ? { kind: 'jp', name: v.prefecture }
                      : null
                  return (
                    <li
                      key={`venue-${v.place}-${i}`}
                      className={`py-1.5 flex items-center gap-2 ${
                        targetSelected
                          ? 'cursor-pointer hover:bg-white/5'
                          : ''
                      }`}
                      onClick={() => {
                        if (targetSelected) setSelected(targetSelected)
                      }}
                    >
                      <span className="w-7 text-right text-bx-ink3">
                        {i + 1}.
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium text-bx-ink">
                          {v.place}
                        </span>
                        <span className="block text-[10px] text-bx-ink3 truncate">
                          {areaLabel}
                        </span>
                      </span>
                      <div className="w-24 bg-bx-line/50 rounded h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            isOverseas ? 'bg-blue-500' : 'bg-bx-yellow'
                          }`}
                          style={{
                            width: `${
                              v.count > 0 ? Math.max(4, ratio * 100) : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span
                        className={`w-8 text-right font-mono font-bold ${
                          isOverseas ? 'text-bx-blue' : 'text-bx-yellow'
                        }`}
                      >
                        {v.count}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>

        <p className="mt-4 text-[10px] text-bx-ink3">
          地図データ:&nbsp;
          <a
            className="underline"
            href="https://github.com/dataofjapan/land"
            target="_blank"
            rel="noopener noreferrer"
          >
            dataofjapan/land
          </a>
        </p>
      </main>
    </div>
  )
}

export const query = graphql`
  query ReolHeatmapQuery {
    live {
      liveInfos {
        liveUuid
        type
        title
        date
        items {
          liveItemUuid
          date
          place
          address
        }
      }
    }
  }
`

export default ReolHeatmapPage

export const Head: HeadFC = () => (
  <SEO
    title="参戦地マップ(公演ヒートマップ)"
    description="Reol の過去公演を都道府県別にヒートマップで可視化します。"
    path="/live/heatmap/"
  />
)
