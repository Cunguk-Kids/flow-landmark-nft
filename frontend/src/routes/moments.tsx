import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGetMoments } from "@/hooks/api/useGetMoments";
import MomentPostCard from "@/components/cards/MomentPostCard";
import { Loader2, ArrowLeft, Camera } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useFlowCurrentUser } from "@onflow/react-sdk";

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
  } = useGetMoments(user?.addr);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-4 md:px-0">
      {/* Header Fixed */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-rpn-dark/10">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="font-pixel text-xl uppercase">Moments Feed</h1>

          <div className="w-10 h-10 flex items-center justify-center">
            <Camera size={24} className="text-rpn-blue" />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {status === "pending" ? (
          <div className="flex flex-col items-center justify-center py-20 text-rpn-muted animate-pulse font-pixel text-xs">
            <Loader2 className="w-10 h-10 mb-4 animate-spin" />
            LOADING MOMENTS...
          </div>
        ) : status === "error" ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-bold">Error loading moments.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-0">
              {data?.pages.map((page) =>
                page.data.map((moment) => (
                  <MomentPostCard key={moment.id} moment={moment} />
                ))
              )}
            </div>

            {/* Loading Indicator for Infinite Scroll */}
            <div ref={ref} className="py-8 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 animate-spin text-rpn-muted" />
              )}
              {!hasNextPage && (
                <p className="text-xs text-rpn-muted font-bold uppercase tracking-widest">
                  You've reached the end
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
