import React from "react";
import { splitPhrases } from "../../utils/songArticles/format";

/**
 * 日本語の文を句の切れ目でだけ折り返す(文言は変えない)。Safari は word-break: auto-phrase に対応していないため、
 * 句の切れ目に <wbr> を入れ、CSS で word-break: keep-all にする(.sa-phrased)。句が行より長い時だけ句の途中で折れる。
 */
const Phrased: React.FC<{ text: string }> = ({ text }) => (
  <span className="sa-phrased" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>
    {splitPhrases(text).map((p, i) => (
      <React.Fragment key={i}>
        {i > 0 && <wbr />}
        {p}
      </React.Fragment>
    ))}
  </span>
);

export default Phrased;
