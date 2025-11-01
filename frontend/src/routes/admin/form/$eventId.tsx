import UpdateEvent from '@/features/admin/pages/UpdateEvent';
import { useEventDetail } from '@/hooks';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/form/$eventId')({
  loader: async ({ params }) => {
    try {
      const detail = await useEventDetail.fetch(+params.eventId);
      return { event: detail };
    } catch (err) {
      console.error('❌ Loader error:', err);
      return { event: null };
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateEvent />;
}
