import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateEventStatus } from '@/hooks';

const schema = z.object({
  status: z.string(),
});

type FormData = z.infer<typeof schema>;

interface UpdateEventStatusFormProps {
  eventId: string;
  brandAddress?: string;
}

export function UpdateEventStatusForm({ eventId, brandAddress }: UpdateEventStatusFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: brandAddress },
  });

  const { mutateAsync } = useUpdateEventStatus();

  const handleUpdate = async (data: FormData) => {
    try {
      setLoading(true);
      await mutateAsync({
        eventId: eventId,
        brandAddress: data.status,
      });

      toast.success('✅ Event status updated!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to update event status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-5 mt-4">
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
          </>
        ) : (
          'Update'
        )}
      </Button>
    </form>
  );
}
