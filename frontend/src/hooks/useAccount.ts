import { useFlowCurrentUser } from "@onflow/react-sdk";
import { useQuery } from "@tanstack/react-query";

export function useAccount() {
  const { user } = useFlowCurrentUser();

  return useQuery({
    queryKey: ["account", user?.addr],
    queryFn: () => useAccount.fetch(user!.addr!),
    enabled: user?.loggedIn ?? false,
  });
}

useAccount.fetch = (addr: string) => ({
  address: addr,
  avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=" + addr,
});
