import React from "react";
import UtilityService from "../../services/UtilityService";

interface Props {
  href?: string;
  targetBlank?: boolean;
  title: string;
  content: string;
}

const CardItem: React.FC<Props> = ({ href, title, content }) => {
  const renderHTML = (rawHTML: string) =>
    React.createElement("p", {
      dangerouslySetInnerHTML: { __html: UtilityService.sanitizeHTML(rawHTML) },
    });

  const renderCard = () => (
    <div className="flex h-full flex-col justify-start gap-4 p-6">
      <h3 className="text-base font-bold tracking-tight text-gray-900 h-10">
        {renderHTML(title.length > 25 ? `${title.slice(0, 25)}...` : title)}
      </h3>
      <div className="font-normal text-sm sm:text-base text-gray-700 break-all pt-2">
        {renderHTML(
          content.length > 110 ? `${content.slice(0, 110)}...` : content
        )}
      </div>
    </div>
  );

  const classList =
    "flex rounded-lg border border-gray-200 bg-white shadow-md flex-col md:max-w-xl md:flex-row w-64 h-64 sm:w-80 sm:h-72";

  return (
    <li className="sm:w-auto w-64 shrink-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classList}
          onClick={() =>
            UtilityService.gtag({
              category: "click",
              action: "link",
              label: title,
            })
          }
        >
          {renderCard()}
        </a>
      ) : (
        <div className={classList}>{renderCard()}</div>
      )}
    </li>
  );
};

export default CardItem;
