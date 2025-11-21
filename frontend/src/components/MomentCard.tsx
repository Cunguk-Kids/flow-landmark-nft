'use client';

import { useState } from 'react'; 
import MomentDetailModal from '@/components/modals/MomentDetailModal';

import { Layers, Sparkles } from 'lucide-react';

// Definisi Tipe Data Moment (Sesuai API Go)
export interface Accessory {
  id: number;
  nft_id: number;
  name: string;
  thumbnail: string;
  type?: string; // 'Frame', 'Sticker', etc.
}

export interface MomentData {
  id: number;
  nft_id: number; // ID on-chain
  name: string;
  thumbnail: string;
  description: string;
  edges?: {
    equipped_accessories?: Accessory[];
  };
}

interface MomentCardProps {
  userAddress: string | undefined;
  moment: MomentData;
  hideActions?: boolean; // Opsi untuk menyembunyikan tombol (misal: saat di mode preview)
  onClick?: () => void;  // Opsi klik custom
}

export default function MomentCard({ userAddress, moment, hideActions = false, onClick }: MomentCardProps) {
  // Ambil daftar aksesoris yang terpasang
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const equippedItems = moment.edges?.equipped_accessories || [];

  return (
    <>
      <div 
        onClick={() => setIsDetailOpen(true)}
        className={`
          group relative flex flex-col
          bg-rpn-card border-2 border-rpn-blue rounded-xl overflow-hidden
          shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]
          transition-all duration-300
          hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-rpn-blue)]
          ${onClick ? 'cursor-pointer' : ''}
          `}
          >
        {/* --- 1. VISUAL STACKING AREA (PAPER DOLL) --- */}
        <div className="relative w-full aspect-square bg-rpn-dark overflow-hidden border-b-2 border-rpn-blue">
          
          {/* LAYER 1: GAMBAR DASAR MOMENT (Z-10) */}
          <img 
            src={moment.thumbnail} 
            alt={moment.name}
            className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-105"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
            />

          {/* LAYER 2+: AKSESORIS (Z-20 ke atas) */}
          {equippedItems.map((item, index) => (
            <img 
            key={item.id}
            src={item.thumbnail}
            alt={item.name}
            // Kita asumsikan gambar aksesoris sudah transparan (PNG) dan 1:1
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ 
              imageRendering: 'pixelated', 
              zIndex: 20 + index // Stack di atas moment
            }}
            />
          ))}

          {/* Overlay Gradient Halus */}
          <div className="absolute inset-0 bg-gradient-to-t from-rpn-card via-transparent to-transparent opacity-50 z-30 pointer-events-none" />
          
          {/* Badge Jumlah Item */}
          {equippedItems.length > 0 && (
            <div className="absolute top-2 right-2 z-40 bg-black/60 backdrop-blur-md border border-rpn-blue text-rpn-blue text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Layers size={12} />
                  {equippedItems.length}
              </div>
          )}
        </div>

        {/* --- 2. INFO CONTENT --- */}
        <div className="p-4 flex flex-col flex-1">
          
          {/* Judul & ID */}
          <div className="mb-3">
              <div className="flex justify-between items-start">
                  <h3 className="text-white font-bold font-sans text-sm truncate pr-2" title={moment.name}>
                      {moment.name}
                  </h3>
                  <span className="text-[10px] font-mono text-rpn-muted bg-rpn-dark px-1.5 py-0.5 rounded border border-white/10">
                      #{moment.nft_id}
                  </span>
              </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* --- 3. ACTIONS (Opsional) --- */}
          {!hideActions && (
            <div className="mt-2 pt-3 border-t border-white/10 flex gap-2">
                  {/* Di sini kita bisa memasukkan 'EquipModalTrigger' 
                    yang sudah kita buat sebelumnya. 
                    Kita pass data 'moment' ini ke modal tersebut.
                    */}
                  {/* Contoh Tombol Equip (Placeholder atau Komponen Trigger Anda) */}
                  <button className="flex-1 bg-rpn-blue text-white text-xs font-bold py-2 rounded hover:bg-white hover:text-rpn-blue transition-colors flex items-center justify-center gap-2 uppercase">
                      <Sparkles size={14} />
                      Equip
                  </button>
                  
                  {/* Tombol Detail / Sell */}
                  <button className="px-3 py-2 border border-rpn-muted/30 rounded hover:bg-rpn-dark text-rpn-muted hover:text-white transition-colors">
                      Details
                  </button>
              </div>
          )}
        </div>

      </div>
      <MomentDetailModal
        userAddress={userAddress}
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        moment={moment} 
      />
    </>
  );
}