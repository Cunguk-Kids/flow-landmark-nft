import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { Search, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/search')({
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState<string | null>(null);

  // Kita gunakan hook useUserProfile untuk mencari
  // (Hook ini akan jalan saat searchTrigger tidak null)
  const { data: profile, isLoading, isError, error } = useUserProfile(searchTrigger);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
        setSearchTrigger(query.trim());
    }
  };

  const handleViewProfile = (address: string) => {
      // Navigasi ke halaman profil publik (Misal: /profile/0x123)
      // Untuk saat ini kita arahkan ke rute placeholder atau console log
      console.log("Go to profile:", address);
      // navigate({ to: `/profile/$address`, params: { address } }) 
  };

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans pb-20 selection:bg-rpn-blue selection:text-white flex flex-col items-center pt-32 px-4">
      
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <h1 className="font-pixel text-4xl md:text-6xl text-white uppercase drop-shadow-[4px_4px_0px_rgba(41,171,226,0.3)]">
            Find People
        </h1>
        <p className="text-rpn-muted max-w-md mx-auto font-mono text-sm">
            Search for users in the Harkon ecosystem by their Flow Address.
        </p>
      </div>

      {/* Search Bar Besar */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-rpn-blue/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Input 
                type="text" 
                placeholder="Enter wallet address (e.g. 0x123...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-16 bg-rpn-card border-2 border-rpn-blue/50 text-white text-lg px-6 rounded-2xl focus:border-rpn-blue focus:ring-0 transition-all font-mono shadow-2xl relative z-10"
            />
            <Button 
                type="submit"
                className="absolute right-2 top-2 h-12 w-12 bg-rpn-blue hover:bg-white hover:text-rpn-blue text-black rounded-xl flex items-center justify-center z-20 transition-all"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            </Button>
        </form>
      </div>

      {/* Hasil Pencarian */}
      <div className="w-full max-w-2xl mt-12">
        
        {/* State: Loading */}
        {isLoading && (
            <div className="text-center text-rpn-blue font-pixel text-xs animate-pulse">
                SEARCHING BLOCKCHAIN...
            </div>
        )}

        {/* State: Ketemu */}
        {!isLoading && profile && (
            <div className="bg-rpn-card border-2 border-rpn-blue rounded-2xl p-6 flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-[-2px] transition-transform animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Avatar */}
                <div className="w-20 h-20 rounded-xl bg-rpn-dark border-2 border-rpn-blue overflow-hidden shrink-0">
                    {profile.pfp ? (
                        <img src={profile.pfp} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-rpn-muted">
                            <User size={32} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-white uppercase font-pixel truncate">
                        {profile.nickname || "Anonymous"}
                    </h3>
                    <p className="text-xs font-mono text-rpn-blue bg-rpn-dark px-2 py-1 rounded inline-block mt-1 border border-rpn-blue/20">
                        {profile.address}
                    </p>
                    <p className="text-sm text-rpn-muted mt-2 line-clamp-1 italic">
                        "{profile.bio || "No bio."}"
                    </p>
                </div>

                {/* Action */}
                <Button 
                    onClick={() => handleViewProfile(profile.address)}
                    className="h-12 w-12 rounded-full bg-white text-black hover:bg-rpn-blue hover:text-white border-2 border-black flex items-center justify-center shrink-0 transition-all"
                >
                    <ArrowRight size={20} />
                </Button>
            </div>
        )}

        {/* State: Error / Tidak Ketemu */}
        {!isLoading && searchTrigger && !profile && (
            <div className="text-center p-8 border-2 border-dashed border-red-500/30 rounded-2xl bg-red-500/5 text-red-400 animate-in fade-in zoom-in-95">
                <AlertCircle className="mx-auto mb-2" />
                <p className="font-bold uppercase">User Not Found</p>
                <p className="text-xs mt-1 opacity-70">Ensure the wallet address is correct and they have set up a profile.</p>
            </div>
        )}

      </div>

    </div>
  );
}