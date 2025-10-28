/**
 * API Response Types for Flow Event Backend
 * Updated to match actual backend response structure
 */

/**
 * Event participant (nested in event response)
 */
export interface EventParticipant {
  id: number;
  userAddress: string;
  isCheckedIn: boolean;
  edges: Record<string, unknown>;
}

/**
 * Event from database (matches backend ent schema - actual response)
 */
export interface Event {
  id: number;
  eventId: number;
  brandAddress: string;
  eventName: string;
  quota: number;
  counter: number; // Number of registered participants
  description: string;
  image: string;
  lat: number;
  long: number;
  radius: number;
  status: number; // 0 = Upcoming, 1 = Active, 2 = Ended, 3 = Cancelled
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  totalRareNFT: number;
  edges?: {
    event_id?: EventParticipant[];
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated events list response
 */
export interface EventsListResponse {
  data: Event[];
  pagination: PaginationMeta;
}

/**
 * Single event response
 */
export type EventDetailResponse = Event;

/**
 * Create event request payload
 */
export interface CreateEventRequest {
  brandAddress: string;
  eventName: string;
  quota: number;
  description: string;
  image: string; // URL
  lat: number;
  long: number;
  radius: number;
  startDate: string; // ISO 8601 format (RFC3339Nano)
  endDate: string; // ISO 8601 format (RFC3339Nano)
  totalRareNFT: number;
}

/**
 * Create event response
 */
export interface CreateEventResponse {
  status: string;
  message: string;
  brand: string;
  eventName: string;
  disclaimer: string;
}

/**
 * Check-in request payload
 */
export interface CheckInRequest {
  eventId: string;
  userAddress: string;
  brandAddress: string;
}

/**
 * Check-in response
 */
export interface CheckInResponse {
  status: string;
  message: string;
}

/**
 * Event status labels mapping
 */
export const EventStatusLabels = {
  0: "Upcoming",
  1: "Open",
  2: "Ended",
  3: "Cancelled",
} as const;

/**
 * Query params for fetching events
 */
export interface EventsQueryParams {
  page?: number;
  limit?: number;
  brandAddress?: string;
  status?: number; // 0 = Upcoming, 1 = Active, 2 = Ended, 3 = Cancelled
}

/**
 * Helper function to format event data
 */
export const formatEvent = (event: Event) => {
  return {
    ...event,
    // Remove extra quotes from strings if present
    eventName: event.eventName.replace(/^"|"$/g, ""),
    description: event.description.replace(/^"|"$/g, ""),
    image: event.image.replace(/^"|"$/g, ""),
    // Convert unix timestamp to Date
    startDateTime: new Date(event.startDate * 1000),
    endDateTime: new Date(event.endDate * 1000),
    // Get status label
    statusLabel: EventStatusLabels[event.status as keyof typeof EventStatusLabels] || "Unknown",
    // Get participants list
    participants: event.edges?.event_id || [],
    // Get participant count
    participantCount: event.counter,
    // Check if event is full
    isFull: event.counter >= event.quota,
  };
};

/**
 * Helper type for formatted event
 */
export type FormattedEvent = ReturnType<typeof formatEvent>;
