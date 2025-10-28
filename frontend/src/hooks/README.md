# API Hooks Documentation

This directory contains React Query hooks for interacting with the Flow Event Platform backend API.

## Available Hooks

### 📋 `useEventList`

Fetches a paginated list of events with optional filters.

**Usage:**
```tsx
import { useEventList } from "@/hooks/useEventList";

function EventsList() {
  const { data, isLoading, error } = useEventList({
    page: 1,
    limit: 10,
    status: 1, // 1 = Active
    brandAddress: "0x123..."
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.data.map(event => (
        <div key={event.id}>{event.eventName}</div>
      ))}
      <p>Total: {data.pagination.totalItems}</p>
    </div>
  );
}
```

**Parameters:**
- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 10)
- `status?: number` - Filter by event status (0 = Upcoming, 1 = Active, 2 = Ended, 3 = Cancelled)
- `brandAddress?: string` - Filter by brand address

**Returns:**
```typescript
{
  data: {
    data: Event[],
    pagination: {
      totalItems: number,
      currentPage: number,
      pageSize: number,
      totalPages: number
    }
  },
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
}
```

---

### 📄 `useEventDetail`

Fetches details for a single event by ID.

**Usage:**
```tsx
import { useEventDetail } from "@/hooks/useEventDetail";

function EventDetail({ id }: { id: number }) {
  const { data: event, isLoading, error } = useEventDetail(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <h1>{event.eventName}</h1>
      <p>{event.description}</p>
      <p>Quota: {event.counter}/{event.quota}</p>
    </div>
  );
}
```

**Parameters:**
- `id: number` - Event ID

**Returns:**
```typescript
{
  data: Event | undefined,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
}
```

---

### ➕ `useCreateEvent`

Creates a new event on the blockchain.

**Usage:**
```tsx
import { useCreateEvent } from "@/hooks/useCreateEvent";
import { toast } from "sonner";

function CreateEventForm() {
  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleSubmit = (formData) => {
    createEvent({
      brandAddress: "0x123...",
      eventName: "Tech Meetup",
      quota: 100,
      description: "A tech meetup event",
      image: "https://example.com/banner.jpg",
      lat: -6.2146,
      long: 106.8451,
      radius: 500,
      startDate: "2025-12-01T10:00:00Z",
      endDate: "2025-12-01T18:00:00Z",
      totalRareNFT: 10
    }, {
      onSuccess: (data) => {
        toast.success("Event created successfully!");
        console.log(data.message);
      },
      onError: (error) => {
        toast.error(`Failed: ${error.message}`);
      }
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Creating..." : "Create Event"}
    </button>
  );
}
```

**Parameters:**
```typescript
{
  brandAddress: string,
  eventName: string,
  quota: number,
  description: string,
  image: string, // URL
  lat: number,
  long: number,
  radius: number,
  startDate: string, // ISO 8601 format
  endDate: string, // ISO 8601 format
  totalRareNFT: number
}
```

**Returns:**
```typescript
{
  mutate: (data, options) => void,
  mutateAsync: (data) => Promise<CreateEventResponse>,
  isPending: boolean,
  isError: boolean,
  error: Error | null,
  data: CreateEventResponse | undefined
}
```

---

### ✅ `useCheckIn`

Checks in a user to an event.

**Usage:**
```tsx
import { useCheckIn } from "@/hooks/useCheckIn";
import { toast } from "sonner";

function CheckInButton({ eventId, userAddress, brandAddress }) {
  const { mutate: checkIn, isPending } = useCheckIn();

  const handleCheckIn = () => {
    checkIn({
      eventId: eventId.toString(),
      userAddress,
      brandAddress
    }, {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(`Check-in failed: ${error.message}`);
      }
    });
  };

  return (
    <button onClick={handleCheckIn} disabled={isPending}>
      {isPending ? "Checking in..." : "Check In"}
    </button>
  );
}
```

**Parameters:**
```typescript
{
  eventId: string,
  userAddress: string,
  brandAddress: string
}
```

**Returns:**
```typescript
{
  mutate: (data, options) => void,
  mutateAsync: (data) => Promise<CheckInResponse>,
  isPending: boolean,
  isError: boolean,
  error: Error | null,
  data: CheckInResponse | undefined
}
```

---

## Event Types

### Event Object
```typescript
interface Event {
  id: number;
  eventId: number;
  brandAddress: string;
  eventName: string;
  description: string;
  image: string;
  quota: number;
  counter: number; // Number of registered participants
  lat: number;
  long: number;
  radius: number;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  status: number; // 0 = Upcoming, 1 = Active, 2 = Ended, 3 = Cancelled
  totalRareNFT: number;
  edges?: {
    event_id?: EventParticipant[];
  };
}
```

### Event Status

Event status is represented as a number:
- `0` - Upcoming
- `1` - Active (displayed as "Open")
- `2` - Ended
- `3` - Cancelled

```typescript
// Event status labels mapping
const EventStatusLabels = {
  0: "Upcoming",
  1: "Open",
  2: "Ended",
  3: "Cancelled",
} as const;
```

---

## Error Handling

All hooks use the custom `ApiError` class for error handling:

```tsx
import { ApiError } from "@/lib/api";

function MyComponent() {
  const { data, error } = useEventList();

  if (error instanceof ApiError) {
    // Access status code
    console.log(error.status); // 404, 500, etc.

    // Access error data from backend
    console.log(error.data);

    // Display user-friendly message
    return <div>Error {error.status}: {error.message}</div>;
  }

  // ...
}
```

---

## Configuration

Set the backend API URL in your `.env` file:

```bash
# .env or .env.local
VITE_API_BASE_URL=http://localhost:6666
```

For production:
```bash
VITE_API_BASE_URL=https://api.yourapp.com
```

---

## Best Practices

### 1. Use Query Keys Properly
The hooks automatically manage query keys, but you can invalidate them manually:

```tsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Invalidate all events
queryClient.invalidateQueries({ queryKey: ["events"] });

// Invalidate specific event
queryClient.invalidateQueries({ queryKey: ["event", 123] });
```

### 2. Handle Loading States
```tsx
const { data, isLoading, isFetching } = useEventList();

// isLoading: true on first load
// isFetching: true on background refetch
```

### 3. Optimistic Updates
```tsx
const { mutate } = useCheckIn();

mutate(data, {
  onMutate: async (variables) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["event", variables.eventId] });

    // Snapshot the previous value
    const previousEvent = queryClient.getQueryData(["event", variables.eventId]);

    // Optimistically update
    queryClient.setQueryData(["event", variables.eventId], (old) => ({
      ...old,
      checkin_count: old.checkin_count + 1
    }));

    return { previousEvent };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ["event", variables.eventId],
      context.previousEvent
    );
  }
});
```

### 4. Server-Side Fetching (Loaders)
Use the `.fetch` method for server-side or loader functions:

```tsx
// In TanStack Router loader
export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    const event = await useEventDetail.fetch(parseInt(params.eventId));
    return { event };
  },
});
```

---

## Testing

Mock API responses in tests:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventList } from "./useEventList";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test("fetches events", async () => {
  const { result } = renderHook(() => useEventList(), {
    wrapper: createWrapper()
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.data).toHaveLength(10);
});
```
