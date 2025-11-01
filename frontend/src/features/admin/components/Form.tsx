import { useState } from 'react';
import { ChevronDownIcon, Upload, MapPin } from 'lucide-react';
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
import type { EventForm } from '../types';
import BackButton from '@/components/BackButton';

export default function EventFormPage() {
  const [events, setEvents] = useState<EventForm[]>([
    {
      image: '',
      id: '1',
      title: 'Tech Conference 2025',
      description: 'Annual technology conference featuring latest innovations',
      date: undefined,
      time: '19:00:00',
      latitude: -6.2088,
      longitude: 106.8456,
      capacity: 500,
      registered: 342,
      rareNft: 50,
    },
    {
      image: '',
      id: '2',
      title: 'Workshop: React Fundamentals',
      description: 'Hands-on workshop for learning React basics',
      date: undefined,
      time: '12:00:00',
      latitude: -6.1751,
      longitude: 106.865,
      capacity: 100,
      registered: 78,
      rareNft: 20,
    },
  ]);

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventForm | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<{
    image: string;
    title: string;
    description: string;
    date: Date | undefined;
    time: string;
    latitude: number;
    longitude: number;
    capacity: number;
    rareNft: number;
  }>({
    image: '',
    title: '',
    description: '',
    date: undefined,
    time: '',
    latitude: -6.2088,
    longitude: 106.8456,
    capacity: 0,
    rareNft: 0,
  });

  const [viewState, setViewState] = useState({
    longitude: 106.8456,
    latitude: -6.2088,
    zoom: 12,
  });

  const resetForm = () => {
    setFormData({
      image: '',
      title: '',
      description: '',
      date: undefined,
      time: '',
      latitude: -6.2088,
      longitude: 106.8456,
      capacity: 0,
      rareNft: 0,
    });
    setViewState({
      longitude: 106.8456,
      latitude: -6.2088,
      zoom: 12,
    });
    setEditingEvent(null);
  };
  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    setFormData({
      ...formData,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      setEvents(events.map((evt) => (evt.id === editingEvent.id ? { ...evt, ...formData } : evt)));
      setAlert({ type: 'success', message: 'Event updated!' });
    } else {
      const newEvent: EventForm = {
        id: Date.now().toString(),
        ...formData,
        registered: 0,
      };
      setEvents([...events, newEvent]);
      setAlert({ type: 'success', message: 'Event created!' });
    }

    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="min-h-screen  md:w-5xl max-w-5xl bg-background px-4 py-6 sm:px-6 sm:py-8 space-y-6">
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

        <div className="flex flex-col gap-5">
          {/* Image Upload */}
          <Field>
            <Label>Event Image</Label>
            <div className="relative">
              {formData.image ? (
                <div className="relative group">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Label
                      htmlFor="image"
                      className="cursor-pointer bg-white/90 text-gray-800 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-white">
                      Change Image
                    </Label>
                  </div>
                </div>
              ) : (
                <Label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <Upload />
                  <span className="text-sm text-gray-600 mt-2">Click to upload or drag & drop</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                </Label>
              )}

              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setFormData((prev) => ({
                        ...prev,
                        image: ev.target?.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
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

          {/* Date */}
          <Field>
            <Label>Date</Label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {formData.date ? formData.date.toLocaleDateString() : 'Select date'}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (!date) return;
                    setFormData((prev) => ({ ...prev, date }));
                    setOpenDatePicker(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>

          {/* Time */}
          <Field>
            <Label>Time</Label>
            <Input
              type="time"
              step="1"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="bg-background"
            />
          </Field>

          {/* Map Location */}
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

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <Label className="text-xs">Latitude</Label>
                <Input value={formData.latitude} readOnly className="text-sm" disabled />
              </div>
              <div>
                <Label className="text-xs">Longitude</Label>
                <Input value={formData.longitude} readOnly className="text-sm" disabled />
              </div>
            </div>
          </Field>

          {/* Capacity */}
          <Field>
            <Label>Capacity</Label>
            <Input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(e.target.value) || 0,
                })
              }
              placeholder="e.g. 50"
            />
          </Field>

          {/* Rare NFT */}
          <Field>
            <Label>Rare NFT</Label>
            <Input
              type="number"
              min="1"
              value={formData.rareNft}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rareNft: parseInt(e.target.value) || 0,
                })
              }
              placeholder="e.g. 10"
            />
          </Field>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 w-full">
            <Button variant="outline" className="grow" onClick={() => {}}>
              Cancel
            </Button>
            <Button className="grow" onClick={handleSubmit}>
              {editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
