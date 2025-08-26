import React from "react";
import noteEdge from "../../images/looks-history/note_edge.png";

interface NoteBackgroundProps {
  page: number;
  lineNums: number;
  isFinal?: boolean;
}

const NoteBackground: React.FC<NoteBackgroundProps> = ({
  page,
  lineNums,
  isFinal = false,
}) => {
  return (
    <>
      <div className="absolute w-full h-full bg-[#fcf9ef] border-[3px] border-[#47250B] -z-10" />
      <div className="absolute w-1/3 top-8 right-4 border-b-[1px] border-[#47250B] -z-10" />
      <div className="absolute w-[94%] top-10 border-t-[8px] border-x-2 border-[#47250B] mx-3 -z-10 bg-white">
        <div className="w-full border-b-2 border-[#47250B] mt-1 -z-10" />
        {Array.from({ length: lineNums }).map((_, i, arr): JSX.Element => {
          return (
            <div
              key={`page-${page}-note-line-${i}`}
              className={`w-full -z-10 border-[#47250B] ${
                i + 1 < arr.length ? "border-b-[1px]" : "border-b-[8px]"
              }`}
              style={{
                marginTop: `${15.2 * 2 - 1}px`,
              }}
            />
          );
        })}
      </div>
      {!isFinal && (
        <img className="fixed right-0 bottom-0 w-12" src={noteEdge} alt="Note edge" />
      )}
    </>
  );
};

export default NoteBackground;
