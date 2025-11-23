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

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Future Care Summit 2024",
    description: "Join us for a comprehensive healthcare summit focusing on women and families.",
    date: "2024-12-15",
    location: "San Francisco, CA",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    attendees: 234,
    maxAttendees: 500,
    price: 0,
    organizer: "Morilin Health",
  },
  {
    id: "2",
    title: "Web3 Developer Meetup",
    description: "Learn about the latest in blockchain technology and decentralized applications.",
    date: "2024-12-20",
    location: "Austin, TX",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    attendees: 89,
    maxAttendees: 150,
    price: 25,
    organizer: "Flow Foundation",
  },
  {
    id: "3",
    title: "Design Systems Workshop",
    description: "Master neo-brutalist design and modern UI patterns.",
    date: "2024-12-18",
    location: "New York, NY",
    category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    attendees: 45,
    maxAttendees: 60,
    price: 99,
    organizer: "Design Co",
  },
  {
    id: "4",
    title: "Community Health Fair",
    description: "Free health screenings and wellness workshops for families.",
    date: "2024-12-22",
    location: "Chicago, IL",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    attendees: 512,
    maxAttendees: 1000,
    price: 0,
    organizer: "Community Care",
  },
  {
    id: "5",
    title: "React Summit 2024",
    description: "The biggest React conference of the year with workshops and talks.",
    date: "2024-12-28",
    location: "Seattle, WA",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    attendees: 1200,
    maxAttendees: 1500,
    price: 299,
    organizer: "React Conf",
  },
  {
    id: "6",
    title: "Women in Tech Networking",
    description: "Connect with fellow women in technology and share experiences.",
    date: "2024-12-10",
    location: "Boston, MA",
    category: "Networking",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
    attendees: 78,
    maxAttendees: 100,
    price: 15,
    organizer: "WomenTech",
  },
];

// Simulated API call
const fetchEvents = async (): Promise<Event[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate potential error (uncomment to test error state)
  // if (Math.random() > 0.7) {
  //   throw new Error("Failed to fetch events");
  // }

  return mockEvents;
};

export function useEventList() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
