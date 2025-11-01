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
  isCheckedIn?: boolean; // Optional - may not be present in all responses
  edges?: Record<string, unknown>;
}

/**
 * Event from database (matches backend ent schema - actual response)
 */
export interface Event {
  id: number;
  eventId: number;
  eventName: string;
  quota: number;
  counter: number; // Number of registered participants
  description: string;
  image: string;
  lat: number;
  long: number;
  radius: number;
  status: number; // 0 = Pending, 1 = Active, 2 = Ended
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  totalRareNFT: number;
  edges?: {
    participants?: EventParticipant[];
    partner?: {
      id: number;
      address: string;
      name: string;
      description: string;
      email: string;
      image: string;
      edges?: Record<string, unknown>;
    };
    nfts?: NFT[];
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
 * Based on backend: 0=Pending, 1=Active, 2=Ended
 */
export const EventStatusLabels = {
  0: "Pending",
  1: "Active",
  2: "Ended",
} as const;

/**
 * Query params for fetching events
 */
export interface EventsQueryParams {
  page?: number;
  limit?: number;
  brandAddress?: string;
  status?: number; // 0 = Pending, 1 = Active, 2 = Ended
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
    statusLabel: EventStatusLabels[event.status as keyof typeof EventStatusLabels] || EventStatusLabels[0],
    // Get participants list
    participants: event.edges?.participants || [],
    // Get participant count
    participantCount: event.counter,
    // Check if event is full
    isFull: event.counter >= event.quota,
    // Extract partner/brand information
    partner: event.edges?.partner ? {
      ...event.edges.partner,
      name: event.edges.partner.name.replace(/^"|"$/g, ""),
      description: event.edges.partner.description.replace(/^"|"$/g, ""),
      email: event.edges.partner.email.replace(/^"|"$/g, ""),
      image: event.edges.partner.image.replace(/^"|"$/g, ""),
    } : undefined,
    // Extract brand address for easy access
    brandAddress: event.edges?.partner?.address || "",
  };
};

/**
 * Helper type for formatted event
 */
export type FormattedEvent = ReturnType<typeof formatEvent>;

/**
 * Partner/Brand types
 */
export interface Partner {
  address: string;
  name: string;
  email: string;
  description: string;
  image: string;
}

export interface PartnersListResponse {
  data: Partner[];
  pagination: PaginationMeta;
}

export interface PartnerDetailResponse extends Partner { }

/**
 * NFT types
 */
export interface NFTMetadata {
  title: string;
  description: string;
  category: number;
  imageUrl: string;
  imageURL: string;
  thumbnailUrl: string;
  weather: string;
  temperature: string;
  latitude: string;
  longitude: string;
  placeName: string;
  cityName: string;
  countryName: string;
  altitude: string;
  windSpeed: string;
  borderStyle: number;
  stickerStyle: number;
  filterStyle: number;
  audioStyle: number;
  javaneseText: string;
  tags: string[];
}

export interface Edges {
  event?: {
    eventName?: string;
    partner?: {
      name?: string;
    };
  };
};

export interface NFT {
  nft_id: number;
  owner_address: string;
  rarity: number;
  metadata: NFTMetadata;
  mint_time: string;
  edges: Edges;
}

export interface NFTsListResponse {
  data: NFT[];
  pagination: PaginationMeta;
}

/**
 * User Event query params
 */
export interface UserEventQueryParams {
  userAddress: string;
  page?: number;
  limit?: number;
  status?: "Available" | "Registered" | "CheckedIn";
}

/**
 * Update Event Status request
 */
export interface UpdateEventStatusRequest {
  eventId: string;
  brandAddress: string;
}

export interface UpdateEventStatusResponse {
  status: string;
  message: string;
  disclaimer: string;
}
