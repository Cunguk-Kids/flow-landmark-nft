import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FlowProvider } from "@onflow/react-sdk";
import App from "./App.tsx";
import flowJSON from "../../flow.json";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlowProvider
      config={{
        accessNodeUrl: "http://localhost:8888",
        flowNetwork: "emulator",
        appDetailTitle: "Flow Counter DApp",
        appDetailIcon:
          "https://avatars.githubusercontent.com/u/62387156?s=200&v=4",
        appDetailDescription:
          "A decentralized counter application on Flow blockchain",
        appDetailUrl: "http://localhost:5173",
        discoveryWallet: "https://fcl-discovery.onflow.org/emulator/authn",
        // discoveryWallet: 'http://localhost:8701/fcl/authn', // Flow dev wallet for emulator
      }}
      flowJson={flowJSON}
    >
      <App />
    </FlowProvider>
  </StrictMode>
);
