/**
 * /letters/ — 誕生日企画の入口(Happy Birthday, Reol。plan/64)。2026-11-08 に承認された birthday-h.html(handoff)を移したもの。
 * 手紙を書くのは /letters/write/、読むのは /letters/read/(どちらも「件名のないふくろう便」の枠のまま)。
 */
import React from "react";
import { HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { BirthdayLanding } from "../../components/letters/BirthdayLanding";
import { BIRTHDAY_CSS } from "../../components/letters/birthdayStyles";
import { LETTERS_SHIPPING_NOTE } from "../../utils/letters/constants";

const LettersPage: React.FC = () => <BirthdayLanding />;

export default LettersPage;

export const Head: HeadFC = () => (
  <>
    <SEO
      title="Happy Birthday, Reol｜2026"
      description={`Reol、お誕生日おめでとう。この一年のライヴと当時のポストを振り返りながら、この一年の思い出とお祝いの言葉を手紙に。${LETTERS_SHIPPING_NOTE}`}
      path="/letters/"
    />
    <meta name="color-scheme" content="light" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+JP:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600&display=swap"
    />
    <link rel="preload" as="image" href="/letters/oya-stone.jpg" />
    <style>{BIRTHDAY_CSS}</style>
  </>
);
