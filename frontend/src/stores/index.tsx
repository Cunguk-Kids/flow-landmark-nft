import { Store } from "@tanstack/react-store";
import type { ViewState } from "react-map-gl/maplibre";

export const store = new Store({
  mapViewState: {
    latitude: -6.2,
    longitude: 106.816666,
    zoom: 13,
    bearing: 0,
    padding: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
    pitch: 0,
  } as ViewState,
});
