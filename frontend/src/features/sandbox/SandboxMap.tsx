import * as React from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { store } from "@/stores";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventList } from "@/hooks/useEventList";
import { EventCategoryIcon, EventMarkerContent } from "./EventMarkerContent";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const { data: eventList } = useEventList();

  const handleCenterToUser = () => {
    if (!position?.coords) return;
    store.state.ref?.getMap().flyTo({
      center: [position?.coords.longitude, position?.coords.latitude],
      zoom: 15,
      essential: true,
    });
  };

  return (
    <div className="col-span-full row-span-full relative -z-1">
      <Map
        ref={(ref) => {
          store.state.ref = ref;
        }}
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
        {eventList?.map((event) => (
          <Marker
            key={event.id}
            latitude={event.latitude}
            longitude={event.longitude}
            anchor="bottom"
          >
            <Popover>
              <PopoverContent>
                <EventMarkerContent event={event} />
              </PopoverContent>
              <PopoverTrigger asChild>
                <Button
                  className="cursor-pointer rounded-full"
                  title={event.title}
                  variant="outline"
                  size="icon"
                >
                  <EventCategoryIcon category={event.category} />
                </Button>
              </PopoverTrigger>
            </Popover>
          </Marker>
        ))}
      </Map>
      {position?.coords && (
        <Button
          onClick={handleCenterToUser}
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg bg-white hover:bg-gray-100 absolute bottom-12 right-2"
        >
          <LocateFixed className="w-8 h-8 text-blue-600" />
        </Button>
      )}
    </div>
  );
};

export default SandboxMap;
