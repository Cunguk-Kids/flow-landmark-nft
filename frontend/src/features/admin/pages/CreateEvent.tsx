import { useState } from 'react';
import { useCreateEvent } from '@/hooks';
import EventFormPage, { type EventPayload } from '../components/Form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CreateEvent = () => {
  const { mutateAsync } = useCreateEvent();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: EventPayload) => {
    setLoading(true);

    try {
      await mutateAsync({
        brandAddress: '0xfa3f04b6d409e295',
        eventName: data.eventName,
        quota: data.quota,
        description: data.description,
        image: data.image,
        lat: data.lat,
        long: data.long,
        radius: data.radius ?? 5,
        startDate: data.startDateTime,
        endDate: data.endDateTime,
        totalRareNFT: data.totalRareNFT,
      });

      toast.success('✅ Event created successfully!', {
        description: `Event "${data.eventName}" has been added.`,
        duration: 2500,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('❌ Failed to create event', {
        description: error?.message || 'Something went wrong while creating the event.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-white w-10 h-10 mb-2" />
          <p className="text-white text-sm font-medium">Creating event...</p>
        </div>
      )}

      <EventFormPage event={null} handleSubmit={handleCreate} />
    </div>
  );
};

export default CreateEvent;
