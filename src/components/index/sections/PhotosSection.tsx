import React from "react";
import { FaRegNewspaper } from "react-icons/fa6";
import Photography from "../photography/photography";
import { posts } from "../photography/posts";

const PhotosSection: React.FC = () => {
  return (
    <section id="PHOTOS" style={{ contentVisibility: "auto" }} className="bg-white/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      <h2 className="font-bold text-lg pt-4 px-2 text-bx-ink">
        <FaRegNewspaper className="inline text-sm mr-2" />
        <span>PHOTOGRAPHY</span>
      </h2>
      <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
        PHOTOGRAPHYではこれまで私が参加したライヴやイベント、Reol関連の聖地巡礼で撮影した写真や動画を掲載しています。
        <br />
      </div>
      <Photography posts={posts} />
    </section>
  );
};

export default PhotosSection;
