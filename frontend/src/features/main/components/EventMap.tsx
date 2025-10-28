import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FC,
} from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, LocateFixed } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { EventData } from "@/types";
import eventsListDummy from "@/assets/json/events-list.json";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type MarkerWithPopoverProps = {
  item: EventData;
} & ComponentProps<"button">;

const EventMap: FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [viewport, setViewport] = useState({
    latitude: -6.2,
    longitude: 106.816666,
    zoom: 13,
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [eventsList, setEventsList] = useState<EventData[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setViewport((v) => ({ ...v, latitude, longitude }));
        setEventsList(eventsListDummy as EventData[]);
      },
      (err) => {
        console.warn("Location error:", err);
        setLocation({ lat: -6.2, lng: 106.816666 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleCenterToUser = () => {
    if (mapRef.current && location) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  const MarkerWithPopover = forwardRef<
    HTMLButtonElement,
    MarkerWithPopoverProps
  >(({ item, ...props }, ref) => (
    <Marker latitude={item.latitude} longitude={item.longitude} anchor="bottom">
      <Button
        ref={ref}
        className="cursor-pointer bg-red-500! w-4 h-4 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
        title={item.title}
        {...props}
        variant="outline"
        size="icon"
      />
    </Marker>
  ));


  const handleClickDetails = (id: string) => {
    navigate({
      to: `/events/details/${id}`,
    });
  };

  const MarkerPopoverContent: FC<{ item: EventData }> = ({ item }) => {
    return (
      <div className="p-2 flex flex-col gap-3">
        <div className="flex justify-between">
          <Badge>{item.status}</Badge>
          {renderCategory(item.category)}
        </div>
        <div className="flex flex-col">
          <h4 className="font-bold text-xl">{item.title}</h4>
          <p className="text-xs text-gray-600 text-ellipsis">
            by {item.hostBy}
          </p>
        </div>
        <div className="flex items-start text-xs gap-1">
          <div className="self-start flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(item.date, "date")}</span>
          </div>
          <span>•</span>
          <div className="self-end flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(item.date, "time")}</span>
          </div>
        </div>

        <Button className="w-full" onClick={() => handleClickDetails(item.id)}>
          View Detail
        </Button>
      </div>
    );
  };

  return (
    <div className="h-dvh w-full relative">
      <Map
        ref={(instance) => {
          if (instance) mapRef.current = instance.getMap();
        }}
        mapLib={maplibregl}
        initialViewState={viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {location && (
          <Marker
            latitude={location.lat}
            longitude={location.lng}
            anchor="bottom"
          >
            <div className="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg" />
          </Marker>
        )}

        {eventsList.map((item, i) => (
          <Popover key={i}>
            <PopoverTrigger asChild>
              <MarkerWithPopover item={item} />
            </PopoverTrigger>
            <PopoverContent side="top" align="center" className="w-80">
              <MarkerPopoverContent item={item} />
            </PopoverContent>
          </Popover>
        ))}
      </Map>

      <div className="absolute bottom-16 right-4">
        <Button
          onClick={handleCenterToUser}
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg bg-white hover:bg-gray-100"
        >
          <LocateFixed className="w-8 h-8 text-blue-600" />
        </Button>
      </div>
    </div>
  );
};

export default EventMap;
