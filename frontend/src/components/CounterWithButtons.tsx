import { useFlowQuery, TransactionButton } from "@onflow/react-sdk";
import { GET_COUNTER } from "../flow/scripts";
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from "../flow/transactions";

/**
 * Example using React SDK's built-in <TransactionButton /> components
 * This provides automatic loading states and global transaction management
 */
export default function CounterWithButtons() {
  // Use the query hook to fetch counter value
  const { data: count, refetch, isLoading: isLoadingCount } = useFlowQuery({
    cadence: GET_COUNTER,
    args: () => [],
  });

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Flow Counter DApp (With TransactionButton)</h2>

      <div style={{ fontSize: "3rem", margin: "2rem 0" }}>
        {isLoadingCount ? "Loading..." : count ?? "N/A"}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <TransactionButton
          transaction={{
            cadence: DECREMENT_COUNTER,
            args: () => [],
            limit: 50,
          }}
          label="-"
          variant="primary"
          mutation={{
            onSuccess: () => {
              console.log("Counter decremented!");
              refetch();
            },
            onError: (error) => console.error("Failed to decrement:", error),
          }}
        />

        <button
          onClick={() => refetch()}
          style={{ padding: "0.5rem 1rem" }}
        >
          Refresh
        </button>

        <TransactionButton
          transaction={{
            cadence: INCREMENT_COUNTER,
            args: () => [],
            limit: 50,
          }}
          label="+"
          variant="primary"
          mutation={{
            onSuccess: () => {
              console.log("Counter incremented!");
              refetch();
            },
            onError: (error) => console.error("Failed to increment:", error),
          }}
        />
      </div>

      <p style={{ marginTop: "1rem", color: "#666" }}>
        Connect your wallet using the component above to modify the counter
      </p>
    </div>
  );
}
