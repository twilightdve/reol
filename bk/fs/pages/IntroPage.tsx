import React from "react";
import NoteBackground from "../components/NoteBackground";
import costumeTitle from "../../../images/looks-history/costume_title.png";

interface IntroPageProps {
  lineNums: number;
}

const IntroPage: React.FC<IntroPageProps> = ({ lineNums }) => {
  return (
    <div id="page-2" className="relative w-full h-full">
      <NoteBackground page={2} lineNums={lineNums} />
      <div className="absolute w-full top-[3.4rem]">
        <div className="text-center text-[0.95rem] leading-[1.9rem] tracking-wider">
          <br />
          10周年おめでとうございます。
          <br />
          親愛なるあなたへ愛をこめて
        </div>
      </div>
      <img
        className="absolute w-5/6 mx-auto left-0 right-0 bottom-2"
        src={costumeTitle}
        alt="Costume title"
      />
    </div>
  );
};

export default IntroPage;
