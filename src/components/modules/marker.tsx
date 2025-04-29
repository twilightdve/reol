import React, { Component, PropsWithChildren } from "react";

type Props = {
  options: google.maps.MarkerOptions;
  map?: google.maps.Map;
  visible: boolean;
};

type State = {
  marker: google.maps.Marker | null;
  infoWindow: google.maps.InfoWindow | null;
};

export default class Map extends Component<PropsWithChildren<Props>, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      marker: null,
      infoWindow: new google.maps.InfoWindow({
        content: this.infoWindowContent(),
        maxWidth: 200,
      }),
    };
  }

  infoWindowContent() {
    return `<span>${this.props.options.title}</span>`;
  }

  componentDidMount() {
    if (!this.state.marker && this.props.map) {
      const marker = new google.maps.Marker();
      marker.setMap(this.props?.map);
      marker.setOptions(this.props.options);
      marker.addListener("click", () => {
        if (this.props.map instanceof google.maps.Map) {
          const position = marker.getPosition();
          if (!!position) this.props.map.panTo(position);
        }
        this.state.infoWindow?.open({
          map: this.props.map,
          anchor: marker,
        });
      });
      this.setState({
        ...this.state,
        marker,
        infoWindow: this.state.infoWindow,
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {
    if (this.props.visible) {
      this.state.marker?.setOpacity(1);
    } else {
      this.state.marker?.setOpacity(0);
    }
  }

  render() {
    return null;
  }
}
