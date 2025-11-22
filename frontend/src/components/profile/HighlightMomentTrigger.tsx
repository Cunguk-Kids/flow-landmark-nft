'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { useGetMomentsPaginated } from '@/hooks/api/useGetNFTMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2 } from 'lucide-react';
import HighlightMomentModal from '@/components/modals/HighlightMomentModal';

interface UserProfileData {
  nickname?: string;
  bio?: string;
  shortDescription?: string;
  pfp?: string;
  bgImage?: string;
  socials?: Record<string, string>;
  highlighted_moment_id?: number; 
}

interface HighlightMomentTriggerProps {
  currentProfile: UserProfileData | null;
  onSuccess: () => void;
}

export default function HighlightMomentTrigger({ currentProfile, onSuccess }: HighlightMomentTriggerProps) {
  const { user } = useFlowCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: myMomentsData, isLoading } = useGetMomentsPaginated(user?.addr);
  const myMoments = myMomentsData?.data || [];
  const featuredMoment = myMoments.find(m => Number(m.nft_id) === Number(currentProfile?.highlighted_moment_id));

  const { updateProfile, isPending, isSealed } = useUpdateProfile();

  useEffect(() => {
    if (isSealed) {
      onSuccess();
      setIsOpen(false);
    }
  }, [isSealed, onSuccess]);

  const handleSelectMoment = (momentID: number | null) => {
    if (!currentProfile) return;
    const payload: UpdateProfileDTO = {
      nickname: currentProfile.nickname,
      bio: currentProfile.bio,
      shortDescription: currentProfile.shortDescription,
      pfp: currentProfile.pfp,
      bgImage: currentProfile.bgImage,
      socials: currentProfile.socials || {},
      momentID: momentID
    };
    updateProfile(payload);
  };

  return (
    <>
      {/* TRIGGER UI */}
      <div 
        onClick={() => setIsOpen(true)} 
        className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-4 shadow-lg cursor-pointer group hover:border-rpn-blue/60 transition-all h-full flex flex-col"
      >
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2 relative z-10">
            <h3 className="text-sm font-bold text-white uppercase font-pixel tracking-widest">
                Featured Moment
            </h3>
            <span className="text-[8px] text-rpn-blue bg-rpn-blue/10 px-1.5 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                EDIT
            </span>
        </div>

        {/* --- PERUBAHAN UTAMA DI SINI --- */}
        {/* Gunakan 'aspect-square' (1:1) dan 'w-full' */}
        {/* 'mx-auto' agar kotak tetap di tengah */}
        <div className="w-full aspect-square bg-rpn-dark/50 rounded-xl border-2 border-dashed border-rpn-blue/20 flex flex-col items-center justify-center text-rpn-muted hover:border-rpn-blue hover:bg-rpn-dark/80 transition-all overflow-hidden relative z-10">
            
            {currentProfile?.highlighted_moment_id ? (
                <div className="w-full h-full pointer-events-none relative">
                   {featuredMoment ? (
                       <>
                           {/* Layer 1: Momen */}
                           <img 
                             src={featuredMoment.thumbnail} 
                             alt="Featured" 
                             className="w-full h-full object-cover absolute inset-0 z-10"
                             style={{ imageRendering: 'pixelated' }}
                           />
                           
                           {/* Layer 2: Aksesoris (FIT PERFECTLY KARENA 1:1) */}
                           {featuredMoment.edges?.equipped_accessories?.map((acc: any, idx: number) => (
                               <img 
                                  key={acc.id}
                                  src={acc.thumbnail}
                                  alt="Accessory"
                                  className="w-full h-full object-contain absolute inset-0 z-20"
                                  style={{ imageRendering: 'pixelated', zIndex: 20 + idx }}
                               />
                           ))}
                       </>
                   ) : (
                       <div className="flex items-center justify-center h-full">
                           <Loader2 className="animate-spin text-rpn-blue" />
                       </div>
                   )}
                   
                   <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-2 py-1 rounded font-mono z-30 backdrop-blur-sm">
                      #{currentProfile.highlighted_moment_id}
                   </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                    <span className="text-3xl opacity-30 grayscale group-hover:grayscale-0 transition-all">🖼️</span>
                    <p className="text-[10px] uppercase font-bold text-rpn-muted group-hover:text-rpn-blue">Select</p>
                </div>
            )}
        </div>
      </div>

      {/* MODAL (Tetap sama) */}
      <HighlightMomentModal 
        isLoadingMoments={isLoading}
         isOpen={isOpen}
         onClose={() => setIsOpen(false)}
         moments={myMoments}
         currentHighlightId={currentProfile?.highlighted_moment_id || null}
         isPending={isPending}
         onSelect={handleSelectMoment}
      />
    </>
  );
}