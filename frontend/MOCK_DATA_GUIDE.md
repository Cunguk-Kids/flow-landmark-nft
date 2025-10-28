# Mock Data Guide

This guide explains how to use mock data for development when the backend API is unavailable.

## Quick Start

### Using Mock Data (Default)

Mock data is currently **ENABLED** by default. This allows you to develop and test the frontend without a working backend.

The app will display 5 sample events with realistic data including:
- Tech Summit 2025
- NFT Art Exhibition
- Web3 Developer Meetup
- Blockchain Gaming Tournament
- DeFi Workshop Series

### Switching to Real API

When the backend API is fixed and working, follow these steps:

1. Open `src/lib/mockData.ts`
2. Change line 13 from:
   ```typescript
   export const USE_MOCK_DATA = true;
   ```
   to:
   ```typescript
   export const USE_MOCK_DATA = false;
   ```
3. Save the file - that's it! The app will now use the real API.

## How It Works

### Mock Data Structure

The mock data in `src/lib/mockData.ts` matches the exact structure of the real backend API response:

```typescript
interface Event {
  id: number;
  eventId: number;
  brandAddress: string;
  eventName: string;
  quota: number;
  counter: number; // participant count
  description: string;
  image: string; // image URL
  lat: number;
  long: number;
  radius: number;
  status: number; // 0=Upcoming, 1=Active, 2=Ended, 3=Cancelled
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  totalRareNFT: number;
  edges?: {
    event_id?: EventParticipant[];
  };
}
```

### Affected Hooks

The following hooks automatically use mock data when `USE_MOCK_DATA = true`:

- **`useEventList()`** - Returns paginated list of events with filtering support
- **`useEventDetail(id)`** - Returns single event detail by ID

Both hooks include a simulated 300ms network delay for realistic testing.

### Mock Data Features

The mock implementation supports:

✅ **Pagination** - `page` and `limit` parameters
✅ **Filtering by Status** - Filter by event status (0, 1, 2, 3)
✅ **Filtering by Brand** - Filter by brand address
✅ **Event Detail by ID** - Fetch specific event (IDs 1-5 available)
✅ **Realistic Delays** - Simulates network latency
✅ **Error Handling** - Returns 404 for non-existent event IDs

## Example Usage

### Event List
```tsx
import { useEventList } from "@/hooks";

function EventsList() {
  // Returns 5 mock events
  const { data, isLoading } = useEventList();

  // With pagination
  const { data } = useEventList({ page: 1, limit: 10 });

  // Filter by status (Active events)
  const { data } = useEventList({ status: 1 });

  // Filter by brand address
  const { data } = useEventList({
    brandAddress: "0x179b6b1cb6755e31"
  });
}
```

### Event Detail
```tsx
import { useEventDetail } from "@/hooks";

function EventDetail() {
  // Returns mock event with ID 1
  const { data: event } = useEventDetail(1);

  // Available IDs: 1, 2, 3, 4, 5
  // Other IDs will throw "Event not found" error
}
```

## Mock Events Overview

| ID | Event Name | Status | Quota | Participants | NFTs |
|----|-----------|--------|-------|--------------|------|
| 1 | Tech Summit 2025 | Active | 500 | 234 | 50 |
| 2 | NFT Art Exhibition | Active | 200 | 150 | 25 |
| 3 | Web3 Developer Meetup | Ended | 100 | 100 | 10 |
| 4 | Blockchain Gaming Tournament | Upcoming | 300 | 45 | 100 |
| 5 | DeFi Workshop Series | Active | 150 | 78 | 15 |

## Customizing Mock Data

To add or modify mock events:

1. Open `src/lib/mockData.ts`
2. Edit the `MOCK_EVENTS` array
3. Add new events or modify existing ones
4. Make sure to follow the `Event` interface structure

Example:
```typescript
{
  id: 6,
  eventId: 6,
  brandAddress: "0x179b6b1cb6755e31",
  eventName: "Your Event Name",
  quota: 100,
  counter: 0,
  description: "Event description",
  image: "https://example.com/image.jpg",
  lat: -6.2088,
  long: 106.8456,
  radius: 500,
  status: 1, // 0=Upcoming, 1=Active, 2=Ended, 3=Cancelled
  startDate: Math.floor(Date.now() / 1000), // Current time as Unix timestamp
  endDate: Math.floor(Date.now() / 1000) + 86400, // +1 day
  totalRareNFT: 10,
  edges: { event_id: [] }
}
```

## Testing Both Modes

### Test Mock Data
1. Set `USE_MOCK_DATA = true`
2. Run `bun dev`
3. Navigate to events list/detail pages
4. Should see 5 mock events

### Test Real API
1. Ensure backend is running (`docker-compose up`)
2. Set `USE_MOCK_DATA = false`
3. Run `bun dev`
4. Navigate to events list/detail pages
5. Should fetch data from `http://localhost:6666`

## Troubleshooting

### "Event not found" error
- Mock data only has events with IDs 1-5
- Check if you're requesting a valid ID
- Add more events to `MOCK_EVENTS` if needed

### Mock data not loading
- Verify `USE_MOCK_DATA = true` in `src/lib/mockData.ts`
- Check browser console for errors
- Clear React Query cache (refresh page)

### API still being called with mock enabled
- Make sure the file is saved after changing `USE_MOCK_DATA`
- Restart the dev server (`bun dev`)
- Check that imports are correct in hook files

## When to Use Mock Data

✅ **Use Mock Data When:**
- Backend API is down or not deployed
- Developing frontend features independently
- Writing frontend tests
- Demonstrating UI without backend dependency
- Backend API structure is changing

❌ **Use Real API When:**
- Testing full-stack integration
- Verifying API response formats
- Testing error handling from backend
- Preparing for production deployment
- Backend API is stable and working

## Performance Notes

Mock data includes a 300ms simulated delay to mimic real network conditions. This helps ensure:
- Loading states are visible during development
- UI handles async data correctly
- No race conditions due to instant responses

You can adjust the delay in `src/lib/mockData.ts`:
```typescript
// Change 300 to desired milliseconds
await simulateDelay(300);
```

## Migration Checklist

When switching from mock to real API:

- [ ] Set `USE_MOCK_DATA = false` in `src/lib/mockData.ts`
- [ ] Verify backend is running and accessible
- [ ] Test event list page loads correctly
- [ ] Test event detail page loads correctly
- [ ] Test pagination works
- [ ] Test filtering by status/brand works
- [ ] Test error handling (404, 500, etc.)
- [ ] Update `.env` with correct `VITE_API_BASE_URL` if needed

## Future Improvements

When backend is stable, you can optionally:
- Remove mock data file (`src/lib/mockData.ts`)
- Remove mock data imports from hooks
- Remove `USE_MOCK_DATA` checks from hook files
- Keep mock data for testing purposes only
