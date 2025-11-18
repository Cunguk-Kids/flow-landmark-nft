import type { ReactNode } from "react";
import { FlowProvider } from "@onflow/react-sdk";
import type { FlowConfig } from "@onflow/react-sdk/types/core/context";

export const flowConfig: FlowConfig = {
  flowNetwork: "testnet",
  discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
  accessNodeUrl: 'https://rest-testnet.onflow.org'
};
export function Web3Provider(props: { children: ReactNode }) {
  return <FlowProvider config={flowConfig}>{props.children}</FlowProvider>;
}
