import React from "react";
import { FaRegNewspaper } from "react-icons/fa6";
import Photography from "../photography/photography";
import { posts } from "../photography/posts";
import { usePageDict } from "../../../i18n/site/SiteLangContext";
import { photosDict } from "../../../i18n/site/pages/photos";

const PhotosSection: React.FC = () => {
  const t = usePageDict(photosDict);
  return (
    <section id="PHOTOS" style={{ contentVisibility: "auto" }} className="bg-bx-surface/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      <h2 className="font-bold text-lg pt-4 px-2 text-bx-ink">
        <FaRegNewspaper className="inline text-sm mr-2" />
        <span>PHOTOGRAPHY</span>
      </h2>
      <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
        {t.intro}
        <br />
      </div>
      <Photography posts={posts} />
    </section>
  );
};

export default PhotosSection;
