import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUserSearch } from '@/hooks/api/useUserSearch'; // Hook baru
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CompactProfileCard from "@/components/CompactProfileCard";

export const Route = createFileRoute('/search')({
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();

  // State input langsung
  const [query, setQuery] = useState('');

  // Hook akan otomatis handle debounce dan fetching
  const { data: users, isLoading, isFetching } = useUserSearch(query);

  const handleBack = () => {
    // Arahkan ke halaman profil publik (bukan /profile diri sendiri)
    // Asumsi rute: /users/$address
    navigate({ to: `/` });
  };

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans pb-20 selection:bg-rpn-blue selection:text-white pt-24 px-4">
      <div className="max-w-7xl mx-auto flex justify-between">
        <button
          onClick={handleBack}
          className="pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-rpn-blue hover:text-white transition-all group shadow-lg"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
      {/* --- HEADER & SEARCH BAR --- */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-pixel text-3xl md:text-5xl text-white uppercase drop-shadow-[4px_4px_0px_rgba(41,171,226,0.3)] mb-6">
          Find People
        </h1>

        <div className="relative group">
          {/* Efek Glow */}
          <div className="absolute inset-0 bg-rpn-blue/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <div className="relative flex items-center">
            <Search className="absolute left-4 text-rpn-blue w-6 h-6 z-10" />
            <Input
              type="text"
              placeholder="Search by username or 0x address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-16 bg-rpn-card border-2 border-rpn-blue/50 text-white text-lg pl-14 pr-14 rounded-2xl focus:border-rpn-blue focus:ring-0 transition-all font-mono shadow-lg"
            />
            {/* Indikator Loading Kecil di Kanan */}
            {isFetching && (
              <div className="absolute right-4">
                <Loader2 className="animate-spin text-rpn-blue w-5 h-5" />
              </div>
            )}
          </div>
          <p className="text-xs text-rpn-muted mt-2 font-mono text-left pl-2">
            {query ? `Searching for "${query}"...` : "Showing latest users"}
          </p>
        </div>
      </div>

      {/* --- HASIL PENCARIAN (GRID) --- */}
      <div className="max-w-5xl mx-auto">

        {/* Loading Awal (Hanya saat pertama kali load halaman) */}
        {isLoading && !users ? (
          <div className="flex flex-col items-center justify-center py-20 text-rpn-blue animate-pulse font-pixel text-xs">
            <div className="w-12 h-12 border-4 border-t-rpn-blue border-r-rpn-blue border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            SCANNING NETWORK...
          </div>
        ) : (
          // Grid Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users?.map((user) => (
              <CompactProfileCard
                key={user.id}
                address={user.address}
                user={user} // Pass user data to avoid re-fetch
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* Empty State (Jika tidak ada hasil) */}
        {!isLoading && users && users.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-rpn-blue/20 rounded-2xl bg-rpn-blue/5">
            <p className="font-bold uppercase text-rpn-muted">User Not Found</p>
            <p className="text-xs mt-1 opacity-70">Try searching for a different address or name.</p>
          </div>
        )}

      </div>
    </div>
  );
}