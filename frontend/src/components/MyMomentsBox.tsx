'use client';

import React, { useState } from 'react';
import { useGetMomentsPaginated } from '@/hooks/api/useGetNFTMoment'; // Import hook baru
import { useFlowCurrentUser } from '@onflow/react-sdk';
import MomentCard from '@/components/MomentCard';
import { Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyMomentsBox() {
  const { user } = useFlowCurrentUser();
  
  // 1. State untuk Halaman
  const [page, setPage] = useState(1);

  // 2. Panggil Hook
  const { data: response, isLoading, isPlaceholderData } = useGetMomentsPaginated(user?.addr, page);
  
  const moments = response?.data || [];
  const pagination = response?.pagination;

  // Helper: Cek apakah ada halaman berikutnya
  const hasNextPage = pagination ? page < pagination.totalPages : false;
  const hasPrevPage = page > 1;

  return (
    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-lg flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 shrink-0">
        <h3 className="text-lg font-bold text-white uppercase font-pixel text-sm tracking-widest flex items-center gap-2">
          <ImageIcon size={16} className="text-rpn-blue" />
          My Moments
        </h3>
        <span className="text-[10px] text-rpn-muted bg-rpn-dark px-2 py-1 rounded font-mono border border-white/5">
            TOTAL: {pagination?.totalItems || 0}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        
        {/* Loading Awal */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-rpn-blue gap-2">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-pixel text-[10px] animate-pulse">LOADING ASSETS...</p>
            </div>
        )}

        {/* Empty State */}
        {!isLoading && moments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-rpn-muted gap-4 border-2 border-dashed border-white/5 rounded-xl bg-rpn-dark/30 m-2">
                <div className="p-4 bg-rpn-dark rounded-full">
                    <ImageIcon size={32} className="opacity-50" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-sm text-white">No Moments Yet</p>
                    <p className="text-xs mt-1 max-w-[200px]">Start minting to build your collection!</p>
                </div>
            </div>
        )}

        {/* Moments Grid */}
        {/* Tambahkan opacity jika sedang fetching background (isPlaceholderData) */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
            {moments.map((moment) => (
                <div key={moment.nft_id} className="transform hover:scale-[1.02] transition-transform duration-200">
                    <MomentCard 
                        moment={{
                            id: moment.id,
                            nft_id: Number(moment.nft_id),
                            name: moment.name,
                            thumbnail: moment.thumbnail,
                            edges: {
                                equipped_accessories: moment.edges?.equipped_accessories?.map(acc => ({
                                    ...acc,
                                    nft_id: Number(acc.nft_id)
                                }))
                            }
                        }} 
                        hideActions={true}
                        onClick={() => console.log("Open Detail", moment.nft_id)}
                        userAddress={user?.addr}
                    />
                </div>
            ))}
        </div>

      </div>

      {/* Pagination Controls (Footer) */}
      {/* Tampilkan hanya jika ada data */}
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