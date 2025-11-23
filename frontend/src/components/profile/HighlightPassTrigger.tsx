'use client';

import { useState } from 'react';
import { Ticket, Plus } from 'lucide-react';
import HighlightPassModal from '@/components/modals/HighlightPassModal';

interface HighlightPassTriggerProps {
  currentProfile: any; // Gunakan UserProfileData di atas
  onSuccess: () => void;
}

export default function HighlightPassTrigger({ currentProfile, onSuccess }: HighlightPassTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const highlightedIDs = currentProfile?.highlighted_eventPass_ids || [];

  const myPasses = currentProfile?.edges?.event_passes || [];

  const highlightedPasses = highlightedIDs.map((id: any) =>
    myPasses.find((p: any) => Number(p.pass_id) === Number(id))
  ).filter(Boolean);

  return (
    <>
      {/* TRIGGER UI */}
      <div
        onClick={() => setIsOpen(true)}
        className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-4 shadow-lg cursor-pointer group hover:border-rpn-blue/60 transition-all h-full flex flex-col"
      >
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2 relative z-10">
          <h3 className="text-sm font-bold text-white uppercase font-pixel tracking-widest flex items-center gap-2">
            Featured Event Pass
          </h3>
          <span className="text-[8px] text-rpn-blue bg-rpn-blue/10 px-1.5 py-0.5 rounded font-mono md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <span className="md:hidden">TAP TO EDIT</span>
            <span className="hidden md:inline">EDIT</span>
          </span>
        </div>

        {/* GRID 2x2 */}
        <div className="flex-1 bg-rpn-dark/30 rounded-xl border-2 border-dashed border-rpn-blue/10 p-2 flex items-center justify-center relative overflow-hidden">

          {highlightedPasses.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 w-full h-full">
              {/* Render Slot 1-4 */}
              {[0, 1, 2, 3].map((i) => {
                const pass = highlightedPasses[i];
                return (
                  <div key={i} className="aspect-square bg-rpn-card border border-white/5 rounded-lg overflow-hidden relative flex items-center justify-center group/item">
                    {pass ? (
                      <>
                        <img
                          src={pass.thumbnail}
                          alt="Badge"
                          className="w-full h-full object-cover"
                        />
                        {/* Tooltip Nama Event */}
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-[6px] text-white text-center py-0.5 truncate px-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          {pass.name}
                        </div>
                      </>
                    ) : (
                      // Slot Kosong
                      <div className="opacity-20">
                        <Plus size={12} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            // Kosong Total
            <div className="flex flex-col items-center gap-2 opacity-50 group-hover:scale-110 transition-transform">
              <Ticket size={32} className="text-rpn-muted" />
              <p className="text-[8px] font-bold uppercase text-rpn-muted">Select Badges</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {/* Kita kirim 'myPasses' langsung ke modal agar tidak perlu fetch lagi */}
      <HighlightPassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
        currentProfile={currentProfile}
        userPasses={myPasses}
      />
    </>
  );
}