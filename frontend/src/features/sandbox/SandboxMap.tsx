import * as React from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { store } from "@/stores";

async function getCurrentLocation() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

const SandboxMap: React.FC = () => {
  const viewport = useStore(store, (x) => x.mapViewState);
  const setViewport = React.useCallback(
    (viewp: typeof viewport) =>
      store.setState((prev) => ({
        ...prev,
        mapViewState: viewp,
      })),
    []
  );

  const { data: position } = useQuery({
    queryKey: ["geolocation"],
    queryFn: getCurrentLocation,
    retry: false,
  });

  return (
    <div className="col-[1/-1] row-[1/-1] relative -z-1">
      <Map
        mapLib={maplibregl}
        initialViewState={viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        {position && (
          <Marker
            latitude={position?.coords.latitude}
            longitude={position?.coords.longitude}
            anchor="bottom"
          >
            <div className="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg" />
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default SandboxMap;
