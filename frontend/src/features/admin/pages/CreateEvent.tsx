/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useCreateEvent } from '@/hooks';
import EventFormPage, { type EventPayload } from '../components/Form';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { generateImageCard } from '@/lib/imageGeneratorHG';
import { uploadImage } from '@/lib/uploadCare';

const CreateEvent = () => {
  const { mutateAsync } = useCreateEvent();
  const [loading, setLoading] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleCreate = async (data: EventPayload) => {
    setLoading(true);

    try {
      await mutateAsync({
        brandAddress: data.brand,
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
    } catch (error: any) {
      toast.error('❌ Failed to create event', {
        description: error?.message || 'Something went wrong while creating the event.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setImageGenerating(true);
      setGeneratedImage(null);
      toast.info('🎨 Generating image, please wait...');

      const url = await generateImageCard({
        brand: 'Adidas',
        description: 'Event eksklusif peluncuran Air Jordan terbaru dengan nuansa futuristik.',
        count: 1,
      });

      const uploadedUrl = await uploadImage(url);
      setGeneratedImage(url);

      toast.success('✅ Uploaded successfully!');
      console.log('🖼️ URL:', uploadedUrl);
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate image');
    } finally {
      setImageGenerating(false);
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start hidden">
        <Button onClick={handleGenerate} disabled={imageGenerating}>
          {imageGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" /> Generate Image
            </>
          )}
        </Button>

        {generatedImage && (
          <Card className="p-2 border rounded-lg shadow-sm max-w-xs">
            <img
              src={generatedImage}
              alt="Generated preview"
              className="rounded-md object-cover w-full h-auto"
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">Preview hasil AI</p>
          </Card>
        )}
      </div>

      {/* Overlay saat event creation */}
      {loading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-white w-10 h-10 mb-2" />
          <p className="text-white text-sm font-medium">Creating event...</p>
        </div>
      )}

      {/* Form utama */}
      <EventFormPage event={null} handleSubmit={handleCreate} />
    </div>
  );
};

export default CreateEvent;
