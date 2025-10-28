/**
 * Mock data for development/testing
 * Matches the actual API response structure from backend
 *
 * To use mock data instead of real API:
 * 1. Set USE_MOCK_DATA = true
 * 2. Mock data will be returned instead of making API calls
 */

import type { Event, EventsListResponse } from "@/types/api";

// Toggle this to switch between mock and real API
export const USE_MOCK_DATA = true;

/**
 * Mock events data matching backend response structure
 */
export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    eventId: 1,
    brandAddress: "0x179b6b1cb6755e31",
    eventName: "Tech Summit 2025",
    quota: 500,
    counter: 234,
    description: "Annual technology conference featuring the latest innovations in blockchain, AI, and web3 development. Join industry leaders and innovators.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    lat: -6.2088,
    long: 106.8456,
    radius: 1000,
    status: 1, // Active/Open
    startDate: Math.floor(new Date("2025-11-15T09:00:00").getTime() / 1000),
    endDate: Math.floor(new Date("2025-11-15T18:00:00").getTime() / 1000),
    totalRareNFT: 50,
    edges: {
      event_id: [
        {
          id: 1,
          userAddress: "0xf8d6e0586b0a20c7",
          isCheckedIn: true,
          edges: {}
        }
      ]
    }
  },
  {
    id: 2,
    eventId: 2,
    brandAddress: "0x179b6b1cb6755e31",
    eventName: "NFT Art Exhibition",
    quota: 200,
    counter: 150,
    description: "Explore the future of digital art with our curated NFT exhibition. Featuring works from renowned digital artists worldwide.",
    image: "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800",
    lat: -6.2146,
    long: 106.8451,
    radius: 500,
    status: 1, // Active/Open
    startDate: Math.floor(new Date("2025-11-20T14:00:00").getTime() / 1000),
    endDate: Math.floor(new Date("2025-11-20T22:00:00").getTime() / 1000),
    totalRareNFT: 25,
    edges: {
      event_id: []
    }
  },
  {
    id: 3,
    eventId: 3,
    brandAddress: "0x179b6b1cb6755e31",
    eventName: "Web3 Developer Meetup",
    quota: 100,
    counter: 100,
    description: "Network with fellow Web3 developers, share knowledge, and explore the latest development tools and frameworks.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
    lat: -6.1751,
    long: 106.8650,
    radius: 300,
    status: 2, // Ended
    startDate: Math.floor(new Date("2025-10-25T18:00:00").getTime() / 1000),
    endDate: Math.floor(new Date("2025-10-25T21:00:00").getTime() / 1000),
    totalRareNFT: 10,
    edges: {
      event_id: []
    }
  },
  {
    id: 4,
    eventId: 4,
    brandAddress: "0x179b6b1cb6755e31",
    eventName: "Blockchain Gaming Tournament",
    quota: 300,
    counter: 45,
    description: "Compete in the ultimate blockchain gaming tournament. Win prizes, NFTs, and bragging rights!",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    lat: -6.2294,
    long: 106.8231,
    radius: 800,
    status: 0, // Upcoming
    startDate: Math.floor(new Date("2025-12-01T10:00:00").getTime() / 1000),
    endDate: Math.floor(new Date("2025-12-01T20:00:00").getTime() / 1000),
    totalRareNFT: 100,
    edges: {
      event_id: []
    }
  },
  {
    id: 5,
    eventId: 5,
    brandAddress: "0x179b6b1cb6755e31",
    eventName: "DeFi Workshop Series",
    quota: 150,
    counter: 78,
    description: "Learn about decentralized finance protocols, yield farming, and liquidity provision in this hands-on workshop series.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
    lat: -6.2615,
    long: 106.7810,
    radius: 600,
    status: 1, // Active/Open
    startDate: Math.floor(new Date("2025-11-18T15:00:00").getTime() / 1000),
    endDate: Math.floor(new Date("2025-11-18T19:00:00").getTime() / 1000),
    totalRareNFT: 15,
    edges: {
      event_id: []
    }
  }
];

/**
 * Get mock events list response
 */
export const getMockEventsList = (params: {
  page?: number;
  limit?: number;
  brandAddress?: string;
  status?: number;
} = {}): EventsListResponse => {
  const page = params.page || 1;
  const limit = params.limit || 10;

  let filteredEvents = [...MOCK_EVENTS];

  // Filter by brand address
  if (params.brandAddress) {
    filteredEvents = filteredEvents.filter(
      e => e.brandAddress === params.brandAddress
    );
  }

  // Filter by status
  if (params.status !== undefined) {
    filteredEvents = filteredEvents.filter(e => e.status === params.status);
  }

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return {
    data: paginatedEvents,
    pagination: {
      totalItems,
      currentPage: page,
      pageSize: limit,
      totalPages
    }
  };
};

/**
 * Get mock event detail by ID
 */
export const getMockEventDetail = (id: number): Event | null => {
  return MOCK_EVENTS.find(e => e.id === id) || null;
};

/**
 * Simulate API delay for more realistic testing
 */
export const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
