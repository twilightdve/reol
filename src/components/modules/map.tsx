import React, {
  Component,
  PropsWithChildren,
  RefObject,
  createRef,
} from "react";

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
}

type Props = {
  options: MapProps;
};

type State = {
  map: google.maps.Map | null;
};

export default class Map extends Component<PropsWithChildren<Props>, State> {
  mapRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
  constructor(props: Props) {
    super(props);
    this.state = {
      map: null,
    };
  }

  componentDidMount() {
    if (this.mapRef && this.mapRef.current && !this.state.map) {
      const map = new window.google.maps.Map(this.mapRef.current, {});
      map.setOptions(this.props.options);
      this.setState({
        ...this.state,
        map,
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, snapshot?: any) {
    this.state.map?.setOptions(this.props.options);
  }

  render() {
    return (
      <>
        <div ref={this.mapRef} style={this.props.options.style} />
        {this.state.map &&
          React.Children.map(
            this.props.children,
            (child) =>
              React.isValidElement(child) &&
              React.cloneElement(child, {
                // @ts-ignore
                map: this.state.map,
              })
          )}
      </>
    );
  }
}
