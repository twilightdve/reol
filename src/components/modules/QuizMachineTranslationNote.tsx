import React from "react";
import { useDict } from "../../i18n/site/SiteLangContext";

/**
 * ファンタイプ診断は独自レイアウトで共通フッターを出さないため、
 * 翻訳版(機械翻訳)の注記と連絡先をページ下に出す(plan/28 第3弾)。日本語版では何も出さない。
 */
const QuizMachineTranslationNote: React.FC = () => {
  const { footer } = useDict();
  if (!footer.mtNotice) return null;
  return (
    <p className="bg-[#0a0a1a] px-4 pb-6 text-center text-[11px] leading-relaxed text-gray-500">
      {footer.mtNotice}{" "}
      <a
        href="https://twitter.com/twilightplc"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-gray-300 transition-colors"
      >
        {footer.mtContact}
      </a>
    </p>
  );
};

export default QuizMachineTranslationNote;
