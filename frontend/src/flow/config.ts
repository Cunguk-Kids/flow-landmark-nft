import * as fcl from "@onflow/fcl";

// Configure FCL for local emulator
fcl.config({
  "app.detail.title": "Flow Counter DApp",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "accessNode.api": "http://localhost:8888", // Emulator access node
  "discovery.wallet": "http://localhost:8701/fcl/authn", // Emulator dev wallet
  "0xCounter": "0x179b6b1cb6755e31", // Counter contract address on emulator
});

// For testnet, uncomment and use:
// fcl.config({
//   "app.detail.title": "Flow Counter DApp",
//   "app.detail.icon": "https://placekitten.com/g/200/200",
//   "accessNode.api": "https://rest-testnet.onflow.org",
//   "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
//   "0xCounter": "YOUR_TESTNET_CONTRACT_ADDRESS",
// });

export default fcl;
