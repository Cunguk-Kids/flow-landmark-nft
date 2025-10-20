import { useFlowCurrentUser } from "@onflow/react-sdk";

export default function Auth() {
  const { user, authenticate, unauthenticate } = useFlowCurrentUser();

  if (user?.loggedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">Connected</div>
          <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
          </code>
        </div>
        <button
          onClick={() => unauthenticate()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => authenticate()}
      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Connect Wallet
    </button>
  );
}
