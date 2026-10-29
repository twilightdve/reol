/**
 * /privacy/ — プライバシーポリシー(plan/56)。日本語版だけ(各言語のフッターからここへリンクする)。
 *
 * 書いてあることは、すべてこのサイトのコードと本番での通信の記録で確かめた事実(2026-10-29)。
 * 機能を足したり外部サービスを変えたりした時は、ここも直す。
 * - アクセス解析: gatsby-plugin-google-gtag(GA4)。/card/view/ はページ表示を送らない(gatsby-config.ts)
 * - アカウント: services/authService.ts と supabase/migrations(パスワードは DB 側で bcrypt)。削除は delete_account
 * - 記事のいいね: services/articleLikeService.ts(ブラウザごとの無作為な ID)
 * - 外部の埋め込み: YouTube は押した時だけ読み込む(OfficialMedia)。Spotify・X・地図のタイルは表示時に読み込む
 */
import React from "react";
import { HeadFC, Link } from "gatsby";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { Kicker } from "../components/redesign";

const containerCls = "rounded-lg border border-bx-line bg-bx-surface/5 p-4 sm:p-5";
const linkCls = "text-bx-blue underline underline-offset-2 hover:text-bx-blueLight";

const TITLE = "プライバシーポリシー";
const UPDATED = "2026年10月29日";

const Ext: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>
    {children}
  </a>
);

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section className={containerCls} aria-labelledby={id}>
    <h2 id={id} className="text-lg font-bold text-bx-ink mb-2">
      {title}
    </h2>
    <div className="text-sm leading-relaxed text-bx-ink2 space-y-2">{children}</div>
  </section>
);

const listCls = "list-disc pl-5 space-y-1.5";

const PrivacyPage: React.FC = () => (
  <main className="relative container mx-auto w-full max-w-3xl px-3 sm:px-4 py-6 text-bx-ink space-y-6" lang="ja">
    <section className={containerCls}>
      <Kicker color="text-bx-blue" className="mb-2">
        PRIVACY
      </Kicker>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">{TITLE}</h1>
      <p className="text-sm leading-relaxed text-bx-ink2">
        !Legit(reol.twilightea.com)は、Reolの非公式ファンサイトです。このページでは、サイトを見たり使ったりした時に、どんな情報が、どこに送られ、何に使われるかを説明します。
      </p>
      <p className="mt-2 text-xs text-bx-ink3">最終更新: {UPDATED}</p>
    </section>

    <Section id="privacy-analytics" title="アクセス解析(Google アナリティクス)">
      <p>
        サイトがどう読まれているかを知り、改善するために、Google アナリティクス(GA4)を使っています。ページを開くと、Google
        アナリティクスの Cookie(<code>_ga</code> など)がブラウザに保存され、次のような情報が Google に送られます。
      </p>
      <ul className={listCls}>
        <li>見たページ、来る前のページ、ページ内で押したリンクやボタンなどの操作</li>
        <li>おおまかな地域、使っている端末・ブラウザの種類</li>
      </ul>
      <p>
        個人を特定する情報(名前・メールアドレス・パスワードなど)は送っていません。プロフィールカードを表示するページ(<code>/card/view/</code>)は、URL
        にカードの内容が入るため、ページの表示を送らないようにしています。
      </p>
      <p>
        集めたデータは Google のポリシーに沿って扱われます。詳しくは{" "}
        <Ext href="https://policies.google.com/technologies/partner-sites?hl=ja">Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</Ext>
        をご覧ください。送らないようにしたい場合は、Cookie を拒否する設定にするか、
        <Ext href="https://tools.google.com/dlpage/gaoptout?hl=ja">Google アナリティクス オプトアウト アドオン</Ext>
        を使ってください。
      </p>
      <p>
        運営者は、集計された数(記事の表示回数など)を、自分の Google アカウントで Google アナリティクスから読み出してサイトに載せています。このときに使うのは集計データだけで、訪問者の
        Google アカウントの情報は扱いません。
      </p>
    </Section>

    <Section id="privacy-account" title="アカウント(使う人だけ)">
      <p>
        参戦記録・チェックイン・コメント・セットリスト投票・コレクションなどの機能は、アカウントを作った人だけが使えます。アカウントを作らなくても、サイトは読めます。
      </p>
      <p>アカウントを作ると、次の情報をサイトのデータベース(Supabase)に保存します。</p>
      <ul className={listCls}>
        <li>ユーザー ID、表示名、パスワード(そのままの形ではなく、元に戻せない形に変換して保存します)</li>
        <li>任意で入力したもの(X のアカウントの URL、プロフィールの項目など)</li>
        <li>機能を使って記録・投稿したもの(参戦記録、チェックイン、コメント、投票、コレクションなど)</li>
        <li>ログインしている時に受けた Reol タイプ診断の結果(タイプだけ)。診断ページの、タイプごとの人数の集計にも使います</li>
      </ul>
      <p>
        コメントなど、ほかの人に見える機能に書いたものは、表示名と一緒に公開されます。プロフィールは、公開・非公開を設定画面で切り替えられます。メールアドレスは聞いていません。
      </p>
      <p>
        アカウントは、設定画面からいつでも削除できます。削除すると、プロフィールと、そのアカウントで記録・投稿したもの(参戦記録、チェックイン、コメント、投票、コレクションなど)もあわせて消えます。
      </p>
    </Section>

    <Section id="privacy-likes" title="記事の「いいね」">
      <p>
        読みもの(楽曲記事)の「いいね」は、ログインしなくても押せます。同じ記事に何度も押せないよう、ブラウザごとに無作為な ID
        を作ってブラウザ(localStorage)に保存し、押した記事と一緒にサイトのデータベースに送ります。この ID から個人はわかりません。
      </p>
    </Section>

    <Section id="privacy-local" title="ブラウザに保存するもの">
      <p>
        表示する言語、診断・クイズの回答や結果、地図で選んだ会場、ログインの状態などを、ブラウザ(localStorage)に保存することがあります。これらは次に開いた時に同じ状態から使えるようにするためのもので、上に書いたもの以外はサイトの外に送りません。ブラウザのサイトデータを消すと消えます。
      </p>
    </Section>

    <Section id="privacy-embeds" title="外部サービスの埋め込み">
      <p>ページによっては、次の外部サービスの埋め込みや画像を使っています。それぞれのサービスに、ブラウザから直接接続します。</p>
      <ul className={listCls}>
        <li>
          YouTube: 動画の画像(サムネイル)は表示時に読み込みます。動画そのものは、再生ボタンを押した時だけ読み込みます(youtube-nocookie.com)。
        </li>
        <li>Spotify: 曲のページなどの再生プレーヤーは、表示した時に読み込まれ、Spotify の Cookie が保存されることがあります。</li>
        <li>X(旧Twitter): トップページの投稿の表示は、表示した時に読み込まれ、X の Cookie が保存されることがあります。</li>
        <li>OpenStreetMap: 地図のページでは、地図の画像を OpenStreetMap から読み込みます。</li>
      </ul>
      <p>これらのサービスでの情報の扱いは、各サービスのプライバシーポリシーに従います。</p>
    </Section>

    <Section id="privacy-hosting" title="サイトの置き場所">
      <p>
        サイトは GitHub Pages に置いています。ページを配信する時に、GitHub が接続元の IP アドレスなどを記録することがあります。扱いは GitHub
        のプライバシーポリシーに従います。
      </p>
    </Section>

    <Section id="privacy-contact" title="お問い合わせ・変更">
      <p>
        このページについてのお問い合わせは、運営者の X(<Ext href="https://twitter.com/twilightplc">@twilightplc</Ext>)へお願いします。
      </p>
      <p>サイトの機能や使うサービスが変わった時は、このページを更新します。更新した日は、ページの上に書きます。</p>
      <p>
        <Link to="/" className={linkCls}>
          HOME へ戻る
        </Link>
      </p>
    </Section>
  </main>
);

export default PrivacyPage;

export const Head: HeadFC = () => (
  <SEO
    title={TITLE}
    description="!Legit(Reol非公式ファンサイト)で集める情報と、その使い道(アクセス解析・アカウント・いいね・外部の埋め込み)を説明します。"
    path="/privacy/"
    lang="ja"
    jsonLd={buildBreadcrumbList([
      { name: "HOME", path: "/" },
      { name: TITLE, path: "/privacy/" },
    ])}
  />
);
