'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useGetMomentById } from '@/hooks/api/useGetMomentById';
import { useGetEventPassesByIds } from '@/hooks/api/useGetEventPassesByIds';

interface ProfileShowcaseProps {
  highlightedMomentID?: number;
  highlightedPassIDs?: number[];
}

export default function ProfileShowcase({ highlightedMomentID, highlightedPassIDs = [] }: ProfileShowcaseProps) {
  
  // 1. Fetch Data Momen
  const { data: featuredMoment, isLoading: loadingMoment } = useGetMomentById(highlightedMomentID);

  // 2. Fetch Data Passes (Pastikan array number)
  // Konversi ke number array jika dari props masih string/mixed
  const passIdsNum = highlightedPassIDs.map(Number).filter(id => id > 0);
  const { data: featuredPasses, isLoading: loadingPasses } = useGetEventPassesByIds(passIdsNum);

  return (
    <div className="hidden md:flex absolute bottom-6 left-6 z-30 flex-col gap-3 w-[40%] pointer-events-none">
        
        {/* A. FEATURED MOMENT */}
        {/* Tampilkan loading state skeleton jika sedang fetch */}
        {loadingMoment ? (
             <div className="w-36 h-36 rounded-xl bg-black/50 border-2 border-white/10 animate-pulse"></div>
        ) : featuredMoment ? (
            <div className="relative aspect-square w-36 rounded-xl border-2 border-yellow-500/50 bg-black/50 overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.2)] group pointer-events-auto cursor-help">
                {/* Label "Featured" */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-br z-20">
                    <Star size={8} className="inline mr-1" /> FEATURED
                </div>
                
                {/* Layer 1: Moment */}
                <img 
                    src={featuredMoment.thumbnail} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity absolute inset-0 z-0"
                    style={{imageRendering:'pixelated'}}
                />

                {/* Layer 2: Equipped Accessories (Jika ada data edges) */}
                {featuredMoment.edges?.equipped_accessories?.map((acc: any, idx: number) => (
                    <img 
                       key={acc.id}
                       src={acc.thumbnail}
                       className="w-full h-full object-contain absolute inset-0 z-10"
                       style={{imageRendering:'pixelated', zIndex: 10 + idx}}
                    />
                ))}
            </div>
        ) : (
            // Placeholder jika ID ada tapi data null (atau ID 0)
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center opacity-20">
                <Star size={24} />
            </div>
        )}

        {/* B. FEATURED BADGES (Passes) */}
        <div className="flex gap-2 min-h-[64px]">
            {loadingPasses ? (
                <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse"></div>
            ) : featuredPasses && featuredPasses.length > 0 ? (
                <>
                    {featuredPasses.slice(0, 3).map((pass, idx) => {
                        // Handle struktur data yang mungkin beda (nested vs flat)
                        const thumb = pass.thumbnail || pass.edges?.event?.thumbnail;
                        const name = pass.name || pass.edges?.event?.name;
                        
                        return (
                            <div key={pass.pass_id || idx} className="w-16 h-16 rounded-full bg-black border border-white/20 overflow-hidden relative pointer-events-auto hover:scale-110 transition-transform" title={name}>
                                <img 
                                    src={thumb || ""} 
                                    className="w-full h-full object-cover"
                                />
                                {/* Border Emas untuk Pass pertama */}
                                {idx === 0 && <div className="absolute inset-0 border border-yellow-500/50 rounded-full"></div>}
                            </div>
                        )
                    })}
                    {featuredPasses.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-rpn-dark border border-white/10 flex items-center justify-center text-[8px] text-rpn-muted">
                            +{featuredPasses.length - 3}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    </div>
  );
}