import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect, position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export default function LocationPicker({ initialLat = -6.200000, initialLng = 106.816666, onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
  );

  // Update internal position when props change (e.g. from search)
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition(new L.LatLng(initialLat, initialLng));
    }
  }, [initialLat, initialLng]);

  const center: [number, number] = [initialLat || -6.200000, initialLng || 106.816666];

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-rpn-blue/30 relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          position={position}
          setPosition={setPosition}
        />
      </MapContainer>

      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] p-1 rounded z-[1000] font-mono pointer-events-none">
        {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : "Click map to set location"}
      </div>
    </div>
  );
}
