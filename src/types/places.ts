export type Place = {
  placeUuid: string;
  slug: string;
  type: string;
  title: string;
  url: string;
  zoom: number;
  items?: PlaceItem[];
};

export type PlaceItem = {
  placeItemUuid: string;
  slug: string;
  placeUuid: string;
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
