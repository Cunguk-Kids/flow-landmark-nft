import { useQuery } from "@tanstack/react-query";
import eventlistDummy from "@/assets/json/events-list.json";

export type EventListItem = typeof eventlistDummy[number];

export function useEventList() {
  return useQuery({
    queryKey: ["event_list"],
    queryFn: () => {
      return eventlistDummy;
    },
  });
}
