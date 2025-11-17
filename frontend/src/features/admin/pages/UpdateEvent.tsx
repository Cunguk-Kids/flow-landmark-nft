import { useLoaderData } from '@tanstack/react-router';
import EventFormPage from '../components/Form';

const UpdateEvent = () => {
  const { event: rawEvent } = useLoaderData({
    from: '/admin/form/$eventId',
  });

  console.log(rawEvent, '===== rawEvent ======');

  const event = rawEvent ?? null;

  return <EventFormPage event={event} />;
};

export default UpdateEvent;
