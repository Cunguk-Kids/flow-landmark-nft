import { Connect } from "@onflow/react-sdk";

/**
 * Example using the built-in <Connect /> component from React SDK
 * This provides a ready-to-use wallet connection UI with:
 * - Balance display (Cadence, EVM, or combined)
 * - Copy address functionality
 * - Logout button
 * - Automatic state management
 */
export default function AuthWithConnect() {
  return (
    <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "8px" }}>
      <h3>Wallet Connection (Built-in Component)</h3>
      <Connect
        balanceType="cadence"
        onConnect={() => console.log("User connected!")}
        onDisconnect={() => console.log("User disconnected!")}
      />
    </div>
  );
}
