import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DiscographyWithSongs } from "../../types/discography";
import { LiveInfo } from "../../types/live";
import MainVideo from "../modules/mainVideo";
import Opening from "./opening";
import { Recommend } from "../../types/recommend";
import { Place } from "../../types/places";
import TrackingFooter from "../modules/trackingFooter";
import { AppDispatch, RouteState } from "../../redux/store";
import { ROUTE_NAMES } from "../../types/common";
import { setRoute } from "../../redux/slices/routeSlice";
import {
  HomeSection,
  DiscographySection,
  LiveSection,
  PlaceSection,
  PhotosSection,
  TimelineSection,
} from "./sections";

interface IndexContentsProps {
  recommend: Recommend[];
  discographies: DiscographyWithSongs[];
  liveInfos: LiveInfo[];
  places: Place[];
}

const IndexContents: React.FC<IndexContentsProps> = ({
  recommend,
  discographies,
  liveInfos,
  places,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentRoute } = useSelector((state: RouteState) => state.route);

  useEffect(() => {
    if (location.hash.length > 0) {
      dispatch(setRoute({ currentRoute: location.hash.replace("#", "") }));
    }
  }, [dispatch]);

  const renderCurrentContents = (route: string) => {
    switch (route) {
      case ROUTE_NAMES[0]:
        return <HomeSection recommend={recommend} />;
      case ROUTE_NAMES[1]:
        return <DiscographySection discographies={discographies} />;
      case ROUTE_NAMES[2]:
        return <LiveSection liveInfos={liveInfos} />;
      case ROUTE_NAMES[3]:
        return <PlaceSection places={places} />;
      case ROUTE_NAMES[4]:
        return <PhotosSection />;
      case ROUTE_NAMES[5]:
        return <TimelineSection />;
      default:
        return null;
    }
  };

  return (
    <>
      <Opening />
      <MainVideo playlist={discographies.filter((item) => item.xfdUrl)} />
      <main className="relative container mx-auto px-2 w-full">
        {renderCurrentContents(currentRoute)}
      </main>
      <TrackingFooter />
    </>
  );
};

export default IndexContents;
