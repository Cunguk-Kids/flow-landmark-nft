# Frontend API Integration

Complete integration of the Flow Event Platform backend API with React Query hooks.

## 📁 Files Created

### Core Files
- ✅ `src/lib/api.ts` - API client with fetch wrapper and error handling
- ✅ `src/types/api.ts` - TypeScript types for all API requests/responses
- ✅ `.env.example` - Environment variable template (includes VITE_API_BASE_URL)

### Hooks
- ✅ `src/hooks/useEventList.ts` - Fetch paginated events list with filters
- ✅ `src/hooks/useEventDetail.ts` - Fetch single event by ID
- ✅ `src/hooks/useCreateEvent.ts` - Create new event (mutation)
- ✅ `src/hooks/useCheckIn.ts` - Check-in to event (mutation)
- ✅ `src/hooks/index.ts` - Central exports
- ✅ `src/hooks/README.md` - Comprehensive documentation

## 🚀 Quick Start

### 1. Configure Environment

Create `.env.local` file in the frontend directory:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local
VITE_API_BASE_URL=http://localhost:6666
```

### 2. Import and Use Hooks

```tsx
import { useEventList, useEventDetail, useCreateEvent, useCheckIn, formatEvent } from "@/hooks";

// Fetch events list
function EventsList() {
  const { data, isLoading } = useEventList({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.data.map(event => {
        const formatted = formatEvent(event);
        return (
          <div key={event.id}>
            <h3>{formatted.eventName}</h3>
            <p>{formatted.statusLabel}</p>
            <p>{formatted.participantCount}/{event.quota} participants</p>
          </div>
        );
      })}
    </div>
  );
}

// Fetch event detail
function EventDetail({ id }) {
  const { data: event } = useEventDetail(id);
  const formatted = event ? formatEvent(event) : null;
  return <div>{formatted?.eventName}</div>;
}

// Create event
function CreateEvent() {
  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleCreate = () => {
    createEvent({
      brandAddress: "0x...",
      eventName: "My Event",
      // ... other fields
    });
  };

  return <button onClick={handleCreate}>Create</button>;
}

// Check-in
function CheckIn({ eventId, userAddress }) {
  const { mutate: checkIn } = useCheckIn();

  return (
    <button onClick={() => checkIn({ eventId, userAddress, brandAddress: "0x..." })}>
      Check In
    </button>
  );
}
```

## 📡 API Endpoints Covered

| Endpoint | Method | Hook | Status |
|----------|--------|------|--------|
| `/event/` | GET | `useEventList` | ✅ |
| `/event/:id` | GET | `useEventDetail` | ✅ |
| `/event/create` | POST | `useCreateEvent` | ✅ |
| `/event/check-in` | POST | `useCheckIn` | ✅ |

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           React Query Hooks                       │  │
│  │  • useEventList()                                 │  │
│  │  • useEventDetail()                               │  │
│  │  • useCreateEvent()                               │  │
│  │  • useCheckIn()                                   │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼──────────────────────────────────┐  │
│  │           API Client (lib/api.ts)                 │  │
│  │  • Handles fetch requests                         │  │
│  │  • Error handling (ApiError)                      │  │
│  │  • JSON parsing                                   │  │
│  └───────────────┬──────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────┘
                   │ HTTP/JSON
                   │
┌──────────────────▼──────────────────────────────────────┐
│            Backend API (localhost:6666)                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Echo Router (api/main.go)               │  │
│  │  • POST /event/create                             │  │
│  │  • GET  /event/:id                                │  │
│  │  • GET  /event/                                   │  │
│  │  • POST /event/check-in                           │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼──────────────────────────────────┐  │
│  │         Route Handlers (route/event.go)           │  │
│  │  • Validation                                     │  │
│  │  • Database queries (Ent ORM)                     │  │
│  │  • Blockchain transactions                        │  │
│  └───────────────┬──────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
  ┌──────────────┐    ┌──────────────┐
  │  PostgreSQL  │    │ Flow Emulator│
  │   Database   │    │  Blockchain  │
  └──────────────┘    └──────────────┘
```

## 🎯 Type Safety

All API interactions are fully typed:

```typescript
// Event type from backend
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

// Full IntelliSense support
const { data } = useEventList();
//     ^? EventsListResponse
data.pagination.totalItems; // number
data.data[0].eventName; // string

// Use formatEvent helper to clean and format data
import { formatEvent } from "@/hooks";
const formatted = formatEvent(data.data[0]);
formatted.eventName; // string (without extra quotes)
formatted.startDateTime; // Date object
formatted.statusLabel; // "Active", "Upcoming", etc.
formatted.participantCount; // number
formatted.isFull; // boolean
```

## ⚡ Features

### ✅ Automatic Cache Management
- React Query handles caching automatically
- Mutations invalidate related queries
- Configurable stale time (5 minutes default)

### ✅ Error Handling
```tsx
const { error } = useEventList();

if (error instanceof ApiError) {
  console.log(error.status); // 404, 500, etc.
  console.log(error.message); // User-friendly message
  console.log(error.data); // Backend error details
}
```

### ✅ Loading States
```tsx
const { isLoading, isFetching, isPending } = useEventList();
// isLoading: Initial load
// isFetching: Background refetch
// isPending: Mutation in progress
```

### ✅ Optimistic Updates
Mutations automatically invalidate and refetch related data:

```tsx
const { mutate: checkIn } = useCheckIn();

checkIn({ eventId: "1", userAddress: "0x...", brandAddress: "0x..." });
// ✅ Automatically refetches event detail
// ✅ Automatically refetches events list
```

### ✅ Pagination Support
```tsx
const [page, setPage] = useState(1);
const { data } = useEventList({ page, limit: 10 });

// Access pagination metadata
data.pagination.currentPage;
data.pagination.totalPages;
data.pagination.totalItems;
```

### ✅ Filtering Support
```tsx
const { data } = useEventList({
  status: 1, // 1 = Active (0 = Upcoming, 1 = Active, 2 = Ended, 3 = Cancelled)
  brandAddress: "0x123...",
  page: 1,
  limit: 20
});
```

## 🧪 Testing

The hooks are easy to test with React Query's testing utilities:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEventList } from "@/hooks";

test("fetches events", async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useEventList(), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## 📚 Documentation

See `src/hooks/README.md` for detailed documentation on each hook including:
- Usage examples
- Parameter descriptions
- Return type details
- Best practices
- Advanced patterns

## 🔧 Configuration

### Development
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:6666
```

### Production
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Testing
```bash
# .env.test
VITE_API_BASE_URL=http://localhost:6666
```

## 🎨 Integration Example

See how the hooks replace dummy data:

**Before (Dummy Data):**
```tsx
// Old way with dummy data
import eventlistDummy from "@/assets/json/events-list.json";

function EventsList() {
  const events = eventlistDummy;
  return <div>{events.map(...)}</div>;
}
```

**After (Real API):**
```tsx
// New way with real API
import { useEventList } from "@/hooks";

function EventsList() {
  const { data, isLoading } = useEventList();

  if (isLoading) return <div>Loading...</div>;

  return <div>{data.data.map(...)}</div>;
}
```

## 🚦 Next Steps

1. ✅ **Environment Setup** - Copy `.env.example` to `.env.local`
2. ✅ **Start Backend** - Ensure API is running on `localhost:6666`
3. ✅ **Replace Dummy Data** - Update components to use hooks
4. ✅ **Add Error Boundaries** - Handle API errors gracefully
5. ✅ **Add Loading States** - Show loading indicators
6. ✅ **Test Integration** - Verify all endpoints work

## 🐛 Troubleshooting

### API Connection Issues
```bash
# Check if API is running
curl http://localhost:6666/event/

# Expected response:
# {"data":[],"pagination":{"currentPage":1,"pageSize":10,"totalItems":0,"totalPages":0}}
```

### CORS Issues
If you get CORS errors, ensure the backend API has proper CORS headers configured.

### Type Errors
Make sure TypeScript is up to date:
```bash
npm install -D typescript@latest
```

## 📦 Dependencies

The integration uses:
- `@tanstack/react-query` - Data fetching and caching
- `fetch` API - HTTP requests (built-in)
- TypeScript - Type safety

No additional dependencies needed! 🎉
