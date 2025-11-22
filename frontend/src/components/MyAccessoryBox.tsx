'use client';

import { useState } from 'react';
import { useGetAccessories } from '@/hooks/api/useGetAccessories';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import AccessoryCard from '@/components/cards/AccessoryCard';
import { Loader2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyAccessoryBox() {
  const { user } = useFlowCurrentUser();

  // 1. State untuk Halaman
  const [page, setPage] = useState(1);

  // 2. Panggil Hook
  const { data: response, isLoading, isPlaceholderData } = useGetAccessories(user?.addr, page);

  const accessories = response?.data || [];
  const pagination = response?.pagination;

  // Helper: Cek apakah ada halaman berikutnya
  const hasNextPage = pagination ? page < pagination.totalPages : false;
  const hasPrevPage = page > 1;

  return (
    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-lg flex flex-col mt-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 shrink-0">
        <h3 className="text-lg font-bold text-white uppercase font-pixel text-sm tracking-widest flex items-center gap-2">
          <Package size={16} className="text-rpn-blue" />
          My Accessories
        </h3>
        <span className="text-[10px] text-rpn-muted bg-rpn-dark px-2 py-1 rounded font-mono border border-white/5">
          TOTAL: {pagination?.totalItems || 0}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative min-h-[200px]">

        {/* Loading Awal */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-rpn-blue gap-2 py-10">
            <Loader2 className="animate-spin" size={32} />
            <p className="font-pixel text-[10px] animate-pulse">LOADING ITEMS...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && accessories.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-rpn-muted gap-4 border-2 border-dashed border-white/5 rounded-xl bg-rpn-dark/30 m-2 py-10">
            <div className="p-4 bg-rpn-dark rounded-full">
              <Package size={32} className="opacity-50" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-white">No Accessories Yet</p>
              <p className="text-xs mt-1 max-w-[200px]">Collect items to customize your moments!</p>
            </div>
          </div>
        )}

        {/* Accessories Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
          {accessories.map((accessory) => (
            <div key={accessory.nft_id} className="transform hover:scale-[1.02] transition-transform duration-200">
              <AccessoryCard
                accessory={accessory}
                onClick={() => console.log("Open Detail", accessory.nft_id)}
              />
            </div>
          ))}
        </div>

      </div>

      {/* Pagination Controls (Footer) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-4 border-t border-white/10 flex justify-between items-center shrink-0">

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(old => Math.max(old - 1, 1))}
            disabled={!hasPrevPage || isPlaceholderData}
            className="bg-rpn-dark text-rpn-text border-rpn-blue/30 hover:bg-rpn-blue hover:text-white h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft size={16} />
          </Button>

          <span className="text-xs font-mono text-rpn-muted">
            PAGE {page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isPlaceholderData && hasNextPage) {
                setPage(old => old + 1);
              }
            }}
            disabled={!hasNextPage || isPlaceholderData}
            className="bg-rpn-dark text-rpn-text border-rpn-blue/30 hover:bg-rpn-blue hover:text-white h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight size={16} />
          </Button>

        </div>
      )}

    </div>
  );
}
