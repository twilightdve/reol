import React from "react";

/**
 * 開ける行の印。閉じている時は「＋」、開いている時は「−」(縦の線が縮む)。
 * 「→」(ページへ移る)と区別するため、矢印の形は使わない(2026-11-14 ユーザー「^ をなくして別の形で」)
 */
const ExpandMark: React.FC<{ open: boolean }> = ({ open }) => (
  <span aria-hidden="true" className="relative block h-3 w-3 flex-shrink-0">
    <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
    <span
      className={`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current transition-transform duration-200 ${
        open ? "scale-y-0" : ""
      }`}
    />
  </span>
);

export default ExpandMark;
