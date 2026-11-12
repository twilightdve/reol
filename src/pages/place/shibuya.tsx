/**
 * /place/shibuya/ — 聖地巡礼ガイド 渋谷編(plan/68 の C)。日本語版だけ(/place/ の先頭からここへリンクする)。
 *
 * 運営者が X に書いたガイド(2026-07-09)を、いつ読んでも通じる形に直して置いたもの。
 * - 写真は使わない。地図は座標から描く自前の略図(ShibuyaMap)。番号の並びは直線距離で見た順番で、道順ではない
 * - 歩く時間、渋谷から新宿への行き方・所要時間は書かない(測っていないため)
 * - 歌詞は書き写さない
 * - 出典の確かめられない話は載せない。場所を足す時も、出典(本人の投稿・公式の告知など)のリンクを添える
 * - 「新宿の会場へ向かう日に」は 2026-12-15 の公演のための節。公演の翌日から表示しない(SHINJUKU_UNTIL)。
 *   公演が終わったら節ごと消す
 */
import React, { FC, useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import BackToTopButton from "../../components/common/BackToTopButton";
import { Kicker } from "../../components/redesign";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { useDeepLinkScroll } from "../../hooks/useDeepLinkScroll";

const containerCls = "rounded-lg border border-bx-line bg-bx-surface/5 p-4 sm:p-5";
const linkCls = "text-bx-blue underline underline-offset-2 hover:text-bx-blueLight";
const bodyCls = "text-sm sm:text-[15px] leading-relaxed text-bx-ink2 space-y-3";

const TITLE = "Reol聖地巡礼ガイド 渋谷編";
const UPDATED = "2026年11月12日";
const SHINJUKU_UNTIL = Date.parse("2026-12-16T00:00:00+09:00");

type RouteSpot = { id: string; name: string; note: string; lat: number; lng: number };

// 渋谷駅のまわりを歩いて回れる範囲の場所。並びは、隣どうしが近くなる順(直線距離)
const ROUTE_SPOTS: RouteSpot[] = [
  { id: "stream-hall", name: "渋谷ストリームホール", note: "2019年『文明ココロミー』-東の塔-", lat: 35.6575589, lng: 139.7025291 },
  { id: "hodoukyou", name: "渋谷駅東口の歩道橋", note: "「第六感」MV", lat: 35.6581761, lng: 139.7026735 },
  { id: "o-east", name: "Spotify O-EAST", note: "2015年・2024年「東の宴」", lat: 35.6587215, lng: 139.6956111 },
  { id: "veats", name: "Veats Shibuya", note: "2019年 ショーケースライヴ", lat: 35.66062, lng: 139.6976296 },
  { id: "ningen-kankei", name: "人間関係 cafe de copain", note: "喫茶", lat: 35.6611601, lng: 139.6988751 },
  { id: "torahebi", name: "虎へび珈琲", note: "喫茶", lat: 35.6619969, lng: 139.6992611 },
  { id: "modi", name: "渋谷MODI", note: "2018年「エンド」街頭ビジョン", lat: 35.6614887, lng: 139.7005798 },
  { id: "tower-records", name: "タワーレコード渋谷店", note: "リリースイベント・インストアライヴ", lat: 35.6619049, lng: 139.7010906 },
  { id: "line-cube", name: "LINE CUBE SHIBUYA", note: "2020年 接続編／2021年『音沙汰』／2026年『美辞学』", lat: 35.6642039, lng: 139.6985553 },
];
const STATION = { name: "渋谷駅", lat: 35.658, lng: 139.7016 };

const spotNo = (id: string): number => ROUTE_SPOTS.findIndex((s) => s.id === id) + 1;

/** 2点間の直線距離(m) */
const distanceM = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

const ROUTE_KM = (
  ROUTE_SPOTS.slice(1).reduce((sum, s, i) => sum + distanceM(ROUTE_SPOTS[i], s), 0) / 1000
).toFixed(1);

const MAP_W = 400;
const MAP_H = 440;
const MAP_PAD = 34;

/** 渋谷駅のまわりの略図。緯度経度から位置を出して、番号だけを置く(道や建物は描かない) */
const ShibuyaMap: FC = () => {
  const k = Math.cos((35.6608 * Math.PI) / 180);
  const all = [...ROUTE_SPOTS, STATION];
  const minX = Math.min(...all.map((p) => p.lng * k));
  const maxX = Math.max(...all.map((p) => p.lng * k));
  const minY = Math.min(...all.map((p) => p.lat));
  const maxY = Math.max(...all.map((p) => p.lat));
  const scale = Math.min((MAP_W - MAP_PAD * 2) / (maxX - minX), (MAP_H - MAP_PAD * 2) / (maxY - minY));
  const offsetX = (MAP_W - (maxX - minX) * scale) / 2;
  const offsetY = (MAP_H - (maxY - minY) * scale) / 2;
  const xy = (p: { lat: number; lng: number }): [number, number] => [
    Math.round((offsetX + (p.lng * k - minX) * scale) * 10) / 10,
    Math.round((MAP_H - offsetY - (p.lat - minY) * scale) * 10) / 10,
  ];
  const points = ROUTE_SPOTS.map(xy);
  const [sx, sy] = xy(STATION);
  // 緯度1度 ≒ 111,320m。100m の物差しの長さ
  const bar = Math.round((100 / 111320) * scale * 10) / 10;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role="img"
      aria-labelledby="shibuya-map-title"
      className="block w-full h-auto rounded-lg border border-bx-line bg-bx-bg/60"
    >
      <title id="shibuya-map-title">{`渋谷駅のまわりの${ROUTE_SPOTS.length}か所の略図`}</title>
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="1.5 5"
        strokeLinecap="round"
        className="stroke-bx-blue"
      />
      <rect x={sx - 5} y={sy - 5} width={10} height={10} fill="none" strokeWidth={1.5} className="stroke-bx-ink3" />
      <text x={sx - 10} y={sy + 4} textAnchor="end" fontSize={12} className="fill-bx-ink3">
        {STATION.name}
      </text>
      {ROUTE_SPOTS.map((s, i) => (
        <g key={s.id}>
          <circle cx={points[i][0]} cy={points[i][1]} r={13} className="fill-bx-yellow" />
          <text x={points[i][0]} y={points[i][1] + 5} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-bx-bg">
            {i + 1}
          </text>
        </g>
      ))}
      <line x1={14} y1={MAP_H - 24} x2={14 + bar} y2={MAP_H - 24} strokeWidth={1.5} className="stroke-bx-ink" />
      <text x={14} y={MAP_H - 9} fontSize={11} className="fill-bx-ink3">
        100m(直線)
      </text>
      <text x={MAP_W - 12} y={20} textAnchor="end" fontSize={11} className="fill-bx-ink3">
        北が上
      </text>
    </svg>
  );
};

const Ext: FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>
    {children}
  </a>
);

const In: FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className={linkCls}>
    {children}
  </Link>
);

const Section: FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section className={containerCls} aria-labelledby={id}>
    <h2 id={id} className="text-lg sm:text-xl font-bold text-bx-ink mb-3 scroll-mt-20">
      {title}
    </h2>
    <div className={bodyCls}>{children}</div>
  </section>
);

/** 場所ひとつ分の見出し。歩いて回る順番に入っている場所には、略図と同じ番号を付ける */
const Spot: FC<{ id: string; title: string; work?: string; children: React.ReactNode }> = ({ id, title, work, children }) => {
  const no = spotNo(id);
  return (
    <div className="pt-4 border-t border-bx-line first:pt-0 first:border-t-0 space-y-3">
      <h3 id={id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold text-bx-ink scroll-mt-20">
        {no > 0 && (
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bx-yellow text-xs font-bold text-bx-bg"
            aria-label={`略図の${no}番`}
          >
            {no}
          </span>
        )}
        <span>{title}</span>
        {work && <span className="text-sm font-normal text-bx-ink3">{work}</span>}
      </h3>
      {children}
    </div>
  );
};

const listCls = "list-disc pl-5 space-y-1.5";
const linksCls = "list-none space-y-1.5 text-[13px] sm:text-sm";

const ShibuyaGuidePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showShinjuku, setShowShinjuku] = useState(true);

  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[4] }));
  }, [dispatch]);

  useEffect(() => {
    if (Date.now() >= SHINJUKU_UNTIL) setShowShinjuku(false);
  }, []);

  useDeepLinkScroll();

  return (
    <>
      <main className="relative container mx-auto w-full max-w-3xl px-3 sm:px-4 py-6 text-bx-ink space-y-6" lang="ja">
        <section className={containerCls}>
          <Kicker color="text-bx-blue" className="mb-2">
            PLACE / SHIBUYA
          </Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink">{TITLE}</h1>
          <p className="mt-1 mb-4 text-sm text-bx-ink3">〜渋谷はReolの交差点〜</p>
          <div className={bodyCls}>
            <p>渋谷は、Reol にとっても Reol のリスナーにとっても、特別な場所だと思います。</p>
            <p>
              リリースイベントとインストアライヴのタワーレコード渋谷店。
              <br />
              「極彩色HighFidelity 東の宴」と「極秘LEGIT 東の宴」の O-EAST。
              <br />
              『エンド』が街頭ビジョンに流れた渋谷MODI。
              <br />
              『文明ココロミー -東の塔-』の渋谷ストリームホール。
              <br />
              「ハーメルンの大号令」東京公演の中止、無観客の「接続編」、『音沙汰』、そして『美辞学』東京公演の LINE CUBE
              SHIBUYA。
            </p>
            <p>
              歌詞の中にも、渋谷のまわりの地名が出てきます。
              <br />
              <In to="/songs/1ldk/">『1LDK』</In>の表参道と松濤。<In to="/songs/hype-mode/">『HYPE MODE』</In>の東京・渋谷。
              <In to="/songs/b12/">『B12』</In>の12番出口。
            </p>
            <p>ライヴの前に少し知っておくと、いつもの渋谷が少しだけ Reol に見えてきます。</p>
            <p>
              昔から聴いている人には、追憶に浸る場所として。
              <br />
              最近 Reol を知った人には、曲をもう少し深く聴くきっかけとして。
              <br />
              遠征で来る人には、ライヴ前後の歩き方の参考として、使ってもらえたらうれしいです。
            </p>
            <p className="text-xs text-bx-ink3">※誤りがあれば、お手数ですがご指摘ください。</p>
          </div>
          <p className="mt-3 text-xs text-bx-ink3">最終更新: {UPDATED}</p>
        </section>

        <Section id="shibuya-list" title="渋谷のスポット一覧">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-bold text-bx-ink mb-1">ライヴ会場・公演の場所</p>
              <ul className={listCls}>
                <li>
                  <a href="#line-cube" className={linkCls}>
                    LINE CUBE SHIBUYA
                  </a>
                </li>
                <li>
                  <a href="#o-east" className={linkCls}>
                    Spotify O-EAST
                  </a>
                </li>
                <li>
                  <a href="#stream-hall" className={linkCls}>
                    渋谷ストリームホール
                  </a>
                </li>
                <li>
                  <a href="#veats" className={linkCls}>
                    Veats Shibuya
                  </a>
                </li>
                <li>
                  <a href="#tower-records" className={linkCls}>
                    タワーレコード渋谷店
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-bx-ink mb-1">MV・映像・街頭の場所</p>
              <ul className={listCls}>
                <li>
                  <a href="#hodoukyou" className={linkCls}>
                    渋谷駅東口の歩道橋
                  </a>
                </li>
                <li>
                  <a href="#modi" className={linkCls}>
                    渋谷MODI
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-bx-ink mb-1">歌詞に出てくる地名</p>
              <ul className={listCls}>
                <li>
                  <a href="#omotesando-shoto" className={linkCls}>
                    表参道
                  </a>
                </li>
                <li>
                  <a href="#omotesando-shoto" className={linkCls}>
                    松濤
                  </a>
                </li>
                <li>
                  <a href="#exit-12" className={linkCls}>
                    渋谷駅の「12番出口」
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-bx-ink mb-1">休憩と食事、器の店</p>
              <ul className={listCls}>
                <li>
                  <a href="#ningen-kankei" className={linkCls}>
                    人間関係 cafe de copain
                  </a>
                </li>
                <li>
                  <a href="#torahebi" className={linkCls}>
                    虎へび珈琲
                  </a>
                </li>
                <li>
                  <a href="#borracho" className={linkCls}>
                    ボラーチョ(駒場東大前)
                  </a>
                </li>
                <li>
                  <a href="#little-tao" className={linkCls}>
                    Little TAO / THE GARAGE(中目黒)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section id="shibuya-walk" title={`歩いて回る:渋谷駅のまわりの${ROUTE_SPOTS.length}か所`}>
          <p>
            渋谷駅のまわりにまとまっている{ROUTE_SPOTS.length}か所を、隣どうしが近くなるように並べるとこうなります。
          </p>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <figure className="mx-auto w-full max-w-sm">
              <ShibuyaMap />
              <figcaption className="mt-1.5 text-xs text-bx-ink3">
                点線は順番の目安で、道順ではありません。位置はおおよそです。
              </figcaption>
            </figure>
            <ol className="space-y-2">
              {ROUTE_SPOTS.map((s, i) => (
                <li key={s.id} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bx-yellow text-xs font-bold text-bx-bg"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="sr-only">{i + 1}. </span>
                    <a href={`#${s.id}`} className={linkCls}>
                      {s.name}
                    </a>
                    <span className="block text-xs text-bx-ink3">{s.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p>
            隣どうしの直線距離を足すと、1から{ROUTE_SPOTS.length}までで約{ROUTE_KM}kmです。実際に歩く道のりはこれより長く、坂と信号もあります。
          </p>
          <p>全部を回るのは大変なので、時間と体力に合わせて、気になる場所だけでも。</p>
          <p>
            ボラーチョ、Little TAO、表参道から松濤にかけては、この{ROUTE_SPOTS.length}か所から離れています。それぞれの項目に書きました。
          </p>
        </Section>

        <Section id="shibuya-lyrics" title="歌詞に出てくる地名">
          <Spot id="omotesando-shoto" title="表参道と松濤" work="『1LDK』">
            <p>『1LDK』の歌詞には、表参道と松濤が出てきます。</p>
            <p>
              表参道は、渋谷から一駅の距離にある、少し年齢層が上がるお洒落な街。
              <br />
              そこから宮益坂を下ると渋谷スクランブル交差点。文化村通りを抜けると、渋谷の高級住宅地、松濤があります。
            </p>
            <p>
              同じ渋谷のまわりでも、スクランブル交差点のような派手な場所ではなく、落ち着いた雰囲気になります。
              <br />
              『1LDK』を聴きながら松濤のあたりを歩いてみると、渋谷の見え方が少し変わるかもしれません。
            </p>
            <ul className={linksCls}>
              <li>
                <Ext href="https://youtu.be/Mx2TMt8xLxk">「1LDK」Music Video(Reol 公式 YouTube)</Ext>
              </li>
              <li>
                <In to="/songs/1ldk/">「1LDK」の曲ページ</In>
              </li>
              <li>
                <In to="/articles/1ldk/">読みもの「1LDK――イヤフォンの向こうにいた人」</In>
              </li>
            </ul>
          </Spot>

          <Spot id="exit-12" title="12番出口" work="『B12』">
            <p>
              『B12』の歌詞には、渋谷の「12番出口」が出てきます。『B12』が入った『エンドレスEP』が配信されたのは、2017年10月です。
            </p>
            <p>
              渋谷駅は再開発で、出口の名前も道筋も何度も変わっています。地下の出口の番号も、2019年11月に付け替えられました。当時の「12番出口」が今のどの出口にあたるかは、確かめられていません。
            </p>
            <ul className={linksCls}>
              <li>
                <In to="/songs/b12/">「B12」の曲ページ</In>
              </li>
              <li>
                <Ext href="https://www.tokyometro.jp/news/2019/202831.html">
                  渋谷駅周辺の歩行者ルートがさらにわかりやすくなります！～新地下出入口番号の運用開始～(東京メトロ、2019年8月28日)
                </Ext>
              </li>
            </ul>
          </Spot>
        </Section>

        <Section id="shibuya-rest" title="休憩と食事">
          <p>
            ライヴの前後は、意外と休憩する場所やご飯の場所に迷います。
            <br />
            特に LINE CUBE SHIBUYA のまわりは、開場の前後に人が増えやすいので、候補をいくつか持っておくと安心です。
          </p>
          <p>
            ここでは、Reol 本人の投稿や、訪れた話が残っている店を紹介します。
            <br />
            飲食店なので、混んでいる時の長居や撮影には気をつけて、普通にお店を楽しむくらいの温度がちょうど良いと思います。
          </p>

          <Spot id="ningen-kankei" title="人間関係 cafe de copain">
            <p>
              ライヴ会場でも MV のロケ地でもありません。
              <br />
              ただ、Reol 本人が Instagram に外観の写真を載せていて、「人間関係」という店名を気に入っている様子が残っています(2021年9月10日の投稿)。
            </p>
            <p>LINE CUBE SHIBUYA からも近いので、ライヴ前後の休憩にも使いやすいです。</p>
            <ul className={linksCls}>
              <li>東京都渋谷区宇田川町16-12</li>
              <li>
                <Ext href="https://maps.app.goo.gl/YrTN4YVqtLkJ8rYw8">Google マップで開く</Ext>
              </li>
              <li>
                <Ext href="https://www.instagram.com/p/CTnC1kEv19s/">Reol の Instagram の投稿</Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="torahebi" title="虎へび珈琲">
            <p>
              LINE CUBE SHIBUYA の近くで休憩するなら、虎へび珈琲も候補に入れておきたいです。
              <br />
              Reol 本人が Instagram のストーリーで、アイスコーヒーを飲んでいる様子を載せていたことがあるお店です(2024年6月3日)。
            </p>
            <p>
              会場から近いのは便利ですが、少し高級なので、安く済ませたい方には勧めません。値段に見合った感動があるので、珈琲が好きな方にはおすすめです。
            </p>
            <ul className={linksCls}>
              <li>
                <Ext href="https://maps.app.goo.gl/TkKpGByGPax2XKfa7">Google マップで開く</Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="borracho" title="ボラーチョ(駒場東大前)">
            <p>
              ライヴ前後の食事の候補として、レストラン ボラーチョもおすすめです。
              <br />
              Reol が2025年12月29日の Instagram に写真を載せていたお店で、『孤独のグルメ』Season3 第7話にも登場しています。
            </p>
            <p>
              渋谷駅のまわりの{ROUTE_SPOTS.length}か所からは離れています(渋谷駅東口の歩道橋から直線で約1.3km)。歩いて回る順番には入れていません。
              <br />
              人気店なので、基本的に予約が必要です。
            </p>
            <ul className={linksCls}>
              <li>
                <Ext href="https://maps.app.goo.gl/EbAx84ktG7hyKYXj6">Google マップで開く</Ext>
              </li>
              <li>
                <Ext href="https://www.tv-tokyo.co.jp/kodokunogurume3/story/0821.html">
                  『孤独のグルメ Season3』第7話(テレビ東京)
                </Ext>
              </li>
            </ul>
          </Spot>
        </Section>

        <Section id="shibuya-utsuwa" title="器の店">
          <p>ライヴ会場や飲食店とは少し違いますが、Reol の映像に出てきた店として行きたい場所です。</p>

          <Spot id="little-tao" title="Little TAO / THE GARAGE(中目黒)">
            <p>
              「れをるTVって言われました」で金継ぎをしていたお店です。
              <br />
              カフェで、金継ぎで、革靴で、食器屋さんでもある、いくつもの顔を持つお店。
              <br />
              店主の方がとても気さくで、Reol の話を伺うと、当時の話もしてくれました。
            </p>
            <p>
              渋谷からは電車で2駅ほど離れています(渋谷駅東口の歩道橋から直線で約1.8km)。歩いて回る順番には入れていませんが、行く価値ありです。
            </p>
            <ul className={linksCls}>
              <li>東京都目黒区中目黒3-1-4</li>
              <li>
                <Ext href="https://maps.app.goo.gl/1X76G7fhvprAf8Ye7">Google マップで開く</Ext>
              </li>
            </ul>
          </Spot>
        </Section>

        <Section id="shibuya-mv" title="MV・映像・街頭の場所">
          <Spot id="hodoukyou" title="渋谷駅東口の歩道橋" work="『第六感』">
            <p>まず立ち寄りたいのは、渋谷駅東口の歩道橋です。</p>
            <p>
              『第六感』の MV には、再開発の進む渋谷を背景にした印象的なカットがあります。
              <br />
              歩道橋、ビル、信号、人の流れ。渋谷のスピード感と『第六感』の疾走感が合っています。
            </p>
            <p>
              BARKS のインタビューで Reol は、アルバム『第六感』のコンセプトを「いちばん大きな交差点に出るということ」と話しています。
            </p>
            <p>渋谷はまさに交差点の街です。人も、広告も、音も、いろいろなものが交わっています。</p>
            <ul className={linksCls}>
              <li>東京都渋谷区渋谷2丁目</li>
              <li>
                <Ext href="https://maps.app.goo.gl/byMNWNv7kaLxZtYK9">Google マップで開く</Ext>
              </li>
              <li>
                <Ext href="https://youtu.be/Ue6VQTcKPQo">「第六感 / THE SIXTH SENSE」Music Video(Reol 公式 YouTube)</Ext>
              </li>
              <li>
                <Ext href="https://barks.jp/news/928660/">
                  【インタビュー】Reol、『第六感』を切り拓いた「いちばん大きな交差点に出るということ」(BARKS、2021年12月15日)
                </Ext>
              </li>
              <li>
                <In to="/songs/dairokkan/">「第六感」の曲ページ</In> ／ <In to="/place/">聖地の一覧で「第六感」のロケ地を見る</In>
              </li>
            </ul>
          </Spot>

          <Spot id="modi" title="渋谷MODI" work="『エンド』">
            <p>
              2018年3月15日、渋谷モディ前のスクランブル交差点にある大型の街頭ビジョンで、『エンド』の MV が流れました。
            </p>
            <p>
              渋谷MODI の前を通る時にこのことを知っていると、ただのビルではなくなるかもしれません。ライヴ前の道中で寄りやすいので、ついでに見ておくのもありです。
            </p>
            <ul className={linksCls}>
              <li>
                <Ext href="https://maps.app.goo.gl/k1oij21kPCpMZQRB6">Google マップで開く</Ext>
              </li>
              <li>
                <Ext href="https://x.com/RRReol/status/974217298314641408">Reol の投稿(2018年3月15日)</Ext>
              </li>
              <li>
                <Ext href="https://youtu.be/ZwJs5Zc9oFk">「エンド」Music Video(Reol 公式 YouTube)</Ext>
              </li>
              <li>
                <In to="/songs/endo/">「エンド」の曲ページ</In> ／ <In to="/articles/endo/">読みもの「エンド　愛した過去に打つ終止符」</In>
              </li>
            </ul>
          </Spot>
        </Section>

        <Section id="shibuya-live" title="ライヴ会場・公演の場所">
          <Spot id="tower-records" title="タワーレコード渋谷店">
            <p>
              れをるのライヴの、始まりの場所です。
              <br />
              『極彩色』のリリースイベント「極彩色 〜朱(あか)編〜」(2015年8月24日、地下1階の CUTUP
              STUDIO でのミニライヴとトーク)と、『事実上』のレコ発インストアライヴが、ここで開かれました。
            </p>
            <ul className={linksCls}>
              <li>
                <Ext href="https://maps.app.goo.gl/xQMPdgg3R7c3dZN29">Google マップで開く</Ext>
              </li>
              <li>
                <Ext href="https://utaten.com/news/index/1497">「極彩色 〜朱(あか)編〜」の告知(UtaTen、2015年5月25日)</Ext>
              </li>
              <li>
                <Ext href="https://x.com/RRReol/status/1053509999199023104">
                  Reol の投稿(2018年10月20日、『事実上』のレコ発インストア)
                </Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="o-east" title="Spotify O-EAST" work="旧 TSUTAYA O-EAST">
            <p>二つの「東の宴」の会場です。</p>
            <ul className={listCls}>
              <li>
                2015年10月23日 れをる単独公演「極彩色HighFidelity」東の宴(当時は TSUTAYA O-EAST) →{" "}
                <In to="/live/azuma-no-utage/">公演のページ</In>
              </li>
              <li>
                2024年4月17日 Reol Secret Live "極秘LEGIT" 東の宴 → <In to="/live/azuma-no-utage-2/">セットリスト</In>
              </li>
            </ul>
            <ul className={linksCls}>
              <li>東京都渋谷区道玄坂2-14-8</li>
              <li>
                <Ext href="https://maps.app.goo.gl/6JLt5VtLDxa8sT977">Google マップで開く</Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="veats" title="Veats Shibuya">
            <p>
              Spotify O-EAST からそれほど離れていない場所にあります。
              <br />
              2019年10月28日、第16回 東京国際ミュージック・マーケットのショーケースライヴに Reol が出演しました。
            </p>
            <ul className={linksCls}>
              <li>
                <In to="/live/dai-16-kai/">公演のページ</In>
              </li>
              <li>東京都渋谷区宇田川町33-1</li>
              <li>
                <Ext href="https://maps.app.goo.gl/dnaJyZx1y4uZ53Xz8">Google マップで開く</Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="stream-hall" title="渋谷ストリームホール">
            <p>渋谷駅のすぐ近く。2019年7月13日に開かれた Reol Secret Live 2019「文明ココロミー」-東の塔- の会場です。</p>
            <ul className={linksCls}>
              <li>
                <In to="/live/azuma-no-tou/">セットリスト</In>
              </li>
              <li>東京都渋谷区渋谷3-21-3</li>
              <li>
                <Ext href="https://maps.app.goo.gl/CT5qABDSs1ShP2a5A">Google マップで開く</Ext>
              </li>
            </ul>
          </Spot>

          <Spot id="line-cube" title="LINE CUBE SHIBUYA" work="渋谷公会堂">
            <p>Reol のファンにとって、かなり大事な場所です。</p>
            <ul className={listCls}>
              <li>
                2020年3月21日 Reol Oneman Live 2020「ハーメルンの大号令」東京公演。ここで予定されていましたが、コロナ禍で中止になりました →{" "}
                <In to="/live/toukyou-chuushi/">公演のページ</In>
              </li>
              <li>
                2020年8月16日 同じ会場から届けられた、無観客の生配信ライヴ「ハーメルンの大号令 -接続編-」 →{" "}
                <In to="/live/liveyoutube/">セットリスト</In>
              </li>
              <li>
                2021年6月26日 Reol Installation Concert 2021「音沙汰」 → <In to="/live/toukyou-4/">セットリスト</In>
              </li>
              <li>
                2026年7月10日 Reol Oneman Live 2026「美辞学」東京公演 → <In to="/live/toukyou-9/">セットリスト</In>
              </li>
            </ul>
            <p>
              中止になった公演。
              <br />
              無観客で届けられた配信。
              <br />
              声を出せない客席に戻ってきた『音沙汰』。
              <br />
              そして『美辞学』。
            </p>
            <p>この流れを知ってから LINE CUBE SHIBUYA に行くと、会場の見え方がかなり変わるかもしれません。</p>
            <ul className={linksCls}>
              <li>東京都渋谷区宇田川町1-1</li>
              <li>
                <Ext href="https://linecubeshibuya.com/">会場の公式サイト</Ext>
              </li>
            </ul>
          </Spot>
        </Section>

        {showShinjuku && (
          <Section id="shibuya-shinjuku" title="新宿の会場へ向かう日に(2026年12月15日 Zepp Shinjuku)">
            <p>
              2026年12月15日の「Reol Secret Live #極秘LEGIT #2」東京公演の会場は、渋谷ではなく新宿の Zepp Shinjuku (TOKYO) です。
            </p>
            <ul className={linksCls}>
              <li>会場: 東京都新宿区歌舞伎町1-29-1 東急歌舞伎町タワー B1F〜B4F</li>
              <li>
                <In to="/live/toukyou-10/">公演のページ</In> ／ <Ext href="https://www.zepp.co.jp/hall/shinjuku/">会場の公式サイト</Ext>
              </li>
            </ul>
            <p>
              このガイドの{ROUTE_SPOTS.length}か所は、渋谷駅のまわりを歩いて回る範囲です。会場は、そこから歩いて回る続きにはありません(LINE CUBE SHIBUYA
              から直線で約3.5km)。渋谷から新宿へは電車で移動します。行き方は、会場の公式サイトの案内を見てください。
            </p>
            <p>当日に渋谷を回るなら、渋谷を歩く時間と、新宿へ移動する時間を分けて考えておくと安心です。</p>
          </Section>
        )}

        <Section id="shibuya-last" title="最後に">
          <p>渋谷には、Reol にまつわる場所がたくさんあります。</p>
          <p>
            歌詞に出てくる地名。
            <br />
            始まりのタワーレコード。
            <br />
            『エンド』が流れた渋谷MODI。
            <br />
            東の宴の O-EAST。
            <br />
            接続編と音沙汰と美辞学の記憶がある LINE CUBE SHIBUYA。
            <br />
            そして、Reol がふと目を留めたカフェや、器のお店。
          </p>
          <p>
            ライヴの前に、少し早く渋谷へ。
            <br />
            ライヴのあとに、少し遠回り。
            <br />
            翌日に、もう一か所だけ寄り道。
          </p>
          <p>それだけで、遠征が少し特別なものになるかもしれません。</p>
          <p>渋谷は Reol の交差点。</p>
          <p className="pt-2">
            <In to="/place/">← 聖地の一覧(全国の地図)へ</In>
          </p>
        </Section>
      </main>
      <BackToTopButton />
    </>
  );
};

export default ShibuyaGuidePage;

export const Head: HeadFC = () => (
  <SEO
    title={`${TITLE}｜MVのロケ地・ライヴ会場・ゆかりの店`}
    description={`Reol にゆかりのある渋谷の場所を、MV のロケ地、ライヴ会場、歌詞に出てくる地名、本人が訪れた店に分けてまとめたガイド。渋谷駅のまわりの${ROUTE_SPOTS.length}か所の略図と、会場ごとの公演・セットリストへのリンクつき。`}
    path="/place/shibuya/"
    lang="ja"
    jsonLd={buildBreadcrumbList([
      { name: "HOME", path: "/" },
      { name: "PLACE(聖地)", path: "/place/" },
      { name: TITLE, path: "/place/shibuya/" },
    ])}
  />
);
