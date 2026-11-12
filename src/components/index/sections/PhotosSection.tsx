import React from "react";
import Photography from "../photography/photography";
import { posts } from "../photography/posts";
import { usePageDict } from "../../../i18n/site/SiteLangContext";
import { photosDict } from "../../../i18n/site/pages/photos";

const PhotosSection: React.FC = () => {
  const t = usePageDict(photosDict);
  return (
    <section id="PHOTOS" style={{ contentVisibility: "auto" }} className="mx-auto w-full max-w-5xl px-2 sm:px-4 py-8 sm:py-12">
      <h2 className="text-[28px] sm:text-[36px] font-extrabold leading-tight tracking-[0.04em] text-bx-ink">PHOTOGRAPHY</h2>
      <div className="mt-3 max-w-2xl break-words text-[14px] sm:text-[15px] leading-[1.9] text-bx-ink2">{t.intro}</div>
      <Photography posts={posts} />
    </section>
  );
};

export default PhotosSection;
