'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { type NFTMoment } from '@/hooks/api/useGetNFTMoment';

// Props yang diterima dari Trigger
interface HighlightMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoadingMoments: boolean;
  moments: NFTMoment[]; // Data momen sudah difetch di parent (trigger)
  currentHighlightId: number | null;
  isPending: boolean;
  onSelect: (id: number | null) => void;
}

export default function HighlightMomentModal({ 
  isOpen, 
  onClose, 
  isLoadingMoments, 
  moments, 
  currentHighlightId, 
  isPending,
  onSelect 
}: HighlightMomentModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[800px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-rpn-blue uppercase font-pixel mb-4">
            Select Featured Moment
          </DialogTitle>
        </DialogHeader>

        <div className="h-[400px] overflow-y-auto p-2 custom-scrollbar">
            
            {/* Loading */}
            {isLoadingMoments && (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rpn-blue" /></div>
            )}

            {/* Empty State */}
            {!isLoadingMoments && moments.length === 0 && (
                <div className="text-center py-20 text-rpn-muted">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-mono text-sm">No moments found.</p>
                    <p className="text-xs mt-2">Mint a moment first to feature it!</p>
                </div>
            )}

            {/* Grid Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Opsi 1: Remove Highlight */}
                <button
                    onClick={() => onSelect(null)}
                    disabled={isPending}
                    className="aspect-square border-2 border-dashed border-red-500/30 hover:border-red-500 rounded-xl flex flex-col items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors gap-2 group"
                >
                    {isPending ? <Loader2 className="animate-spin"/> : <Trash2 />}
                    <span className="text-[10px] font-bold uppercase">Remove Featured</span>
                </button>

                {/* Opsi 2: Daftar Momen */}
                {moments.map((moment) => {
                   const isSelected = Number(currentHighlightId) === Number(moment.nft_id);
                   
                   return (
                    <div 
                        key={moment.nft_id} 
                        className="relative group cursor-pointer" 
                        onClick={() => onSelect(Number(moment.nft_id))}
                    >
                        {/* Card Preview */}
                        <div className={`pointer-events-none transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                             <div className="bg-rpn-card p-2 rounded-lg text-center border border-rpn-blue/20">
                                <div className="w-full aspect-square bg-rpn-dark border border-rpn-blue/30 mb-2 rounded overflow-hidden relative">
                                    
                                    {/* Base Image */}
                                    <img 
                                      src={moment.thumbnail} 
                                      alt={moment.name} 
                                      className="w-full h-full object-cover z-10 absolute inset-0" 
                                      style={{imageRendering:'pixelated'}} 
                                    />

                                    {/* Accessories Layer (Paper Doll Mini) */}
                                    {moment.edges?.equipped_accessories?.map((acc: any, idx: number) => (
                                       <img 
                                          key={acc.id}
                                          src={acc.thumbnail}
                                          className="w-full h-full object-contain z-20 absolute inset-0"
                                          style={{imageRendering:'pixelated', zIndex: 20 + idx}}
                                       />
                                    ))}

                                </div>
                                <p className="text-[10px] text-rpn-blue truncate font-bold">{moment.name}</p>
                             </div>
                        </div>
                        
                        {/* Overlay Selection / Loading */}
                        <div className={`absolute inset-0 border-4 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'border-rpn-blue bg-rpn-blue/20' : 'border-transparent group-hover:border-rpn-blue/50'}`}>
                            {isPending && !isSelected && (
                                <Loader2 className="animate-spin text-rpn-blue" />
                            )}
                             {isSelected && !isPending && (
                                <span className="bg-rpn-blue text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">CURRENT</span>
                            )}
                        </div>
                    </div>
                   );
                })}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}