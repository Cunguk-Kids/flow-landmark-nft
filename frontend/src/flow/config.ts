import * as fcl from "@onflow/fcl";

// Configure FCL based on environment variables
// This is a fallback for direct FCL usage (React SDK FlowProvider in main.tsx is preferred)
fcl.config({
  "app.detail.title": "NFT Moment Platform",
  "app.detail.icon": "https://avatars.githubusercontent.com/u/62387156?s=200&v=4",
  "accessNode.api": import.meta.env.VITE_ACCESS_NODE || "http://localhost:8888",
  "discovery.wallet": import.meta.env.VITE_WALLET_DISCOVERY || "http://localhost:8701/fcl/authn",
  "flow.network": import.meta.env.VITE_FLOW_NETWORK || "emulator",

  // Contract address aliases
  "0xNFTMoment": import.meta.env.VITE_NFTMOMENT_ADDRESS || "0xf8d6e0586b0a20c7",
  "0xEventPlatform": import.meta.env.VITE_EVENTPLATFORM_ADDRESS || "0xf8d6e0586b0a20c7",
  "0xMomentUtility": import.meta.env.VITE_MOMENTUTILITY_ADDRESS || "0xf8d6e0586b0a20c7",
});

export default fcl;
