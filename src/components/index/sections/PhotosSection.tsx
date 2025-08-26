import React from "react";
import { FaRegNewspaper } from "react-icons/fa6";
import Photography from "../photography/photography";
import { posts } from "../photography/posts";

const PhotosSection: React.FC = () => {
  return (
    <section id="PHOTOS" style={{ contentVisibility: "auto" }}>
      <h2 className="font-bold text-lg pt-4 px-2 text-shadow">
        <FaRegNewspaper className="inline text-sm mr-2" />
        <span>PHOTOGRAPHY</span>
      </h2>
      <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
        PHOTOGRAPHYではこれまで私が参加したライヴやイベント、Reol関連の聖地巡礼で撮影した写真や動画を掲載しています。
        <br />
      </div>
      <Photography posts={posts} />
    </section>
  );
};

export default PhotosSection;
