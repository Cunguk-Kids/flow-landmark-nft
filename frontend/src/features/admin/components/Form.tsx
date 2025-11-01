import { useEffect, useState } from 'react';
import { ChevronDownIcon, MapPin } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Typhography } from '@/components/ui/typhography';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import BackButton from '@/components/BackButton';
import type { Event } from '@/types/api';
import { useRouter } from '@tanstack/react-router';
import { usePartnerList } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EventPayload {
  brand: string;
  eventName: string;
  description: string;
  image: string;
  lat: number;
  long: number;
  quota: number;
  totalRareNFT: number;
  startDateTime: string;
  endDateTime: string;
  radius: number;
}

interface EventFormPageProps<T = EventPayload> {
  event: Event | null;
  handleSubmit?: (data: T) => Promise<void> | void;
}

export default function EventFormPage({ event, handleSubmit }: EventFormPageProps) {
  const router = useRouter();
  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [brandPagination, setBrandPagination] = useState({
    limit: 10,
    page: 1,
  });

  const { data: partnerBrand } = usePartnerList(brandPagination);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [formData, setFormData] = useState({
    brand: '',
    image: '',
    title: '',
    description: '',
    startDate: undefined as Date | undefined,
    startTime: '',
    endDate: undefined as Date | undefined,
    endTime: '',
    latitude: -6.2088,
    longitude: 106.8456,
    capacity: 0,
    rareNft: 0,
    radius: 0,
  });

  useEffect(() => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        brand: '',
        image: event.image?.replace(/^"|"$/g, '') || '',
        title: event.eventName || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate) : undefined,
        startTime: event.startDate ? new Date(event.startDate).toISOString().slice(11, 19) : '',
        endDate: event.endDate ? new Date(event.endDate) : undefined,
        endTime: event.endDate ? new Date(event.endDate).toISOString().slice(11, 19) : '',
        latitude: Number(event.lat),
        longitude: Number(event.long),
        capacity: event.quota || 0,
        rareNft: event.totalRareNFT || 0,
        radius: event.radius || 0,
      });
    }
  }, [event]);

  const [viewState, setViewState] = useState({
    longitude: event?.long || 106.8456,
    latitude: event?.lat || -6.2088,
    zoom: 12,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapClick = (mapEvt: any) => {
    const { lngLat } = mapEvt;
    setFormData((prev) => ({
      ...prev,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    }));
  };

  // Submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: EventPayload = {
      brand: formData.brand,
      eventName: formData.title,
      description: formData.description,
      image: formData.image,
      lat: formData.latitude,
      long: formData.longitude,
      quota: formData.capacity,
      totalRareNFT: formData.rareNft,
      radius: formData.radius,
      startDateTime:
        formData.startDate && formData.startTime
          ? new Date(
              `${formData.startDate.toISOString().split('T')[0]}T${formData.startTime}Z`,
            ).toISOString()
          : '',
      endDateTime:
        formData.endDate && formData.endTime
          ? new Date(
              `${formData.endDate.toISOString().split('T')[0]}T${formData.endTime}Z`,
            ).toISOString()
          : '',
    };

    try {
      if (handleSubmit) await handleSubmit(payload);

      // Reset form
      setFormData({
        brand: '',
        image: '',
        title: '',
        description: '',
        startDate: undefined,
        startTime: '',
        endDate: undefined,
        endTime: '',
        latitude: -6.2088,
        longitude: 106.8456,
        capacity: 0,
        rareNft: 0,
        radius: 0,
      });

      setTimeout(() => router.navigate({ to: '/admin' }), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="min-h-screen md:w-5xl max-w-5xl bg-background px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton />
        </div>

        <Typhography variant="2xl" className="font-semibold">
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </Typhography>

        <Typhography variant="lg" className="text-sm text-muted-foreground">
          {editingEvent
            ? 'Update event information below.'
            : 'Fill out the details to add a new event.'}
        </Typhography>

        {/* === FORM === */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Image URL */}
          <Field>
            <Label>Event Image URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
            {formData.image && (
              <div className="relative mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
              </div>
            )}
          </Field>

          {/* Brand */}
          <Field>
            <Label>Event Brand</Label>
            <Select
              value={formData.brand}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>

              <SelectContent
                className="max-h-60 overflow-y-auto"
                onScrollCapture={(e) => {
                  const el = e.currentTarget;
                  const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
                  if (
                    (isBottom && partnerBrand?.pagination?.totalItems) ||
                    0 >= brandPagination.limit
                  ) {
                    setBrandPagination((old) => ({
                      ...old,
                      page: old.page + 1,
                    }));
                  }
                }}>
                {partnerBrand?.data?.map((brand) => (
                  <SelectItem key={brand.address} value={brand.address}>
                    {brand.name?.replace(/^"|"$/g, '')}
                  </SelectItem>
                ))}

                {!partnerBrand?.data?.length && (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    No brand found
                  </div>
                )}
              </SelectContent>
            </Select>
          </Field>

          {/* Title */}
          <Field>
            <Label>Event Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
            />
          </Field>

          {/* Description */}
          <Field>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description"
            />
          </Field>

          {/* Start Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field>
              <Label>Start Date</Label>
              <Popover open={openStartPicker} onOpenChange={setOpenStartPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {formData.startDate
                      ? formData.startDate.toLocaleDateString()
                      : 'Select start date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (!date) return;
                      setFormData((prev) => ({ ...prev, startDate: date }));
                      setOpenStartPicker(false);
                    }}
                    disabled={(date) => date < today}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <Label>Start Time</Label>
              <Input
                type="time"
                step="1"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </Field>
          </div>

          {/* End Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field>
              <Label>End Date</Label>
              <Popover open={openEndPicker} onOpenChange={setOpenEndPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {formData.endDate ? formData.endDate.toLocaleDateString() : 'Select end date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (!date) return;
                      setFormData((prev) => ({ ...prev, endDate: date }));
                      setOpenEndPicker(false);
                    }}
                    disabled={(date) => date < today}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <Label>End Time</Label>
              <Input
                type="time"
                step="1"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </Field>
          </div>

          {/* Map */}
          <Field>
            <Label>Select Location on Map</Label>
            <Typhography variant="t3" className="text-sm mb-2">
              Tap on the map to set the event location.
            </Typhography>
            <div className="border rounded-lg overflow-hidden" style={{ height: 300 }}>
              <Map
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}>
                <Marker longitude={formData.longitude} latitude={formData.latitude} anchor="bottom">
                  <MapPin className="h-8 w-8 text-red-500" fill="currentColor" />
                </Marker>
              </Map>
            </div>
          </Field>

          {/* Radius, Capacity, RareNFT */}
          <Field>
            <Label>Radius (km)</Label>
            <Input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
              placeholder="e.g. 10"
            />
          </Field>

          <Field>
            <Label>Capacity</Label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              placeholder="e.g. 50"
            />
          </Field>

          <Field>
            <Label>Rare NFT</Label>
            <Input
              type="number"
              value={formData.rareNft}
              onChange={(e) => setFormData({ ...formData, rareNft: Number(e.target.value) })}
              placeholder="e.g. 10"
            />
          </Field>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="grow"
              onClick={() => router.navigate({ to: '/admin' })}>
              Cancel
            </Button>
            <Button type="submit" className="grow" disabled={submitting}>
              {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
