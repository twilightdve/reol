import React from "react";
import NoteBackground from "../components/NoteBackground";
import costumeHighFidelity from "../../../images/looks-history/costume_high_fidelity.png";

interface HistoryPageProps {
  page: number;
  lineNums: number;
  events: Array<{
    date: string;
    title: string;
    className?: string;
  }>;
  costumeImage: string;
  costumeAlt: string;
  costumeClassName?: string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  page,
  lineNums,
  events,
  costumeImage,
  costumeAlt,
  costumeClassName = "absolute bottom-10 right-2 w-2/3",
}) => {
  return (
    <div id={`page-${page}`} className="relative w-full h-full overflow-hidden">
      <NoteBackground page={page} lineNums={lineNums} />
      <div className="absolute w-full top-[3.4rem]">
        <div className="ml-6 text-left text-[0.95rem] leading-[1.9rem] tracking-wider">
          {events.map((event, index) => (
            <p key={index} className={event.className || ""}>
              {event.date}
              <br />
              {event.title}
            </p>
          ))}
        </div>
      </div>
      <img
        className={costumeClassName}
        src={costumeImage}
        alt={costumeAlt}
      />
    </div>
  );
};

export default HistoryPage;
