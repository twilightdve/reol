/**
 * /about/data/ — サイト内の集計ルールを明記するページ
 *
 * TOP・/songs/stats/・/live/heatmap/ 等で表示される数字がページごとに
 * 異なって見える(例: 楽曲数・公演数・演奏回数)ことについて、それぞれの
 * 定義と算出方法を機械的な事実として説明する。値そのものはビルド時に
 * gatsby-node.ts が算出するため、このページでは「何を・どう数えているか」
 * のみを文章で説明する(数値の埋め込みはしない)。
 */
import React from "react";
import { HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { Kicker } from "../../components/redesign";

const containerCls =
  "rounded-lg border border-bx-line bg-bx-surface/5 p-4 sm:p-5";

const AboutDataPage: React.FC = () => {
  return (
    <main className="relative container mx-auto w-full max-w-3xl px-3 sm:px-4 py-6 text-bx-ink space-y-6">
      <section className={containerCls}>
        <Kicker color="text-bx-blue" className="mb-2">
          ABOUT THE DATA
        </Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">
          集計ルールについて
        </h1>
        <p className="text-sm leading-relaxed text-bx-ink2">
          TOPページや各種統計ページに出てくる数字(楽曲数・公演数・演奏回数など)は、
          見る場所によって定義が異なるため単純比較できません。このページでは、
          それぞれの数字が「何を・どう数えているか」を説明します。
        </p>
      </section>

      <section className={containerCls} aria-labelledby="about-data-songs">
        <h2 id="about-data-songs" className="text-lg font-bold text-bx-ink mb-2">
          楽曲数(SONGS)
        </h2>
        <p className="text-sm leading-relaxed text-bx-ink2 mb-2">
          TOPの「SONGS」および <code className="text-bx-ink">/songs/stats/</code> の
          行数は、楽曲マスタを名寄せした後の代表曲の件数です。
        </p>
        <p className="text-sm leading-relaxed text-bx-ink2 mb-2">
          「煽げや尊し(Agitate)」と「煽げや尊し」のように、同じ曲がシングル・
          アルバム収録・ライブ映像等の複数リリースにまたがって別レコードで
          登録されている場合、副題(括弧書き)を除いた曲名でグルーピングし、
          最も古いリリースを代表として1件にまとめています。
          「mede:mede」と「mede:mede -JJJ Remix-」のように括弧書きでない
          別バージョンは、別曲として区別したままです。
        </p>
        <p className="text-sm leading-relaxed text-bx-ink2">
          演奏回数(後述)も、この代表曲単位で合算しています。同じ曲の
          別リリース表記でセットリストに登場した演奏は、すべて代表曲の
          演奏回数としてカウントされます。
        </p>
      </section>

      <section className={containerCls} aria-labelledby="about-data-lives">
        <h2 id="about-data-lives" className="text-lg font-bold text-bx-ink mb-2">
          公演数(LIVES)
        </h2>
        <p className="text-sm leading-relaxed text-bx-ink2 mb-2">
          TOPの「LIVES」は、ツアーやイベントに含まれる個別の公演日(会場×開催日)の
          件数です。<code className="text-bx-ink">/live/</code> の一覧件数は
          ツアー・イベント単位のため、公演数より少なくなります(1つのツアーに
          複数公演が含まれるため)。
        </p>
        <p className="text-sm leading-relaxed text-bx-ink2">
          参戦地マップ(ヒートマップ)の「国内」「海外」「不明/未確定」の内訳は、
          この公演数を会場所在地の判定状況で分類したものです。「不明/未確定」は、
          会場や開催地が特定できていない、または日程・会場が未発表の公演を指します。
        </p>
      </section>

      <section className={containerCls} aria-labelledby="about-data-performances">
        <h2 id="about-data-performances" className="text-lg font-bold text-bx-ink mb-2">
          演奏回数(PERFORMANCES)
        </h2>
        <p className="text-sm leading-relaxed text-bx-ink2 mb-2">
          TOPの「PERFORMANCES」は、全公演のセットリストに登場した楽曲の
          延べ演奏回数です。MC・オープニングSE・幕間映像などの非楽曲項目
          (「-MC-」「-Opening-」等)は演奏回数に含まれません。
        </p>
        <p className="text-sm leading-relaxed text-bx-ink2">
          公演詳細ページの「SETLIST — N曲」も同様に、非楽曲項目を除いた
          実際の楽曲数を表示しています(非楽曲項目がある場合は「MC ◯」のように
          内訳を併記します)。
        </p>
      </section>

      <section className={containerCls} aria-labelledby="about-data-caveats">
        <h2 id="about-data-caveats" className="text-lg font-bold text-bx-ink mb-2">
          その他の注意点
        </h2>
        <ul className="text-sm leading-relaxed text-bx-ink2 list-disc pl-5 space-y-1.5">
          <li>
            開催中止となった公演も、日程・会場情報がある限り公演数に含めています。
          </li>
          <li>
            セットリストの楽曲名がサイト内の楽曲マスタと自動的に一致しない場合、
            その演奏は集計上「未マッチ」として扱われ、楽曲別の演奏回数には
            反映されません。表記ゆれの解消は継続的に行っています。
          </li>
          <li>
            当サイトの集計はあくまで非公式ファンサイトが把握できた範囲の情報に
            基づくものであり、公式発表の数値と一致しない場合があります。
          </li>
        </ul>
      </section>
    </main>
  );
};

export default AboutDataPage;

export const Head: HeadFC = () => (
  <SEO
    title="集計ルールについて"
    description="TOPページや楽曲統計・参戦地マップに表示される楽曲数・公演数・演奏回数の定義と算出方法を説明します。"
    path="/about/data/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "集計ルールについて", path: "/about/data/" },
    ])}
  />
);
