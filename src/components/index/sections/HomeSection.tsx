import React from "react";
import { FaExclamation } from "react-icons/fa";
import RecommendList from "../recommend-list";
import { Recommend } from "../../../types/recommend";

interface HomeSectionProps {
  recommend: Recommend[];
}

const HomeSection: React.FC<HomeSectionProps> = ({ recommend }) => {
  return (
    <section id="HOME" style={{ contentVisibility: "auto" }}>
      <h2
        id="RECOMMEND"
        className="font-bold text-lg pt-4 px-2 text-shadow tracking-wider"
      >
        <FaExclamation className="inline text-sm mb-1" />
        <span>Pick Up Post</span>
      </h2>
      <RecommendList data={recommend} />
    </section>
  );
};

export default HomeSection;
