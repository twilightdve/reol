import React from "react";
import noteTitle from "../../../images/looks-history/note_title.png";

interface TitlePageProps {
  onLoad: () => void;
}

const TitlePage: React.FC<TitlePageProps> = ({ onLoad }) => {
  return (
    <div id="page-1" className="relative w-full h-full">
      <img
        className="w-full h-full"
        src={noteTitle}
        alt="Note title"
        onLoad={onLoad}
      />
    </div>
  );
};

export default TitlePage;
