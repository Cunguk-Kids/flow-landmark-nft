export type EventStatus = "Open" | "Sold Out";
export type EventCategory = "Technology" | "Art" | "Sport";

export interface EventData {
  id: string;
  title: string;
  hostBy: string;
  date: string;
  status: EventStatus;
  category: EventCategory;
  latitude: number;
  longitude: number;
}

export interface EventDetail extends EventData {
  venue: string;
  capacity: number;
  ticketPrice: number;
  description: string;
  bannerUrl: string;
}
