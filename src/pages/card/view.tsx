/**
 * /card/view/#… — 受け取ったプロフィールカードを見るページ(plan/48)。
 *
 * カードの内容は URL の # の後ろにだけある(サーバーには無い)。
 * - アクセス解析に内容が渡らないよう、このページは GA のページ表示を送らない(gatsby-config の exclude)。
 *   さらに、読んだらすぐ URL から # の後ろを消す(再読み込みに備えて、このタブの sessionStorage にだけ残す)。
 * - 中身は作った人が入力した、確かめていない文字。codec の sanitizePayload を通し、文字としてだけ出す。
 * - 検索には出さない(noindex)。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { ProfileCardFace } from "../../components/profileCard/ProfileCardFace";
import { CardPayload, decodeCard, encodeCard } from "../../utils/profileCard/codec";
import { useAuth } from "../../contexts/AuthContext";
import { OWNER_USER_ID } from "../../constants/owner";

const SESSION_KEY = "reol-profile-card-view";

const CardViewPage: React.FC = () => {
  // 「カードを作る」の案内は、作れる人(試験中は運営だけ)にだけ出す
  const { user } = useAuth();
  const canCreate = user?.id === OWNER_USER_ID;
  const [state, setState] = useState<{ status: "loading" } | { status: "ok"; payload: CardPayload } | { status: "invalid" }>({ status: "loading" });

  useEffect(() => {
    const hash = window.location.hash;
    let payload: CardPayload | null = null;
    if (hash.length > 1) {
      payload = decodeCard(hash);
      window.history.replaceState(window.history.state, "", window.location.pathname);
      try {
        if (payload) window.sessionStorage.setItem(SESSION_KEY, encodeCard(payload));
      } catch {
        // 保存できなくても表示はできる
      }
    } else {
      try {
        const saved = window.sessionStorage.getItem(SESSION_KEY);
        if (saved) payload = decodeCard(saved);
      } catch {
        payload = null;
      }
    }
    setState(payload ? { status: "ok", payload } : { status: "invalid" });
  }, []);

  return (
    <Layout title="プロフィールカード">
      <main lang="ja" className="container mx-auto max-w-md px-4 py-8 text-bx-ink">
        {state.status === "ok" && (
          <>
            <ProfileCardFace payload={state.payload} linkSns />
            <p className="mt-4 text-[12px] leading-relaxed text-bx-ink3">
              このカードは、作った人が入力した内容をそのまま表示しています。!Legit では内容や本人であることを確かめていません。
            </p>
          </>
        )}
        {state.status === "invalid" && (
          <div className="rounded-2xl border border-bx-line p-6 text-center">
            <p className="text-[15px] font-bold">カードを読み取れませんでした</p>
            <p className="mt-2 text-[13px] leading-relaxed text-bx-ink3">QR コードをもう一度読み取るか、送られたリンクをそのまま開いてください。</p>
          </div>
        )}
        {state.status !== "loading" && canCreate && (
          <div className="mt-8 rounded-2xl border border-bx-line p-5">
            <p className="text-[14px] font-bold">あなたもカードを作る</p>
            <p className="mt-1 text-[13px] leading-relaxed text-bx-ink2">ライヴ会場での自己紹介に。ログインしなくても作れます。</p>
            <Link to="/card/" className="mt-3 inline-block rounded-full bg-bx-blue px-5 py-2 text-[13px] font-extrabold text-bx-bg">
              プロフィールカードを作る
            </Link>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default CardViewPage;

export const Head: HeadFC = () => (
  <>
    <SEO title="プロフィールカード" description="!Legit のプロフィールカード。" path="/card/view/" />
    <meta name="robots" content="noindex,nofollow" />
    {/* カードの内容(# の後ろ)はリンク先に渡らないが、念のため参照元も送らない */}
    <meta name="referrer" content="no-referrer" />
  </>
);
