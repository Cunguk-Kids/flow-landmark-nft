import CreateEvent from '@/features/admin/pages/CreateEvent';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/form/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <CreateEvent />
    </>
  );
}
