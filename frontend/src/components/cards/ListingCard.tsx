'use client';

import { type ListingData } from '@/hooks/api/useGetListings';
import { ShoppingCart, User, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlowCurrentUser } from '@onflow/react-sdk';

interface ListingCardProps {
  listing: ListingData;
  onBuy: (listingId: number, price: number) => void; // Callback saat klik beli
  isBuying?: boolean; // Loading state
}

export default function ListingCard({ listing, onBuy, isBuying }: ListingCardProps) {
  const { user } = useFlowCurrentUser();
  const nft = listing.edges?.nft_accessory;
  const seller = listing.edges?.seller;
  
  const isOwner = user?.loggedIn && seller?.address && (user.addr === seller.address);

  return (
    <div className="
      group relative flex flex-col 
      bg-rpn-dark border-2 border-white/10 
      rounded-xl overflow-hidden 
      transition-all duration-300
      hover:border-green-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(34,197,94,0.2)]
    ">

      {/* --- IMAGE AREA --- */}
      <div className="relative aspect-square bg-black/50 p-4 flex items-center justify-center overflow-hidden border-b border-white/10 group-hover:border-green-500/50 transition-colors">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

        {/* Gambar Item */}
        {nft?.thumbnail ? (
          <img
            src={nft.thumbnail}
            alt={nft.name}
            className="w-full h-full object-contain drop-shadow-xl z-10 transition-transform group-hover:scale-110"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="text-6xl grayscale opacity-20">📦</div>
        )}

        {/* Badge ID */}
        <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/20 font-mono">
          #{nft?.nft_id}
        </div>
      </div>

      {/* --- INFO AREA --- */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Nama & Seller */}
        <div>
          <p className="text-[10px] text-rpn-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <User size={10} /> {seller?.address || "Unknown"}
          </p>
          <h3 className="text-white font-bold text-sm truncate font-pixel">
            {nft?.name || "Unknown Item"}
          </h3>
        </div>

        {/* Price Bar (Dotted Line) */}
        <div className="flex items-end gap-2 border-t border-dashed border-white/10 pt-3 mt-auto">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Price</p>
            <p className="text-xl font-black text-green-400 font-mono leading-none">
              {listing.price} <span className="text-xs text-white">FLOW</span>
            </p>
          </div>

          {/* BUY BUTTON */}
{/* 4. BUY BUTTON (Logika Disable) */}
             <Button
                onClick={() => onBuy(listing.listing_id, listing.price)}
                disabled={isBuying || Boolean(isOwner)} // Disable jika buying ATAU owner
                className={`
                    font-black font-pixel text-xs h-10 px-4 rounded-lg transition-all flex items-center gap-2
                    ${isOwner 
                        ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed" // Style Disabled
                        : "bg-white text-black hover:bg-green-500 hover:text-white shadow-[2px_2px_0px_0px_#22c55e] active:translate-y-1 active:shadow-none" // Style Active
                    }
                `}
             >
                {isBuying ? (
                    "..."
                ) : isOwner ? (
                    // Tampilan jika Owner
                    <>
                        <Ban size={14} /> OWNED
                    </>
                ) : (
                    // Tampilan jika Pembeli
                    <ShoppingCart size={16} />
                )}
             </Button>
        </div>
      </div>

    </div>
  );
}