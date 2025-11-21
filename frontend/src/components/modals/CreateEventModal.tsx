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

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { createEvent, isPending, isSealed, error } = useCreateEvent();

  // State Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [type, setType] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState('');
  const [quota, setQuota] = useState('50');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (isSealed) {
      onSuccess();
      onClose();
      // Reset Form (Optional)
    }
  }, [isSealed, onSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: CreateEventDTO = {
      eventName: name,
      description: desc,
      thumbnailURL: thumbnail,
      eventPassImg: thumbnail, // Sementara pakai gambar yang sama
      eventType: type,
      location: location,
      lat: 0.0, // Placeholder, nanti bisa pakai Map Picker
      long: 0.0,
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
            <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Thumbnail URL</Label>
            <Input value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg" placeholder="ipfs://..." required />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase font-pixel text-rpn-blue">Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg min-h-[80px]" placeholder="Event details..." required />
          </div>

          {/* Type & Location */}
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
                    {type === 'online' ? <Globe size={12}/> : <MapPin size={12}/>} 
                    {type === 'online' ? "Link / Platform" : "Address"}
                </Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg" placeholder={type === 'online' ? "Discord / Google Meet" : "Jl. Sudirman No..."} required />
             </div>
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
                disabled={isPending}
                className="bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-black font-sans uppercase rounded-lg shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#fff] transition-all px-6"
            >
                {isPending ? (
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