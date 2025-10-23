import Header from "@/components/Header";
import SandboxMap from "@/features/sandbox/SandboxMap";

const MainPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SandboxMap />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Built with Flow Blockchain • Powered by Cadence Smart Contracts
            </p>
            <p className="text-xs mt-2">
              Preserving Indonesian cultural heritage through decentralized
              technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
