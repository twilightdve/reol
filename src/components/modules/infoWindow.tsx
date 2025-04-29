import { Component } from "react";

type Props = {
  options: google.maps.InfoWindowOptions;
  // map?: google.maps.Map;
};

type State = {
  window: google.maps.InfoWindow | null;
};

export default class InfoWindow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      window: null,
    };
  }

  componentDidMount() {
    if (!this.state.window) {
      //  && this.props.map
      const infoWindow = new google.maps.InfoWindow();
      // infoWindow.setMap(this.props?.map);
      infoWindow.setOptions(this.props.options);
      this.setState({
        ...this.state,
        window: infoWindow,
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {}

  render() {
    return null;
  }
}
