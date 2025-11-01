import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { LucideMapPin } from 'lucide-react';
import { EventMarkerContent } from '../EventMarkerContent';
import type { Event } from '@/hooks';
import { Marker } from 'react-map-gl/maplibre';

export const EventMarkerPopover = ({
  event,
  handleSelectEvent,
}: {
  event: Event;
  handleSelectEvent: (e: Event) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectEvent(event);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const eventName = event.eventName.replace(/^"|"$/g, '');

  return (
    <Marker latitude={event.lat} longitude={event.long} anchor="bottom">
      <Popover open={open} onOpenChange={setOpen}>
        <Button
          onClick={handleClick}
          className="cursor-pointer w-fit rounded-full p-1"
          title={eventName}
          variant="ghost"
          size="icon">
          <LucideMapPin className="text-primary fill-primary/10 size-5" />
          {open && <span className="truncate text-ellipsis max-w-60 ml-2">{eventName}</span>}
        </Button>

        <PopoverContent
          side="top"
          align="center"
          className="w-64 shadow-lg bg-white rounded-lg border border-gray-200"
          forceMount
          onOpenAutoFocus={(e) => e.preventDefault()}>
          <EventMarkerContent event={event} />
          <div className="text-right mt-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Marker>
  );
};
