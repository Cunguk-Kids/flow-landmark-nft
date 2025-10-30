import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FlowProvider } from "@onflow/react-sdk";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import flowJSON from "../../flow.json";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});


console.log(import.meta.env)

// Get Flow network configuration from environment variables
const flowConfig = {
  accessNodeUrl: import.meta.env.VITE_ACCESS_NODE || "http://localhost:8888",
  flowNetwork: (import.meta.env.VITE_FLOW_NETWORK || "emulator") as "emulator" | "testnet" | "mainnet",
  appDetailTitle: "NFT Moment Platform",
  appDetailIcon: "https://avatars.githubusercontent.com/u/62387156?s=200&v=4",
  appDetailDescription: "Capture and preserve cultural moments on Flow blockchain",
  appDetailUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  discoveryWallet: import.meta.env.VITE_WALLET_DISCOVERY || "http://localhost:8701/fcl/authn",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FlowProvider
        config={flowConfig}
        flowJson={flowJSON}
      >
        <RouterProvider router={router} />
      </FlowProvider>
    </QueryClientProvider>
  </StrictMode>
);
