import {
  useFlowCurrentUser,
  useFlowMutate,
  useFlowQuery,
  useFlowTransactionStatus,
} from "@onflow/react-sdk";
import { useEffect } from "react";

export default function Counter() {
  const { user } = useFlowCurrentUser();
  const { mutateAsync, isPending, data } = useFlowMutate();
  const { transactionStatus } = useFlowTransactionStatus({ id: data || '' });

  // Use the query hook to fetch counter value
  const {
    data: count,
    refetch,
    isLoading: isLoadingCount,
  } = useFlowQuery<number>({
    cadence: `
      import "Counter"

      access(all)
      fun main(): Int {
        return Counter.getCount()
      }
    `,
    query: { enabled: true },
  });

  useEffect(() => {
    if (data && transactionStatus?.status === 3) {
      refetch();
    }
  }, [transactionStatus, data]);

  const handleMutate = async (value: boolean) => {
    await mutateAsync({
      cadence: `
        import "Counter"

        transaction(inc: Bool) {
          prepare(acct: &Account) {}
          execute {
            if inc {
              Counter.increment()
            } else {
              Counter.decrement()
            }
            let newCount = Counter.getCount()
            log("New count after mutate: ".concat(newCount.toString()))
          }
        }
      `,
      args: (arg, t) => [arg(value, t.Bool)],
    });
    refetch();
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Flow Counter DApp</h2>

      <div style={{ fontSize: "3rem", margin: "2rem 0" }}>
        {isLoadingCount ? "Loading..." : count ?? "N/A"}
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          onClick={() => handleMutate(false)}
          disabled={isPending || !user?.loggedIn}
          style={{ fontSize: "1.5rem", padding: "0.5rem 1.5rem" }}
        >
          -
        </button>
        <button
          onClick={() => refetch()}
          disabled={isPending}
          style={{ padding: "0.5rem 1rem" }}
        >
          Refresh
        </button>
        <button
          onClick={() => handleMutate(true)}
          disabled={isPending || !user?.loggedIn}
          style={{ fontSize: "1.5rem", padding: "0.5rem 1.5rem" }}
        >
          +
        </button>
      </div>

      {!user?.loggedIn && (
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Connect your wallet to modify the counter
        </p>
      )}

      {isPending && (
        <p style={{ marginTop: "1rem", color: "#007bff" }}>
          Processing transaction...
        </p>
      )}
    </div>
  );
}
