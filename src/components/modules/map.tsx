import React, { useRef, useState, useEffect, PropsWithChildren } from "react";

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
}

interface MapComponentProps {
  options: MapProps;
}

const Map: React.FC<PropsWithChildren<MapComponentProps>> = ({
  options,
  children,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {});
      newMap.setOptions(options);
      setMap(newMap);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  return (
    <>
      <div ref={mapRef} style={options.style} />
      {map &&
        React.Children.map(
          children,
          (child) =>
            React.isValidElement(child) &&
            React.cloneElement(child, {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              map: map,
            })
        )}
    </>
  );
};

export default Map;
