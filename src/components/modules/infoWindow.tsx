import { useEffect, useState } from "react";

interface InfoWindowProps {
  options: google.maps.InfoWindowOptions;
  // map?: google.maps.Map;
}

const InfoWindow: React.FC<InfoWindowProps> = ({ options }) => {
  const [window, setWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!window) {
      //  && props.map
      const infoWindow = new google.maps.InfoWindow();
      // infoWindow.setMap(props?.map);
      infoWindow.setOptions(options);
      setWindow(infoWindow);
    }
  }, [window, options]);

  return null;
};

export default InfoWindow;
