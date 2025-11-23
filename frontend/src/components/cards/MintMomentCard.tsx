import { useState } from 'react';
import { Plus, PlusSquare } from 'lucide-react';
import MintMomentModal from '@/components/modals/MintMomentModal';

import { cn } from '@/lib/utils';

interface MintMomentCardProps {
  className?: string;
}

export default function MintMomentCard({ className }: MintMomentCardProps) {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsMintModalOpen(true)}
        className={cn(
          "card-brutalist bg-rpn-blue p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-blue-400 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,0.4)]",
          className
        )}
      >

        {/* Background Icon Besar - Reduced size */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <PlusSquare size={80} className="text-black" />
        </div>

        <div className="relative z-10">
          {/* Reduced icon container size */}
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>

          {/* Reduced text size */}
          <h3 className="text-sm font-black text-black uppercase font-pixel mb-1 leading-tight">
            Mint Moment
          </h3>
          <p className="text-[10px] text-black/70 font-bold max-w-[120px] mx-auto leading-tight">
            Create NFT asset.
          </p>
        </div>
      </div>

      <MintMomentModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
      />
    </>
  );
}
