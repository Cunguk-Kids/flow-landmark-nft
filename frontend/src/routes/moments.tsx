import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGetMoments } from "@/hooks/api/useGetMoments"; // Pastikan hook ini support infinite query
import MomentPostCard from "@/components/cards/MomentPostCard";
import { Loader2, ArrowLeft, Camera, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useFlowCurrentUser } from "@onflow/react-sdk";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/moments")({
  component: MomentsPage,
});

function MomentsPage() {
  const navigate = useNavigate();
  const { user } = useFlowCurrentUser();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useGetMoments(user?.addr); // Pastikan hook Anda menerima argumen user?.addr (atau null untuk public feed)

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans relative selection:bg-rpn-blue selection:text-white">

      {/* Background Grid (Fixed) */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#29ABE2 1px, transparent 1px), linear-gradient(90deg, #29ABE2 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* HEADER (Sticky Top) */}
      <div className="sticky top-0 z-40 bg-rpn-dark/90 backdrop-blur-md border-b-2 border-rpn-blue shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Back Button */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="
                p-2 -ml-2 
                text-rpn-blue hover:text-white hover:bg-rpn-blue/20 
                rounded-lg transition-all 
                border border-transparent hover:border-rpn-blue/50
            "
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>

          {/* Title */}
          <div className="flex flex-col items-center">
            <h1 className="font-pixel text-lg md:text-xl uppercase text-white tracking-widest drop-shadow-md">
              LIVE FEED
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-mono text-rpn-blue">Connection Secure</span>
            </div>
          </div>

          {/* Action / Refresh */}
          <button
            onClick={() => refetch()}
            className="w-10 h-10 flex items-center justify-center text-rpn-blue hover:text-white hover:bg-rpn-blue/20 rounded-lg transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* FEED CONTENT */}
      <div className="max-w-xl mx-auto relative z-10 min-h-screen border-x border-white/5 bg-black/20">

        {status === "pending" ? (
          <div className="flex flex-col items-center justify-center py-40 text-rpn-blue animate-pulse font-pixel text-xs">
            <div className="w-12 h-12 border-4 border-t-rpn-blue border-r-rpn-blue border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            SYNCING DATA...
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-500 font-bold font-pixel text-sm mb-2">SYSTEM ERROR</p>
            <p className="text-xs text-rpn-muted mb-4">Could not retrieve feed data.</p>
            <Button onClick={() => refetch()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              RETRY CONNECTION
            </Button>
          </div>
        ) : (
          <>
            {/* Feed Stream */}
            <div className="flex flex-col gap-0 divide-y divide-white/10">
              {data?.pages.map((page) =>
                page.data.map((moment) => (
                  <MomentPostCard key={moment.id} moment={moment} />
                ))
              )}

              {/* Empty State */}
              {data?.pages[0]?.data.length === 0 && (
                <div className="py-20 text-center opacity-50">
                  <Camera size={48} className="mx-auto mb-4 text-rpn-muted" />
                  <p className="font-pixel text-xs text-rpn-muted">NO SIGNALS FOUND</p>
                </div>
              )}
            </div>

            {/* Loading Indicator (Infinite Scroll) */}
            <div ref={ref} className="py-12 flex justify-center border-t border-white/10">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-rpn-blue text-xs font-mono animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>FETCHING MORE...</span>
                </div>
              ) : !hasNextPage && data?.pages[0]?.data.length > 0 ? (
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <div className="w-1 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                  <p className="text-[10px] text-rpn-muted font-bold uppercase tracking-[0.3em]">
                    END OF TRANSMISSION
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}