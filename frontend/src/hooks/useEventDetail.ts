import { useQuery } from "@tanstack/react-query";
import eventlistDummy from "@/assets/json/events-detail.json";
export function useEventDetail(id: number) {
  return useQuery({
    queryKey: ["event_detail", id],
    queryFn: () => useEventDetail.fetch(id),
  });
}

useEventDetail.fetch = (id: number) => {
  return eventlistDummy.find((x) => x.id === id + "");
};
