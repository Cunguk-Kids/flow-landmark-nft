import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useGetListings } from '@/hooks/api/useGetListings';
import ListingCard from '@/components/cards/ListingCard';
import { Loader2, TrendingUp, ShoppingBag, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SellItemTrigger from '@/components/SellItemTrigger';

export const Route = createFileRoute('/marketplace')({
  component: Marketplace,
});

function Marketplace() {
  const [page, setPage] = useState(1);
  const { data: listingsData, isLoading, refetch } = useGetListings(page, 12);
  const navigate = useNavigate()

  const listings = listingsData?.data || [];
  const pagination = listingsData?.pagination;

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans pb-20 selection:bg-green-500 selection:text-black pt-24 px-4 md:px-8">

      {/* Background Grid Hijau (Khusus Market) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none fixed" style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <button
          onClick={() => navigate({ to: '/' })}
          className="md:-left-24 absolute pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-rpn-blue hover:text-white transition-all group shadow-lg z-10"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        {/* --- MARKET HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b-2 border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-green-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
              <TrendingUp size={14} />
              <span>Realtime Exchange</span>
            </div>
            <h1 className="font-pixel text-4xl md:text-6xl leading-tight text-white uppercase drop-shadow-[4px_4px_0px_rgba(34,197,94,0.2)]">
              Trade Hub
            </h1>
          </div>

          {/* Market Stats (Simple Bento) */}
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl min-w-[120px]">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Floor Price</p>
              <p className="text-xl font-mono font-black text-white">1.5 <span className="text-xs text-green-500">FLOW</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl min-w-[120px]">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Listings</p>
              <p className="text-xl font-mono font-black text-white">{pagination?.totalItems || 0}</p>
            </div>
            <SellItemTrigger refetchListing={refetch} />
          </div>
        </div>

        {/* --- TOOLBAR (Filter & Sort) --- */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-green-500" />
            Latest Listings
          </h3>

          <Button variant="outline" className="border-white/20 text-rpn-muted hover:text-white hover:bg-white/10 bg-transparent font-mono text-xs">
            <Filter size={14} className="mr-2" /> FILTER
          </Button>
        </div>

        {/* --- LISTINGS GRID --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-green-500 animate-pulse font-pixel text-xs">
            <Loader2 className="w-10 h-10 mb-4 animate-spin" />
            LOADING MARKET DATA...
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item.listing_id}
                listing={item}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-rpn-muted font-mono">No items listed for sale.</p>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {/* (Anda bisa copy logic pagination tombol Prev/Next dari MyMomentsBox di sini) */}

      </div>
    </div>
  );
}