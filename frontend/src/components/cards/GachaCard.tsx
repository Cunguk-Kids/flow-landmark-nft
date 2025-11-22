'use client';

import React, { useState } from 'react';
import { Package, Sparkles, Dices } from 'lucide-react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Button } from '@/components/ui/button';
import GachaModal from '@/components/modals/GachaModal'; // Kita akan buat ini nanti, atau pakai logika modal yg sudah ada
// import { useBuyGacha } from '@/hooks/transactions/useBuyGacha'; // Hook transaksi

interface GachaCardProps {
  className?: string;
}

export default function GachaCard({ className = "" }: GachaCardProps) {
  const { user } = useFlowCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenGacha = () => {
    if (!user?.loggedIn) {
      alert("Please connect wallet first!");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`
        col-span-1 row-span-2 md:col-span-2 md:row-span-2 
        card-brutalist bg-white border-2 border-rpn-dark 
        p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer
        hover:shadow-[0_0_30px_rgba(41,171,226,0.3)] transition-all duration-300
        ${className}
      `}
      onClick={handleOpenGacha}
      >
        
        {/* Dekorasi Latar Belakang (Pola RPN) */}
        <div className="absolute inset-0 opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, #29ABE2 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
        </div>

        {/* Header Kecil */}
        <div className="flex justify-between items-start relative z-10">
             <div className="flex items-center gap-2">
                <span className="bg-rpn-blue text-white text-[10px] font-bold px-2 py-1 rounded font-pixel uppercase animate-pulse">
                    New Drop
                </span>
             </div>
             <Dices size={20} className="text-rpn-muted group-hover:text-rpn-blue transition-colors" />
        </div>

        {/* KONTEN UTAMA: BOX VISUAL */}
        <div className="flex-1 flex items-center justify-center relative">
            
            {/* Efek Glow di belakang box */}
            <div className="absolute w-32 h-32 bg-rpn-blue/20 blur-2xl rounded-full group-hover:bg-rpn-blue/40 transition-all duration-500"></div>

            {/* Ikon Box yang Bergetar saat Hover */}
            <div className="relative transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:rotate-3">
                <Package size={80} strokeWidth={1.5} className="text-rpn-dark drop-shadow-xl" />
                
                {/* Partikel Sparkle (Hiasan) */}
                <Sparkles size={24} className="absolute -top-4 -right-4 text-rpn-blue animate-bounce delay-75" />
                <Sparkles size={16} className="absolute top-10 -left-6 text-yellow-400 animate-pulse" />
            </div>
        </div>

        {/* Footer: Teks & Tombol */}
        <div className="relative z-10 text-center">
            <h3 className="text-2xl font-black text-rpn-dark uppercase font-pixel mb-1 leading-none">
                Accessory <br/> <span className="text-rpn-blue">Gacha</span>
            </h3>
            <p className="text-xs text-gray-500 font-mono mb-4">
                Get rare frames & stickers!
            </p>

            <Button 
                className="w-full bg-rpn-dark text-white hover:bg-rpn-blue hover:text-white font-bold font-pixel text-xs py-6 rounded-lg shadow-[4px_4px_0px_0px_#29ABE2] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#29ABE2] active:translate-y-[2px] active:shadow-none transition-all border-2 border-transparent hover:border-rpn-dark"
            >
                OPEN PACK • 1 FLOW
            </Button>
        </div>

      </div>

      {/* MODAL GACHA (Nanti diintegrasikan) */}
      <GachaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}