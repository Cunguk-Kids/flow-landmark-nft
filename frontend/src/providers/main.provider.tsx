import { QueryProvider } from "./query.provider";
import { RouteProvider } from "./router.provider";
import { Web3Provider } from "./web3.provider";

export function MainProvider() {
  return (
    <QueryProvider>
      <Web3Provider>
        <RouteProvider />
      </Web3Provider>
    </QueryProvider>
  );
}
