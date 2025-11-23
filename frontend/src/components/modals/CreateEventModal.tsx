'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEvent, type CreateEventDTO } from '@/hooks/transactions/useCreateEvent';
import { Loader2, CalendarPlus, MapPin, Globe } from 'lucide-react';
import LocationPicker from '../map/LocationPicker';
import { useUploadImage } from '@/hooks/api/useUploadImage';
import { toast } from 'sonner';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { createEvent, isPending, isSealed, error } = useCreateEvent();
  const uploadImage = useUploadImage();

  // State Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number>(0);
  const [long, setLong] = useState<number>(0);
  const [quota, setQuota] = useState('50');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isSealed) {
      toast.success('Event created successfully!', {
        description: 'Your event has been published on the blockchain.'
      });
      onSuccess();
      onClose();
    }
  }, [isSealed, onSuccess, onClose]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to create event', {
        description: error.message
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Upload thumbnail first
    if (!thumbnailFile) {
      toast.error('Thumbnail required', {
        description: 'Please select a thumbnail image for your event.'
      });
      return;
    }

    let thumbnailUrl = '';
    setIsUploading(true);
    try {
      const uploadResult = await uploadImage.mutateAsync(thumbnailFile);
      thumbnailUrl = uploadResult.url;
      toast.success('Image uploaded to IPFS');
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error('Upload failed', {
        description: 'Failed to upload thumbnail. Please try again.'
      });
      return;
    } finally {
      setIsUploading(false);
    }

    // 2. Create event payload
    const payload: CreateEventDTO = {
      eventName: name,
      description: desc,
      thumbnailURL: thumbnailUrl,
      eventPassImg: thumbnailUrl, // Sementara pakai gambar yang sama
      eventType: type,
      location: location,
      lat: lat,
      long: long,
      startDate: new Date(start),
      endDate: new Date(end),
      quota: parseInt(quota)
    };

    createEvent(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isPending}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl shadow-[0_0_30px_rgba(41,171,226,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-rpn-blue uppercase tracking-tighter font-pixel flex items-center gap-2">
            <CalendarPlus className="w-6 h-6" />
            Create Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Basic Info */}
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Event Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg" placeholder="RPN Meetup #1" required />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Thumbnail Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnailFile(file);
                  // Create preview
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setThumbnailPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rpn-blue file:text-rpn-dark hover:file:bg-white hover:file:text-rpn-blue cursor-pointer"
              required
            />
            {thumbnailPreview && (
              <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border-2 border-rpn-blue/30">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg min-h-[80px]" placeholder="Event details..." required />
          </div>

          {/* Type & Location */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Type</Label>
                <Select onValueChange={(v: 'online' | 'offline') => setType(v)} defaultValue="online">
                  <SelectTrigger className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-rpn-card border-rpn-blue text-white">
                    <SelectItem value="online">🌐 ONLINE</SelectItem>
                    <SelectItem value="offline">📍 OFFLINE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue flex items-center gap-1">
                  {type === 'online' ? <Globe size={12} /> : <MapPin size={12} />}
                  {type === 'online' ? "Link / Platform" : "Address Name"}
                </Label>
                <Input
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    // setIsMapClick(false); // User typing, enable search
                  }}
                  className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg"
                  placeholder={type === 'online' ? "Discord / Google Meet" : "e.g. Monas, GBK"}
                  required
                />
              </div>
            </div>

            {/* Map Picker (Only for Offline) */}
            {type === 'offline' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue flex items-center justify-between">
                  <span>Pin Location</span>
                  <span className="text-[10px] font-mono text-rpn-muted">
                    {lat !== 0 ? `${lat.toFixed(4)}, ${long.toFixed(4)}` : "(Click map to set)"}
                  </span>
                </Label>
                <LocationPicker
                  initialLat={lat}
                  initialLng={long}
                  onLocationSelect={(newLat, newLng) => {
                    setLat(newLat);
                    setLong(newLng);

                    // DISABLED: Reverse Geocoding (Nominatim API)
                    // try {
                    //   const res = await fetch(
                    //     `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`,
                    //     {
                    //       headers: {
                    //         'User-Agent': 'FlowLandmarkNFT/1.0 (https://github.com/harkon666/flow-landmark-nft)',
                    //         'Referer': window.location.origin
                    //       }
                    //     }
                    //   );
                    //   const data = await res.json();
                    //   if (data && data.display_name) {
                    //     const placeName = data.address?.amenity || data.address?.building || data.address?.road || data.display_name.split(',')[0];
                    //     const city = data.address?.city || data.address?.town || data.address?.village || "";
                    //     setLocation(`${placeName}${city ? `, ${city}` : ''}`);
                    //   }
                    // } catch (err) {
                    //   console.error("Reverse geocoding failed", err);
                    // }
                  }}
                />
              </div>
            )}
          </div>

          {/* Date & Quota */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Starts</Label>
              <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg text-xs" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Ends</Label>
              <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg text-xs" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Quota</Label>
              <Input type="number" value={quota} onChange={e => setQuota(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg" min="1" required />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-900/20 p-2 border border-red-500 rounded">
              Error: {error.message}
            </p>
          )}

          <div className="pt-4 flex justify-end border-t border-rpn-blue/20">
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-black font-sans uppercase rounded-lg shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#fff] transition-all px-6"
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> UPLOADING IMAGE...</>
              ) : isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> CREATING...</>
              ) : (
                "PUBLISH EVENT"
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}