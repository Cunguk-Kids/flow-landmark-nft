'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetMomentsPaginated, type NFTMoment } from '@/hooks/api/useGetNFTMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import MomentCard from '@/components/MomentCard';
import { useUnequipAccessory } from '@/hooks/transactions/useUnequipAccessory';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SelectMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (moment: NFTMoment) => void; // Callback saat dipilih
}

export default function SelectMomentModal({ isOpen, onClose, onSelect }: SelectMomentModalProps) {
  const { user } = useFlowCurrentUser();

  // Fetch semua momen user
  const { data: momentsData, isLoading, refetch } = useGetMomentsPaginated(user?.addr);
  const moments = momentsData?.data || [];

  const { unequip, isPending, isSealed } = useUnequipAccessory();

  // Auto close and refetch when unequip is successful
  useEffect(() => {
    if (isSealed) {
      refetch();
    }
  }, [isSealed, refetch]);

  const handleUnequip = (e: React.MouseEvent, momentId: number) => {
    e.stopPropagation(); // Prevent triggering onSelect
    unequip(momentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[800px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-rpn-blue uppercase font-pixel mb-4">
            Select Moment to Customize
          </DialogTitle>
        </DialogHeader>

        <div className="h-[400px] overflow-y-auto p-2 custom-scrollbar">

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rpn-blue" /></div>
          )}

          {/* Empty State */}
          {!isLoading && moments.length === 0 && (
            <div className="text-center py-20 text-rpn-muted">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p className="font-mono text-sm">No moments found.</p>
              <p className="text-xs mt-2">Mint a moment first!</p>
            </div>
          )}

          {/* Grid Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {moments.map((moment) => {
              const hasEquipped = moment.edges?.equipped_accessories && moment.edges.equipped_accessories.length > 0;

              return (
                <div
                  key={moment.nft_id}
                  className="relative group cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => onSelect(moment)} // Pilih momen ini
                >
                  {/* Card Preview */}
                  <div className="pointer-events-none">
                    <MomentCard
                      moment={moment}
                      hideActions={true}
                    />
                  </div>

                  {/* Equipped Badge */}
                  {hasEquipped && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg z-10">
                      EQUIPPED
                    </div>
                  )}

                  {/* Unequip Button (Only show if equipped) */}
                  {hasEquipped && (
                    <Button
                      onClick={(e) => handleUnequip(e, Number(moment.nft_id))}
                      disabled={isPending}
                      className="absolute bottom-2 right-2 z-20 pointer-events-auto bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-rpn-blue rounded-xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="bg-rpn-blue text-white text-xs font-bold px-3 py-1 rounded shadow-lg font-pixel uppercase">
                      CUSTOMIZE
                    </span>
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