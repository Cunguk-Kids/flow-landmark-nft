import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Layer, Marker, Source } from 'react-map-gl/maplibre';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LucideMapPin } from 'lucide-react';
import { EventMarkerContent } from '../EventMarkerContent';
import * as turf from '@turf/turf';
import type { Event } from '@/hooks';
import type { MapRef } from 'react-map-gl/maplibre';

export const DynamicRadiusMarkers = React.memo(
  ({
    mapRef,
    eventList,
    showRadius,
  }: {
    mapRef: MapRef | null;
    eventList: Event[];
    showRadius?: boolean;
  }) => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [zoom, setZoom] = useState(5);

    const handleZoom = useCallback(() => {
      const currentZoom = mapRef?.getZoom();
      if (currentZoom) {
        setZoom((prev) => (Math.abs(prev - currentZoom) > 0.05 ? currentZoom : prev));
      }
    }, [mapRef]);

    useEffect(() => {
      const map = mapRef?.getMap?.();
      if (!map) return;
      map.on('zoom', handleZoom);
      setZoom(map.getZoom());
      return () => {
        map.off('zoom', handleZoom);
      };
    }, [mapRef, handleZoom]);

    const geojson = useMemo(
      () => ({
        type: 'FeatureCollection' as const,
        features: eventList.map((event) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [Number(event.long), Number(event.lat)],
          },
          properties: {
            id: event.id,
            name: event.eventName.replace(/^"|"$/g, ''),
            radius: event.radius,
          },
        })),
      }),
      [eventList],
    );

    const handleClick = useCallback((event: Event | null) => {
      setSelectedEvent(event);
    }, []);

    const radiusLayers = useMemo(() => {
      if (!showRadius && !selectedEvent) return [];
      if (zoom < 5) return [];

      return eventList.map((event) => {
        const lat = Number(event.lat);
        const long = Number(event.long);
        const radiusKm = Number(event.radius) || 0;

        if (isNaN(lat) || isNaN(long) || radiusKm <= 0) return null;

        const adjustedRadius = radiusKm * (zoom / 8);
        const circle = turf.circle([long, lat], adjustedRadius, {
          steps: 64,
          units: 'kilometers',
        });

        const shouldShow = selectedEvent?.id === event.id || (showRadius && zoom >= 10);

        return shouldShow ? (
          <Source key={`radius-${event.id}`} id={`radius-${event.id}`} type="geojson" data={circle}>
            <Layer
              id={`fill-${event.id}`}
              type="fill"
              paint={{
                'fill-color': '#7955F5',
                'fill-opacity': 0.15,
              }}
            />
            <Layer
              id={`outline-${event.id}`}
              type="line"
              paint={{
                'line-color': '#7955F5',
                'line-width': 2,
              }}
            />
          </Source>
        ) : null;
      });
    }, [eventList, showRadius, selectedEvent, zoom]);

    return (
      <>
        <Source
          id="events"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}>
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#7955F5',
                5,
                '#5C3FCC',
                10,
                '#3A1F99',
              ],
              'circle-radius': ['step', ['get', 'point_count'], 20, 5, 25, 10, 30],
              'circle-opacity': 0.8,
            }}
          />

          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />
        </Source>

        {radiusLayers}

        {zoom >= 5 &&
          eventList.map((event) => {
            const lat = Number(event.lat);
            const long = Number(event.long);
            const eventName = event.eventName.replace(/^"|"$/g, '');
            if (isNaN(lat) || isNaN(long)) return null;

            return (
              <Marker key={event.id} latitude={lat} longitude={long} anchor="bottom">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(event);
                      }}
                      className="cursor-pointer rounded-full"
                      title={eventName}
                      variant="ghost"
                      size="icon">
                      <LucideMapPin className="text-primary fill-primary/10 size-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    onCloseAutoFocus={(e) => {
                      e.stopPropagation();
                      handleClick(null);
                    }}>
                    <EventMarkerContent event={event} />
                  </PopoverContent>
                </Popover>
              </Marker>
            );
          })}
      </>
    );
  },
);
