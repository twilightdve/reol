/**
 * /live/guide/ — ライヴ参戦ガイド
 *
 * 元は美辞学ツアー特設ページ(bijigaku-navi)向けに書かれたコラム
 * 「Reolライヴ はじめてガイド」「遠征プランニングガイド」の内容から、
 * 特定ツアーに依存しない部分(持ち物・マナー・遠征のコツ等)を移植・再編集したもの。
 * ツアー固有の日程・都市別プランはツアー終了後に意味を持たなくなるため含めない。
 */
import React from "react";
import { HeadFC, Link } from "gatsby";
import SEO from "../../components/SEO";
import { buildBreadcrumbList, buildFaqPage } from "../../utils/jsonLd";
import { Kicker } from "../../components/redesign";
import { trackEvent } from "../../utils/analytics";

const containerCls =
  "bg-bx-surface/5 border border-bx-line rounded-xl p-4 sm:p-6";
const h2Cls = "text-xl font-bold text-bx-ink mb-3";
const h3Cls = "text-sm font-bold text-bx-ink mt-4 mb-1.5";
const pCls = "text-sm leading-relaxed text-bx-ink2";
const ulCls = "list-disc pl-5 space-y-1 text-sm leading-relaxed text-bx-ink2";
const subUlCls = "list-disc pl-5 space-y-0.5 text-xs text-bx-ink3 mt-0.5";

const LiveGuidePage: React.FC = () => {
  return (
    <main className="relative container mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 text-bx-ink space-y-6">
      {/* ヒーロー */}
      <section className={containerCls}>
        <Kicker color="text-bx-blue" className="mb-2">
          LIVE GUIDE
        </Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">
          ライヴ参戦ガイド
        </h1>
        <p className={pCls}>
          「Reolのライヴがはじめて」という方も多いのではないでしょうか。ここでは、Reolのライヴに行く前に知っておきたい情報をまとめました。もちろん、ライヴの楽しみ方は十人十色なので、この記事はあくまで参考程度に読んでもらえると嬉しいです。
        </p>
      </section>

      {/* 持ち物チェックリスト */}
      <section className={containerCls}>
        <h2 className={h2Cls}>ライヴには何を持っていけばいいですか？</h2>

        <h3 className={h3Cls}>必須</h3>
        <ul className={ulCls}>
          <li>
            🎫 チケット
            <ul className={subUlCls}>
              <li>電子チケットのためスマホの充電を温存しておこう</li>
            </ul>
          </li>
          <li>
            💰 現金
            <ul className={subUlCls}>
              <li>ドリンクチケット用。入場時に600円程度必要な場合が多い</li>
              <li>キャッシュレスに対応していない会場もあるため事前に確認しておこう</li>
            </ul>
          </li>
          <li>
            💧 飲み物
            <ul className={subUlCls}>
              <li>入場時に引き換えるドリンクチケットとドリンクを交換できる</li>
              <li>叫んだり汗をかくと喉が渇くので必須</li>
              <li>とにかく前に行きたい人は事前に飲み物を買っておいて、ライヴ終わりに引き換えるのがおすすめ</li>
            </ul>
          </li>
        </ul>

        <h3 className={h3Cls}>あると便利</h3>
        <ul className={ulCls}>
          <li>
            🔒 小さめバッグ
            <ul className={subUlCls}>
              <li>邪魔にならないサイズのもの</li>
            </ul>
          </li>
          <li>
            🎤 タオル
            <ul className={subUlCls}>
              <li>汗拭き用。Reolのライヴはエクササイズくらい熱くなる</li>
            </ul>
          </li>
          <li>
            👂 耳栓
            <ul className={subUlCls}>
              <li>ライヴ用イヤープロテクターがおすすめ</li>
              <li>音響外傷で難聴になることがあるので、心配な人には推奨</li>
            </ul>
          </li>
          <li>
            👟 履き慣れたスニーカー
            <ul className={subUlCls}>
              <li>スタンディングの場合は特に重要</li>
            </ul>
          </li>
        </ul>

        <h3 className={h3Cls}>不要</h3>
        <ul className={ulCls}>
          <li>
            🧳 大きなバッグ
            <ul className={subUlCls}>
              <li>ロッカーに入らない、周囲の人の迷惑になるのでホテルに置いてこよう</li>
            </ul>
          </li>
          <li>
            🔋 モバイルバッテリー
            <ul className={subUlCls}>
              <li>静かに見る人ならあっても良いが、飛ぶには重すぎるのでロッカーに入れておこう</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* 服装のポイント */}
      <section className={containerCls}>
        <h2 className={h2Cls}>ライヴにはどんな服装で行けばいいですか？</h2>
        <p className={pCls + " mb-2"}>
          スタンディングの場合は動きやすい服装が基本。ホール公演ではもう少しラフでも大丈夫ですが、いずれにしても以下がポイントです。
        </p>
        <ul className={ulCls}>
          <li>
            厚底・ヒールの高い靴は避ける
            <ul className={subUlCls}>
              <li>周囲の方への配慮+自分の安全のため</li>
              <li>身長が低い方は、厚底もありだが怪我などには注意</li>
            </ul>
          </li>
          <li>大きなアクセサリー・帽子は外す(後ろの方が見えなくなります)</li>
          <li>会場内は暑くなることが多い(脱ぎ着しやすい重ね着が◎)</li>
          <li>荷物はコインロッカーに預けて身軽に(大きな荷物はスタッフから注意されることも)</li>
        </ul>
      </section>

      {/* スタンディングの立ち位置 */}
      <section className={containerCls}>
        <h2 className={h2Cls}>スタンディングではどこに立てばいいですか？</h2>
        <p className={pCls + " mb-3"}>
          スタンディングの場合、チケットの整理番号順に入場した後は立ち位置を自分の好みで決められるため、どこで見るかで体験が大きく変わります。会場によっては大きな柱などがあり見えにくい場所や音が届きにくい場所があることもあるので、事前に会場レイアウトを確認しておくと安心です。
        </p>
        <ul className={ulCls}>
          <li>
            <span className="font-semibold text-bx-ink">前方中央エリア</span>
            <ul className={subUlCls}>
              <li>アーティストとの距離が近く臨場感が抜群。表情や細かい演出も見たい方におすすめ</li>
              <li>人が密集しやすく、押されたり揉まれたりすることがある。体力に自信がある人向け</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-bx-ink">中間〜後方エリア</span>
            <ul className={subUlCls}>
              <li>比較的ゆったり楽しめる。ステージ全体の演出や照明を見渡せる</li>
              <li>初めてのライヴにはおすすめ</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-bx-ink">左右のエリア</span>
            <ul className={subUlCls}>
              <li>比較的空いていて整理番号が遅くても前方に行きやすい</li>
              <li>角度によってはステージが見えにくいことも。スピーカー近くは音量に注意</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-bx-ink">(ある場合)2F席</span>
            <ul className={subUlCls}>
              <li>視界が広く、ステージ全体を見渡せる。音響のバランスが良いことが多い</li>
              <li>スタンディングエリアより距離があるため、表情や細かい演出は見えにくいことも</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* 会場への到着時間 */}
      <section className={containerCls}>
        <h2 className={h2Cls}>会場にはいつ到着すればいいですか？</h2>
        <p className={pCls + " mb-2"}>
          チケットには「開場」と「開演」の2つの時間が書かれています。「開場」は会場に入れる時間、「開演」はライヴが始まる時間です。
        </p>
        <ul className={ulCls}>
          <li>整理番号順の入場(スタンディング)の場合: 開場30分前には会場周辺にいると安心</li>
          <li>指定席の場合: 開場時間に合わせればOK</li>
          <li>グッズ購入をしたい場合: 事前に会場ごとのグッズ販売開始時間をチェックし、開始時間前に並ぶのがおすすめ</li>
        </ul>
      </section>

      {/* ライヴ中のマナー */}
      <section className={containerCls}>
        <h2 className={h2Cls}>ライヴ中に気をつけることはありますか？</h2>
        <ul className={ulCls}>
          <li>📱 撮影・録音は禁止(公式アナウンスがある場合を除く)</li>
          <li>🗣 MC中や静かなパートでは周囲に配慮</li>
          <li>
            🎶 アーティストから煽られた場合以外、日本では一緒に歌うのは周囲の迷惑になりがち
            <ul className={subUlCls}>
              <li>国によっては一緒に歌う文化もあるので、郷に従おう</li>
            </ul>
          </li>
          <li>🙋 モッシュ・ダイブは原則禁止</li>
          <li>🎒 大きな荷物は必ずロッカーへ</li>
          <li>🤝 周囲のファンと協力して楽しい空間を作ろう</li>
        </ul>
      </section>

      {/* ライヴの楽しみ方 */}
      <section className={containerCls}>
        <h2 className={h2Cls}>ライヴはどうやって楽しめばいいですか？</h2>
        <p className={pCls + " mb-2"}>
          楽しみ方は人それぞれ。自分のペースで、好きなように楽しむのが一番です。以下は一例ですが、参考にしてみてください。
        </p>
        <ul className={ulCls}>
          <li>💡 迷惑にならない限りは、自分の好きなスタイルで楽しむのが一番!(無理して合わせる必要はありません)</li>
          <li>🎤 アーティストとの一体感を楽しむ</li>
          <li>🎶 演出や照明、音響を堪能する</li>
          <li>🕺 周りのファンと一緒に盛り上がる</li>
          <li>📸 (撮影可能の場合)グッズや会場の雰囲気を写真に収める</li>
        </ul>
      </section>

      {/* 終演後の過ごし方 */}
      <section className={containerCls}>
        <h2 className={h2Cls}>ライヴが終わった後はどう過ごせばいいですか？</h2>
        <p className={pCls}>
          余韻に浸りながら、近くのお店で感想を語り合うのも楽しみのひとつ。お店によってはライヴ帰りのファンで混雑することもあるので、事前に予約しておくと安心です。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-bx-ink3 border-l-2 border-bx-yellow pl-3">
          ❗️ ライヴ後に耳鳴りや耳の違和感が続く場合は、早めに耳鼻科を受診しましょう。音響外傷は早期治療が大切です。心配な方は、上記の「あると便利」で紹介したライヴ用イヤープロテクターの使用をおすすめします。(最悪の場合は聴力を失うこともありますのでなるべく早く受診してください)
        </p>
      </section>

      {/* 遠征のコツ */}
      <section className={containerCls}>
        <h2 className={h2Cls}>遠征のコツはありますか？</h2>
        <p className={pCls + " mb-2"}>
          複数公演への参戦や遠方の公演に参戦する場合の、移動手段・予算・スケジュールの考え方です。
        </p>

        <h3 className={h3Cls}>移動手段の選び方</h3>
        <p className={pCls + " mb-1"}>遠征の移動手段は距離と予算で使い分けましょう。</p>
        <ul className={ulCls}>
          <li>
            ✈️ 飛行機
            <ul className={subUlCls}>
              <li>沖縄・北海道・九州など遠方エリアの移動でおすすめ</li>
              <li>早割で予約すれば片道1万円以下も。LCCは成田・関空発着が中心</li>
              <li>空港から会場までの移動時間も計算に入れること</li>
            </ul>
          </li>
          <li>
            🚄 新幹線
            <ul className={subUlCls}>
              <li>東京・大阪を起点に主要都市へアクセスしやすい</li>
              <li>EX予約やスマートEXで割引あり</li>
              <li>時間の確実性が高く、終演後でも移動しやすい</li>
            </ul>
          </li>
          <li>
            🚌 高速バス
            <ul className={subUlCls}>
              <li>夜行バスなら宿泊費も節約できる(ただしライヴ後の夜行は体力的にハード)</li>
              <li>3列独立シートを選ぶと快適度が段違い</li>
            </ul>
          </li>
          <li>
            🚗 車
            <ul className={subUlCls}>
              <li>グループ遠征なら割り勘で最安になることも</li>
              <li>駐車場は会場によって事前予約が必要な場合があるので確認を</li>
              <li>長距離の場合は高速代+ガソリン代を計算してから判断を</li>
            </ul>
          </li>
        </ul>

        <h3 className={h3Cls}>予算の目安</h3>
        <p className={pCls + " mb-1"}>複数公演に参戦する場合の1公演あたりの目安です(チケット代は別)。</p>
        <ul className={ulCls}>
          <li>日帰り遠征(新幹線圏内): 交通費5,000〜15,000円+食事代2,000〜3,000円 = 合計7,000〜18,000円</li>
          <li>1泊遠征(新幹線 or 飛行機): 交通費10,000〜30,000円+宿泊費5,000〜10,000円+食事代3,000〜5,000円 = 合計18,000〜45,000円</li>
          <li>2泊以上の遠征(連日公演セット): 交通費15,000〜40,000円+宿泊費10,000〜20,000円+食事代5,000〜10,000円 = 合計30,000〜70,000円</li>
        </ul>
        <h3 className={h3Cls}>節約のコツ</h3>
        <ul className={ulCls}>
          <li>早割航空券は発売直後に押さえる</li>
          <li>ホテルの早期予約でビジネスホテルを確保(ツアー発表後はファンで埋まりがち)</li>
          <li>夜行バスは宿泊費と交通費を同時に節約できる裏ワザ</li>
          <li>連日公演のセットで1回の遠征費で2公演楽しめる</li>
        </ul>

        <h3 className={h3Cls}>スケジュールの立て方</h3>
        <p className={pCls + " mb-1"}>日帰りの場合</p>
        <ul className={ulCls}>
          <li>開演3時間前に現地着を目安にする(会場周辺の下見、コインロッカーの確保、食事を済ませる余裕ができる)</li>
          <li>終演後の最終交通手段は必ず事前確認(地方会場は最終電車が早いので要注意)</li>
        </ul>
        <p className={pCls + " mt-3 mb-1"}>宿泊ありの場合</p>
        <ul className={ulCls}>
          <li>会場近くのホテルを取るとコインロッカーが不要になる(チェックイン後に荷物を置いて身軽に会場へ)</li>
          <li>終演後もすぐホテルに戻れるので、地方の終電を気にしなくていい</li>
          <li>翌日に観光を入れるなら、チェックアウト後にコインロッカーを使う</li>
          <li>帰りの交通は昼過ぎの便にしておくとゆとりが持てる</li>
        </ul>
      </section>

      {/* もっと見る */}
      <section className={containerCls}>
        <h2 className={h2Cls}>もっと見る</h2>
        <p className={pCls + " mb-3"}>
          各公演の会場情報(住所・地図)は公演ごとの詳細ページに掲載しています。過去のセットリストや関連ポストもあわせてチェックしてみてください。
        </p>
        <Link
          to="/live/"
          onClick={() => trackEvent("live_guide_link_click", { label: "live_top" })}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
        >
          LIVE一覧を見る →
        </Link>
      </section>
    </main>
  );
};

export default LiveGuidePage;

// FAQPageの質問文はページ上の見出しと一致させている(schema.org/Googleのガイドライン対応)。
// 回答は各セクションの内容を要約したプレーンテキスト。
const faqEntries = [
  {
    question: "ライヴには何を持っていけばいいですか？",
    answer:
      "必須はチケット・現金(ドリンクチケット用に600円程度)・飲み物です。あると便利なものとして小さめバッグ・タオル・耳栓・履き慣れたスニーカーがあります。大きなバッグやモバイルバッテリーはロッカーに預けるか持って行かないことをおすすめします。",
  },
  {
    question: "ライヴにはどんな服装で行けばいいですか？",
    answer:
      "スタンディングの場合は動きやすい服装が基本です。厚底・ヒールの高い靴は避け、大きなアクセサリーや帽子は外し、会場内は暑くなりやすいので脱ぎ着しやすい重ね着がおすすめです。荷物はコインロッカーに預けて身軽にしましょう。",
  },
  {
    question: "スタンディングではどこに立てばいいですか？",
    answer:
      "前方中央エリアは臨場感が高い一方で人が密集しやすく、中間〜後方エリアは比較的ゆったり楽しめて初めてのライヴにもおすすめです。左右のエリアは比較的空いていますが角度によってはステージが見えにくいことがあります。2F席がある会場では視界が広く音響のバランスも良い傾向があります。",
  },
  {
    question: "会場にはいつ到着すればいいですか？",
    answer:
      "整理番号順の入場(スタンディング)の場合は開場30分前には会場周辺にいると安心です。指定席の場合は開場時間に合わせればOKです。グッズ購入をしたい場合は会場ごとの販売開始時間を事前にチェックしましょう。",
  },
  {
    question: "ライヴ中に気をつけることはありますか？",
    answer:
      "撮影・録音は公式アナウンスがある場合を除き禁止です。MC中や静かなパートでは周囲に配慮し、モッシュ・ダイブは原則禁止です。大きな荷物は必ずロッカーに預け、周囲のファンと協力して楽しい空間を作りましょう。",
  },
  {
    question: "ライヴはどうやって楽しめばいいですか？",
    answer:
      "楽しみ方は人それぞれです。迷惑にならない範囲で自分の好きなスタイルで楽しむのが一番で、アーティストとの一体感、演出や照明・音響、周りのファンとの一体感などを楽しむのがおすすめです。",
  },
  {
    question: "ライヴが終わった後はどう過ごせばいいですか？",
    answer:
      "余韻に浸りながら近くのお店で感想を語り合うのも楽しみのひとつです。混雑することもあるので事前予約がおすすめです。耳鳴りや耳の違和感が続く場合は早めに耳鼻科を受診してください。",
  },
  {
    question: "遠征のコツはありますか？",
    answer:
      "移動手段は距離と予算で使い分けます(飛行機・新幹線・高速バス・車)。日帰り遠征は7,000〜18,000円、1泊遠征は18,000〜45,000円が目安です。早割航空券やホテルの早期予約、夜行バスの活用、連日公演のセット参戦が節約のコツです。",
  },
];

export const Head: HeadFC = () => (
  <SEO
    title="ライヴ参戦ガイド"
    description="Reolのライヴに初めて参加する方向けの持ち物・服装・マナーガイドと、遠征の移動手段・予算・スケジュールの立て方をまとめました。"
    path="/live/guide/"
    jsonLd={[
      buildBreadcrumbList([
        { name: "ホーム", path: "/" },
        { name: "LIVE", path: "/live/" },
        { name: "ライヴ参戦ガイド", path: "/live/guide/" },
      ]),
      buildFaqPage(faqEntries),
    ]}
  />
);
