export type Place = {
  placeId: number;
  type: string;
  title: string;
  url: string;
  zoom: number;
  items?: PlaceItem[];
};

export type PlaceItem = {
  placeId: number;
  placeItemId: number;
  name: string;
  memo: string;
  needsCost: boolean;
  needsPermission: boolean;
  placeUrl: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  lat: number;
  lng: number;
  zoom: number;
};
