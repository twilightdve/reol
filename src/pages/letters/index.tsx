/**
 * /letters/ — 件名のないふくろう便(Reol 誕生日の手紙企画。plan/64)の説明。
 * 入口(Happy Birthday, Reol)→ 企画のこと → 一冊にして贈ること。手紙を書くのは /letters/write/(「お祝いの手紙を書く」から)。
 */
import React from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { LETTERS_COPY, LETTERS_ORGANIZER, LETTERS_SHIPPING_NOTE } from "../../utils/letters/constants";

const LettersPage: React.FC = () => (
  <LettersShell current="about" dock>
    <section className="lp-hero">
      <div className="lp-greeting">
        <p className="lp-kicker">
          <b>2026.11.09</b> &nbsp; / &nbsp; {LETTERS_ORGANIZER}
        </p>
        <h1 className="lp-birthday">
          <span className="wish">Happy Birthday,</span>
          <span className="artist">Reol</span>
        </h1>
      </div>
      <div className="lp-art" role="img" aria-label="三つの時代へ宛てた、お祝いのカードのデザイン見本">
        <div className="lp-confetti" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="lp-gift left" aria-hidden>
          <span className="gl">A LETTER TO YOU</span>
          <div className="ga">
            <small>あの日のあなたへ</small>エンドレスラインの
            <br />
            REOLへ
          </div>
          <div className="gd" />
          <span className="gf">DESIGN SAMPLE</span>
        </div>
        <div className="lp-gift right" aria-hidden>
          <span className="gl">A LETTER TO YOU</span>
          <div className="ga">
            <small>あの日のあなたへ</small>白夜の
            <br />
            Reolへ
          </div>
          <div className="gd" />
          <span className="gf">DESIGN SAMPLE</span>
        </div>
        <div className="lp-gift center" aria-hidden>
          <span className="gl">
            FOR YOUR
            <br />
            BIRTHDAY
          </span>
          <div className="lp-stamp">
            <span>MATSUMOTO</span>
            <svg viewBox="0 0 60 40" aria-hidden>
              <path d="M0 34 11 20 17 26 29 8 41 24 48 16 60 34M17 26 29 8 35 21 29 18 25 24" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0 36H60" stroke="currentColor" />
              <circle cx="47" cy="8" r="3" fill="currentColor" />
            </svg>
            <strong>11.09</strong>
          </div>
          <div className="ga">
            <small>あの日のあなたへ</small>極彩色の
            <br />
            れをる様へ
          </div>
          <span className="gf">DESIGN SAMPLE</span>
        </div>
        <div className="lp-ribbon" aria-hidden>
          WITH LOVE, FROM ALL OF US
        </div>
        <div className="lp-art-caption" aria-hidden>
          カードのデザイン見本
        </div>
      </div>
      <div className="lp-project">
        <h2>
          <span className="small">件名のない</span>
          <span>ふくろう便</span>
        </h2>
        <p className="lp-tagline">{LETTERS_COPY}</p>
      </div>
      <div className="lp-actions">
        <p className="lp-deadline">
          <span>メッセージ受付締切 · 2026年</span>
          <strong>
            <time dateTime="2026-12-20T23:59:59+09:00">12月20日（日）23:59まで</time>
          </strong>
          <small>日本時間</small>
        </p>
        <Link className="lp-primary" to="/letters/write/">
          お祝いの手紙を書く <span aria-hidden>↗</span>
        </Link>
        <Link className="lp-text-link" to="/letters/read/">
          届いた手紙を読む
        </Link>
      </div>
      <p className="lp-hero-intro">
        <span>好きな曲、忘れられないライヴ。</span>
        <span>あの頃のれをるへ、今日の「おめでとう」を。</span>
      </p>
    </section>

    <div className="lp-bridge">
      <div className="lp-bridge-label">今度は、私たちから。</div>
      <p>
        たくさんの音楽と思い出を届けてくれたReolへ、ファンからの返事を。
        <br />
        昔からでも、最近でも。あなたが音楽を受け取った、その日から参加できます。
      </p>
      <div className="lp-route">
        <span>あの日の思い</span>
        <i />
        <b>今日の手紙</b>
      </div>
    </div>

    <section className="lp-book">
      <div className="lp-book-pic" aria-hidden>
        <div className="lp-leaf">
          <div>
            白夜の
            <br />
            Reolへ<small>FROM A LISTENER<br />2026.11.09</small>
          </div>
        </div>
        <div className="lp-leaf second">
          <div>
            エンドレスラインの
            <br />
            REOLへ<small>FROM A LISTENER<br />2026.11.09</small>
          </div>
        </div>
      </div>
      <div>
        <div className="lp-eyebrow">FROM US, TO YOU</div>
        <h2>おめでとうを、一冊に。</h2>
        <p>
          11月9日のお祝いに、いろんな時代へ宛てた言葉を。一枚ずつ印刷して、ファンレターブックとしてReolへ贈ります。
          Webでのお祝いの先にも、手に取れるかたちで残せるように。
        </p>
        <p className="ship">
          届いたメッセージから順に内容を確認・印刷し、締切後に一冊にまとめて、<strong>年内の発送</strong>を目指します。
        </p>
        <div className="lp-book-actions">
          <Link className="lp-primary" to="/letters/write/">
            お祝いの手紙を書く <span aria-hidden>↗</span>
          </Link>
          <Link className="lp-text-link" to="/letters/edit/">
            書いた手紙を直す・取り下げる
          </Link>
        </div>
      </div>
    </section>
  </LettersShell>
);

export default LettersPage;

export const Head: HeadFC = () => (
  <LettersHead
    description={`Reolの誕生日に、活動の年表から好きな曲・ライヴ・時代へ宛てて手紙を。カードを一冊にまとめて贈ります。${LETTERS_SHIPPING_NOTE}`}
    path="/letters/"
  />
);
