import type { ReactNode } from "react";
import { FlowProvider } from "@onflow/react-sdk";
import type { FlowConfig } from "@onflow/react-sdk/types/core/context";
import flowJson from '../../../flow.json';
import { config } from "@onflow/fcl";

config({
  "accessNode.api": "https://rest-testnet.onflow.org",
})
export const flowConfig: FlowConfig = {
  flowNetwork: "testnet",
  discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
  accessNodeUrl: 'https://rest-testnet.onflow.org'
};

// export const flowConfig: FlowConfig = {
//   accessNodeUrl: 'http://localhost:8888',
//   flowNetwork: 'emulator',
//   discoveryWallet: 'https://fcl-discovery.onflow.org/emulator/authn',
// };
export function Web3Provider(props: { children: ReactNode }) {
  return <FlowProvider config={flowConfig} flowJson={flowJson}>{props.children}</FlowProvider>;
}

