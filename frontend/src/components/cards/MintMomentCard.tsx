import { useState } from 'react';
import { Plus, PlusSquare } from 'lucide-react';
import MintMomentModal from '@/components/modals/MintMomentModal';

export default function MintMomentCard() {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsMintModalOpen(true)}
        className="col-span-1 row-span-2 md:col-span-2 md:row-span-2 card-brutalist bg-rpn-blue p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-blue-400 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,0.4)]"
      >

        {/* Background Icon Besar */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <PlusSquare size={120} className="text-black" />
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>

          <h3 className="text-xl font-black text-black uppercase font-pixel mb-1">
            Mint Moment
          </h3>
          <p className="text-xs text-black/70 font-bold max-w-[150px] mx-auto">
            Turn your photo into a permanent NFT asset.
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
