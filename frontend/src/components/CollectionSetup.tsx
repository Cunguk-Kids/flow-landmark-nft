import {
  useFlowCurrentUser,
  useFlowQuery,
  useFlowMutate,
  useFlowTransactionStatus,
} from "@onflow/react-sdk";
import { useEffect } from "react";
import { CHECK_COLLECTION } from "../flow/nft-scripts";
import { SETUP_COLLECTION } from "../flow/nft-transactions";

export default function CollectionSetup({ onSetupComplete }: { onSetupComplete?: () => void }) {
  const { user } = useFlowCurrentUser();
  const { mutateAsync, isPending, data: txId } = useFlowMutate();
  const { transactionStatus } = useFlowTransactionStatus({ id: txId || "" });

  const {
    data: hasCollection,
    refetch,
    isLoading,
  } = useFlowQuery<boolean>({
    cadence: CHECK_COLLECTION,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
    query: { enabled: !!user?.addr },
  });

  useEffect(() => {
    if (txId && transactionStatus?.status === 3) {
      console.log("Collection setup complete!");
      refetch();
      if (onSetupComplete) {
        onSetupComplete();
      }
    }
  }, [transactionStatus, txId, refetch, onSetupComplete]);

  const handleSetup = async () => {
    if (!user?.loggedIn) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      await mutateAsync({
        cadence: SETUP_COLLECTION,
        args: () => [],
      });
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Failed to setup collection. Check console for details.");
    }
  };

  if (!user?.loggedIn || hasCollection) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 animate-pulse">
        <p className="text-yellow-800 dark:text-yellow-200 m-0">Checking collection status...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="text-3xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            Collection Setup Required
          </h3>
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            You need to initialize your NFT collection before you can mint or receive NFTs.
            This is a one-time setup that prepares your wallet for NFT storage.
          </p>
          <button
            onClick={handleSetup}
            disabled={isPending}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all shadow-md
              ${isPending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-lg'
              }
            `}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Setting up...
              </span>
            ) : (
              "Setup Collection Now"
            )}
          </button>

          {isPending && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing transaction on Flow blockchain...
            </p>
          )}

          {transactionStatus?.status === 3 && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-3 flex items-center gap-2">
              <span className="text-xl">✅</span>
              Collection setup complete!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
