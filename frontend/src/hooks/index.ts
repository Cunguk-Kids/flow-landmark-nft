/**
 * API Hooks - Centralized export
 */

// Event hooks
export { useEventList } from "./useEventList";
export { useEventDetail } from "./useEventDetail";
export { useCreateEvent } from "./useCreateEvent";
export { useCheckIn } from "./useCheckIn";
export { useUserEvents } from "./useUserEvents";
export { useUpdateEventStatus } from "./useUpdateEventStatus";
export { useRegisterEvent } from "./useRegisterEvent";

// Partner hooks
export { usePartnerList } from "./usePartnerList";
export { usePartnerDetail } from "./usePartnerDetail";

// NFT hooks
export { useNFTList } from "./useNFTList";

// Re-export types
export type {
  Event,
  EventsListResponse,
  EventDetailResponse,
  CreateEventRequest,
  CreateEventResponse,
  CheckInRequest,
  CheckInResponse,
  EventsQueryParams,
  PaginationMeta,
  EventParticipant,
  FormattedEvent,
  Partner,
  PartnersListResponse,
  PartnerDetailResponse,
  NFT,
  NFTMetadata,
  NFTsListResponse,
  UserEventQueryParams,
  UpdateEventStatusRequest,
  UpdateEventStatusResponse,
} from "@/types/api";

export { EventStatusLabels, formatEvent } from "@/types/api";
