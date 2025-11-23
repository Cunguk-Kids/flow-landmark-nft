'use client';

import React, { useState } from 'react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useGetEventPasses } from '@/hooks/api/useGetEventPass';
import EventPassCard from '@/components/cards/EventPassCard';
import { Loader2, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyEventPassBox() {
  const { user } = useFlowCurrentUser();
  
  // State Halaman
  const [page, setPage] = useState(1);

  // Fetch Data
  const { data: response, isLoading, isPlaceholderData } = useGetEventPasses(user?.addr, page);
  
  const passes = response?.data || [];
  const pagination = response?.pagination;

  const hasNextPage = pagination ? page < pagination.totalPages : false;
  const hasPrevPage = page > 1;

  return (
    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-lg flex flex-col h-[400px]"> {/* Tinggi fix, lebih pendek dari moments */}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 shrink-0">
        <h3 className="text-lg font-bold text-white uppercase font-pixel text-sm tracking-widest flex items-center gap-2">
          <Ticket size={16} className="text-rpn-blue" />
          Event Passes (SBT)
        </h3>
        <span className="text-[10px] text-rpn-muted bg-rpn-dark px-2 py-1 rounded font-mono border border-white/5">
            TOTAL: {pagination?.totalItems || 0}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        
        {/* Loading */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-rpn-blue gap-2">
                <Loader2 className="animate-spin" size={24} />
                <p className="font-pixel text-[8px] animate-pulse">FETCHING TICKETS...</p>
            </div>
        )}

        {/* Empty */}
        {!isLoading && passes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-rpn-muted gap-3 border-2 border-dashed border-white/5 rounded-xl bg-rpn-dark/30 m-1">
                <Ticket size={32} className="opacity-50" />
                <div className="text-center">
                    <p className="font-bold text-xs text-white">No Passes Found</p>
                    <p className="text-[10px] mt-1 max-w-[180px]">Attend events to earn your Proof of Attendance!</p>
                </div>
            </div>
        )}

        {/* Grid Passes */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2 transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
            {passes.map((pass) => (
                <EventPassCard key={pass.pass_id} pass={pass} />
            ))}
        </div>

      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-3 border-t border-white/10 flex justify-between items-center shrink-0">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={!hasPrevPage || isPlaceholderData}
                className="bg-rpn-dark text-rpn-text border-rpn-blue/30 hover:bg-rpn-blue hover:text-white h-7 w-7 p-0 rounded"
            >
                <ChevronLeft size={14} />
            </Button>

            <span className="text-[10px] font-mono text-rpn-muted">
                PAGE {page} / {pagination.totalPages}
            </span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    if (!isPlaceholderData && hasNextPage) setPage(old => old + 1);
                }}
                disabled={!hasNextPage || isPlaceholderData}
                className="bg-rpn-dark text-rpn-text border-rpn-blue/30 hover:bg-rpn-blue hover:text-white h-7 w-7 p-0 rounded"
            >
                <ChevronRight size={14} />
            </Button>
        </div>
      )}

    </div>
  );
}