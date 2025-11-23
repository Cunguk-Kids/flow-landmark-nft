import { QueryProvider } from "./query.provider";
import { RouteProvider } from "./router.provider";
import { Web3Provider } from "./web3.provider";
import { Toaster } from 'sonner';

export function MainProvider() {
  return (
    <QueryProvider>
      <Web3Provider>
        <RouteProvider />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </Web3Provider>
    </QueryProvider>
  );
}
