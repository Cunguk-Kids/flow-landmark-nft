/**
 * API Hooks - Centralized export
 */

export { useEventList } from "./useEventList";
export { useEventDetail } from "./useEventDetail";
export { useCreateEvent } from "./useCreateEvent";
export { useCheckIn } from "./useCheckIn";

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
} from "@/types/api";

export { EventStatusLabels, formatEvent } from "@/types/api";
