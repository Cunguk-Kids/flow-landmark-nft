import * as React from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const SandboxMap: React.FC = () => {
  const [viewport, setViewport] = React.useState({
    latitude: -6.2,
    longitude: 106.816666,
    zoom: 13,
  });
  const [location, setLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearby, setNearby] = React.useState<
    { lat: number; lng: number; name: string }[]
  >([]);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setViewport((v) => ({ ...v, latitude, longitude }));

        // Simulasi nearby data
        setNearby([
          { lat: latitude + 0.001, lng: longitude + 0.001, name: "Cafe Latte" },
          { lat: latitude - 0.001, lng: longitude + 0.002, name: "Gym Center" },
          { lat: latitude + 0.002, lng: longitude - 0.001, name: "Book Store" },
        ]);
      },
      (err) => {
        console.error("Location error:", err);
        setLocation({ lat: -6.2, lng: 106.816666 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="h-screen w-full relative">
      <Map
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

        {nearby.map((item, i) => (
          <Marker
            key={i}
            latitude={item.lat}
            longitude={item.lng}
            anchor="bottom"
          >
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
              {item.name}
            </div>
          </Marker>
        ))}
      </Map>

      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-md">
        <button className="text-sm font-medium text-gray-700">
          Find Nearby Places 📍
        </button>
      </div>
    </div>
  );
};

export default SandboxMap;
