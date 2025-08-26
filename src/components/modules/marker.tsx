import React, { useEffect, useState, useCallback } from "react";

interface MarkerProps {
  options: google.maps.MarkerOptions;
  map?: google.maps.Map;
  visible: boolean;
}

const Marker: React.FC<MarkerProps> = ({ options, map, visible }) => {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  const infoWindowContent = useCallback(() => {
    return `<span>${options.title}</span>`;
  }, [options.title]);

  useEffect(() => {
    if (!marker && map) {
      const newInfoWindow = new google.maps.InfoWindow({
        content: infoWindowContent(),
        maxWidth: 200,
      });
      setInfoWindow(newInfoWindow);

      const newMarker = new google.maps.Marker();
      newMarker.setMap(map);
      newMarker.setOptions(options);
      newMarker.addListener("click", () => {
        if (map instanceof google.maps.Map) {
          const position = newMarker.getPosition();
          if (position) map.panTo(position);
        }
        newInfoWindow.open({
          map: map,
          anchor: newMarker,
        });
      });
      setMarker(newMarker);
    }
  }, [marker, map, options, infoWindowContent]);

  useEffect(() => {
    if (marker) {
      marker.setOpacity(visible ? 1 : 0);
    }
  }, [marker, visible]);

  return null;
};

export default Marker;
