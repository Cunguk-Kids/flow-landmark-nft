import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { MapPin, Ruler } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';

interface MapZoomInfoProps {
  mapRef: MapRef | null;
}

export default function MapZoomInfo({ mapRef }: MapZoomInfoProps) {
  const [zoom, setZoom] = useState(5);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const handleZoom = useCallback(() => {
    if (!mapRef) return;
    const currentZoom = mapRef.getZoom();
    if (Math.abs(currentZoom - zoomRef.current) > 0.05) {
      setZoom(Number(currentZoom.toFixed(2)));
    }
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef?.getMap?.();
    if (!map) return;

    map.on('zoom', handleZoom);
    setZoom(Number(map.getZoom().toFixed(2)));

    return () => {
      map.off('zoom', handleZoom);
    };
  }, [mapRef, handleZoom]);

  const [radiusKm, setRadiusKm] = useState(0);
  useEffect(() => {
    const newRadius = Math.max(0.05, 20000 / Math.pow(2, zoom));
    const animation = requestAnimationFrame(() => {
      setRadiusKm((prev) => prev + (newRadius - prev) * 0.2);
    });
    return () => cancelAnimationFrame(animation);
  }, [zoom]);

  const altitudeKm = (radiusKm * 1.2).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}>
      <Card className="p-3 shadow-lg backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-border w-[200px] text-sm select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-muted-foreground">Map Info</span>
          <span className="text-xs text-muted-foreground">Zoom {zoom.toFixed(1)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs">
              <Ruler className="w-3 h-3" /> Radius
            </span>
            <span className="font-medium">{radiusKm.toFixed(2)} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" /> Altitude
            </span>
            <span className="font-medium">{altitudeKm} km</span>
          </div>

          <Progress value={(zoom / 22) * 100} className="h-1 mt-2" />
        </div>
      </Card>
    </motion.div>
  );
}
