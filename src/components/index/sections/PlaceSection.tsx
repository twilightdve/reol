import React, { useState, useCallback } from "react";
import { TbMapPinHeart } from "react-icons/tb";
import { GoLinkExternal } from "react-icons/go";
import { Accordion, Badge } from "flowbite-react";
import YouTube from "react-youtube";
import LazyComponent from "../../modules/LazyComponent";
import UtilityService from "../../../services/UtilityService";
import { Place, PlaceItem } from "../../../types/places";

interface PlaceSectionProps {
  places: Place[];
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MarkerInfo extends Place, PlaceItem {
  position: LatLngLiteral;
  visible: boolean;
}

const PlaceSection: React.FC<PlaceSectionProps> = ({ places }) => {
  const calculateCenter = useCallback(
    (items: PlaceItem[] | LatLngLiteral[]): LatLngLiteral => {
      let center: LatLngLiteral = {
        lat: 0,
        lng: 0,
      };
      if (items.length === 1) {
        center = {
          lat: items[0].lat,
          lng: items[0].lng,
        };
      } else if (items.length > 1) {
        center = items.reduce((previous, current) => {
          previous.lat += current.lat;
          previous.lng += current.lng;
          return previous;
        }, center);
        center.lat = center.lat / items.length;
        center.lng = center.lng / items.length;
      }
      return center;
    },
    []
  );

  const initialLatLngList = places
    .map((place) =>
      (place.items ?? []).map((item) => ({
        ...place,
        ...item,
        position: { lat: item.lat, lng: item.lng },
        visible: true,
      }))
    )
    .flat();

  const [state, setState] = useState({
    latLngList: initialLatLngList,
    center: calculateCenter(initialLatLngList),
    zoom: 5,
  });

  const handlePlaceClick = useCallback(
    (place: Place) => {
      if (place.items) {
        const center = calculateCenter(place.items);
        setState((prevState) => ({
          ...prevState,
          latLngList: prevState.latLngList.map((listItem) => ({
            ...listItem,
            visible: listItem.placeId === place.placeId,
          })),
          center,
          zoom: place.zoom,
        }));
      }
    },
    [calculateCenter]
  );

  const getBadgeColor = (type: string) => {
    if (type === "MV") return "warning";
    if (type === "CM") return "purple";
    if (type === "TV") return "pink";
    return "gray";
  };

  return (
    <section id="PLACE" style={{ contentVisibility: "auto" }}>
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-shadow">
          <TbMapPinHeart className="text-lg mr-2" />
          <span className="underline underline-offset-4 decoration-dashed decoration-1">
            PLACE(聖地)
          </span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
          PLACEではReolが過去にMV撮影やTV番組の収録等で訪れたことのあるいわゆる「聖地」の情報を掲載しております。
          <br />
          聖地巡礼の参考情報としてご覧ください（掲載されていない情報があればぜひ教えていただけますと幸いです）。
        </div>
      </div>
      <div>
        <div className="relative container mx-auto w-full bg-white">
          <Accordion collapseAll>
            {places.map((place) => (
              <Accordion.Panel key={`place-${place.placeId}`}>
                <Accordion.Title className="relative text-sm">
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    onClick={() => handlePlaceClick(place)}
                  >
                    <div className="flex items-center tracking-widest w-full h-full pl-2">
                      {place.type && (
                        <Badge
                          color={getBadgeColor(place.type)}
                          className="py-1"
                        >
                          {place.type}
                        </Badge>
                      )}
                      <span className="ml-2">{place.title}</span>
                    </div>
                  </div>
                </Accordion.Title>
                <Accordion.Content
                  theme={{
                    base: "last:rounded-b-lg first:rounded-t-lg",
                  }}
                >
                  {place.url && place.url.indexOf("youtu.be") && (
                    <LazyComponent>
                      <YouTube
                        videoId={place.url.replace("https://youtu.be/", "")}
                        opts={{
                          height: "180",
                          width: "320",
                          playerVars: {
                            autoplay: 0,
                            enablejsapi: 1,
                            playsinline: 1,
                            loop: 1,
                            rel: 0,
                            color: "white",
                          },
                        }}
                        className="pb-3"
                        iframeClassName="w-full h-48"
                      />
                    </LazyComponent>
                  )}
                  {place.items?.map((item) => (
                    <div
                      key={`place-${item.placeId}-${item.placeItemId}`}
                      className="pb-5"
                    >
                      {item.placeUrl ? (
                        <a
                          href={item.placeUrl}
                          className="w-full h-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <h3 className="flex items-center text-sm mb-2 p-2 bg-theme text-white font-bold rounded-sm tracking-widest">
                            {item.placeItemId}.&nbsp;{item.name}
                            <GoLinkExternal className="ml-1 text-xs sm:text-sm" />
                          </h3>
                        </a>
                      ) : (
                        <h3 className="text-sm mb-2 px-2 py-1 bg-theme text-white font-bold rounded-sm">
                          {item.placeItemId}.&nbsp;{item.name}
                        </h3>
                      )}
                      {item.memo && (
                        <p
                          className="text-sm pl-2 pb-2"
                          dangerouslySetInnerHTML={{
                            __html: UtilityService.sanitizeHTML(item.memo),
                          }}
                        />
                      )}
                      <iframe
                        src={item.mapsEmbedUrl}
                        className="w-full h-48 pointer-events-none"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map for ${item.name}`}
                      />
                      <p className="text-xs py-1">{item.address}</p>
                    </div>
                  ))}
                </Accordion.Content>
              </Accordion.Panel>
            ))}
          </Accordion>
          <p className="text-xs py-2">
            ※ここに載っていない聖地情報いつでもお待ちしております
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlaceSection;
