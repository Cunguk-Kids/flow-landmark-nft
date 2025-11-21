import { useQuery } from "@tanstack/react-query";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image?: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  organizer: string;
  quota: number;
}

// Simulated API call
const fetchEvents = async (): Promise<Event[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate potential error (uncomment to test error state)
  // if (Math.random() > 0.7) {
  //   throw new Error("Failed to fetch events");
  // }

  return [];
};

export function useEventList() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
