'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EquipModal from '@/components/modals/EquipModal';
import SelectMomentModal from '@/components/modals/SelectMomentModal'; // Import modal baru
import { type NFTMoment } from '@/hooks/api/useGetNFTMoment';

interface CustomizeActionCardProps {
  onSuccess: () => void; // Callback untuk refresh data setelah equip
}

export default function CustomizeActionCard({ onSuccess }: CustomizeActionCardProps) {
  
  // --- STATE ---
  const [isSelectOpen, setIsSelectOpen] = useState(false); // Modal 1
  const [isEquipOpen, setIsEquipOpen] = useState(false);   // Modal 2
  const [targetMoment, setTargetMoment] = useState<any | null>(null); // Data momen yg dipilih

  // --- HANDLER ---
  const handleOpenStudio = () => {
    setIsSelectOpen(true);
  };

  const handleMomentSelected = (moment: NFTMoment) => {
    // 1. Simpan data momen yang dipilih
    setTargetMoment({
        id: moment.id,
        nft_id: Number(moment.nft_id),
        name: moment.name,
        thumbnail: moment.thumbnail,
        edges: moment.edges 
    });
    
    // 2. Tutup modal seleksi, Buka modal equip
    setIsSelectOpen(false);
    setIsEquipOpen(true);
  };

  const handleEquipSuccess = () => {
    // Refresh data global
    onSuccess();
    // Tutup modal equip (biasanya sudah ditangani di dalam EquipModal via isSealed, 
    // tapi kita bisa force close di sini juga)
    setIsEquipOpen(false);
  };

  return (
    <>
      {/* --- UI KARTU --- */}
      <div className="bg-rpn-blue border-2 border-white rounded-2xl p-6 shadow-[0_0_20px_rgba(41,171,226,0.4)] relative overflow-hidden group">
        
        {/* Dekorasi */}
        <div className="absolute -right-4 -top-4 text-black/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
           <Sparkles size={100} />
        </div>
  
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-rpn-dark font-bold font-mono text-xs uppercase tracking-widest">
             <Shirt size={14} />
             Wardrobe
          </div>
  
          <h3 className="text-2xl font-black text-white uppercase font-pixel mb-1 drop-shadow-md leading-tight">
             Styling Studio
          </h3>
          
          <p className="text-xs text-rpn-dark/80 font-sans font-bold mb-4 max-w-[200px]">
             Mix and match accessories to create your unique vibe.
          </p>
  
          <Button 
              onClick={handleOpenStudio}
              className="w-full bg-rpn-dark text-white hover:bg-white hover:text-rpn-dark font-bold border-2 border-transparent hover:border-rpn-dark transition-all shadow-lg flex items-center justify-between group/btn"
          >
              <span className="font-pixel text-xs uppercase">
                  OPEN STUDIO
              </span>
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* --- MODALS FLOW --- */}
      
      {/* 1. Pilih Momen */}
      <SelectMomentModal 
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        onSelect={handleMomentSelected}
      />

      {/* 2. Equip Studio */}
      {/* Render hanya jika targetMoment ada */}
      {targetMoment && (
        <EquipModal 
          isOpen={isEquipOpen}
          onClose={() => setIsEquipOpen(false)}
          moment={targetMoment}
        />
      )}
    </>
  );
}