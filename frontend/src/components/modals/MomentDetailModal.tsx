'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type MomentData } from '@/components/MomentCard';
import { Layers, Calendar, Hash, Sparkles, Box, ExternalLink, Loader2, MonitorPlay } from 'lucide-react';
import { useGetNFTDetail } from '@/hooks/scripts/useGetNFTDetail';

interface MomentDetailModalProps {
  userAddress: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  moment: MomentData | null;
}

export default function MomentDetailModal({ isOpen, onClose, moment, userAddress }: MomentDetailModalProps) {
  
  const { data: detailData, isLoading } = useGetNFTDetail({ 
    address: userAddress || '', 
    id: moment ? Number(moment.nft_id) : 0 
  });

  const traits = useMemo(() => {
    if (!detailData?.traits?.traits) return {};
    return detailData.traits.traits.reduce((acc: any, t: any) => {
      acc[t.name] = t.value;
      return acc;
    }, {});
  }, [detailData]);

  const mintedDate = useMemo(() => {
    if (traits.mintedTime) {
        return new Date(parseFloat(traits.mintedTime) * 1000).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }
    return 'Unknown';
  }, [traits.mintedTime]);

  if (!moment) return null;

  const display = {
    name: detailData?.name || moment.name,
    description: detailData?.description || moment.description,
    thumbnail: detailData?.thumbnail || moment.thumbnail,
    collectionName: detailData?.collectionName || "Harkon Moments",
    serial: detailData?.serialNumber || moment.nft_id,
    // Kita gunakan data dari props moment untuk equipped items karena lebih cepat (dari indexer)
    equippedItems: moment.edges?.equipped_accessories || [] 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* PERUBAHAN 1: LEBAR MODAL 
         - max-w-6xl (Lebih lebar)
         - h-[90vh] (Tinggi maksimal 90% layar agar tidak kepotong di laptop kecil)
         - w-[95vw] (Lebar responsif)
      */}
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text max-w-6xl sm:max-w-6xl w-[95vw] h-[90vh] md:h-auto md:max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.2)] p-0 overflow-hidden gap-0 flex flex-col md:flex-row outline-none">
        
        {/* ================= KIRI: GAMBAR (Paper Doll) ================= */}
        {/* - md:w-[45%]: Kita beri porsi gambar sedikit lebih kecil (45%) agar teks (55%) lebih lega 
            - bg-black: Agar kontras gambar lebih baik
        */}
        <div className="relative w-full md:w-[45%] h-64 md:h-auto bg-black border-b-2 md:border-b-0 md:border-r-2 border-rpn-blue overflow-hidden group shrink-0">
            
            {/* Pattern Grid Halus */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #29ABE2 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            {/* --- LAYER UTAMA: MOMENT --- */}
            <img 
                src={display.thumbnail} 
                alt={display.name}
                className="absolute inset-0 w-full h-full object-cover z-10"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* --- SCENARIO EQUIP: LAYER AKSESORIS --- */}
            {/* Jika ada aksesoris:
                1. Mereka di-render di atas (z-index > 10).
                2. Menggunakan 'object-contain' agar proporsinya pas (tidak ke-crop).
                3. 'pointer-events-none' agar klik tembus ke bawah.
            */}
            {display.equippedItems.map((item, index) => (
                <img 
                    key={item.id}
                    src={item.thumbnail}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ imageRendering: 'pixelated', zIndex: 20 + index }}
                />
            ))}
            
            {/* Overlay Gradient Bawah (Agar text badge terbaca) */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />

            {/* Badge ID (Pojok Kiri Atas) */}
            <div className="absolute top-4 left-4 z-30 bg-rpn-dark/90 backdrop-blur border border-rpn-blue/50 px-3 py-1.5 rounded text-sm font-bold text-white uppercase font-mono shadow-lg">
                #{display.serial}
            </div>
            
            {/* Badge Tier (Pojok Kanan Bawah) */}
            {traits.tier && (
                <div className="absolute bottom-4 right-4 z-30 bg-rpn-blue text-rpn-dark px-4 py-1.5 rounded-lg text-sm font-black uppercase font-pixel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {traits.tier}
                </div>
            )}
        </div>

        {/* ================= KANAN: DETAIL INFO (Scrollable) ================= */}
        {/* md:w-[55%]: Area lebih lebar untuk teks */}
        <div className="w-full md:w-[55%] flex flex-col h-full bg-rpn-dark relative">
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-rpn-dark/90 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 text-rpn-blue">
                        <Loader2 className="animate-spin w-8 h-8" />
                        <span className="font-pixel text-xs tracking-widest">DECRYPTING METADATA...</span>
                    </div>
                </div>
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                
                {/* 1. Header Section */}
                <div className="pr-8"> {/* Padding kanan agar tidak nabrak tombol close */}
                    <div className="flex items-center gap-2 text-rpn-muted text-xs font-bold uppercase tracking-[0.2em] mb-3">
                        <Box size={14} className="text-rpn-blue" />
                        {display.collectionName}
                    </div>
                    <DialogTitle className="text-4xl md:text-5xl font-black text-white uppercase font-pixel leading-tight break-words drop-shadow-lg mb-4">
                        {display.name}
                    </DialogTitle>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-rpn-card px-3 py-1.5 rounded border border-rpn-blue/30">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-rpn-blue font-mono">
                                Owner: <span className="text-white">{userAddress}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Description Box */}
                <div>
                    <h4 className="text-rpn-muted text-[10px] font-bold uppercase font-sans mb-2 tracking-wider">DESCRIPTION_LOG</h4>
                    <div className="bg-rpn-card border-l-4 border-rpn-blue p-4 rounded-r-lg">
                        <p className="text-sm text-gray-300 leading-relaxed font-mono italic">
                            "{display.description || "No description provided."}"
                        </p>
                    </div>
                </div>

                {/* 3. Attributes Grid (Bento) */}
                <div>
                    <h4 className="text-white text-xs font-bold uppercase font-pixel mb-4 flex items-center gap-2">
                        <Sparkles size={14} className="text-rpn-blue" /> Attributes
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-rpn-card p-3 rounded-lg border border-rpn-blue/20 hover:border-rpn-blue/50 transition-colors">
                            <p className="text-[10px] text-rpn-muted uppercase font-bold mb-1">Tier Class</p>
                            <p className="text-sm text-white font-bold uppercase tracking-wide">{traits.tier || "Standard"}</p>
                        </div>
                        <div className="bg-rpn-card p-3 rounded-lg border border-rpn-blue/20 hover:border-rpn-blue/50 transition-colors">
                            <p className="text-[10px] text-rpn-muted uppercase font-bold mb-1 flex items-center gap-1">
                                 <Calendar size={10} /> Mint Date
                            </p>
                            <p className="text-sm text-white font-bold">{mintedDate}</p>
                        </div>
                         <div className="bg-rpn-card p-3 rounded-lg border border-rpn-blue/20 hover:border-rpn-blue/50 transition-colors">
                            <p className="text-[10px] text-rpn-muted uppercase font-bold mb-1 flex items-center gap-1">
                                 <Hash size={10} /> Block Height
                            </p>
                            <p className="text-sm text-white font-bold font-mono">{traits.mintedBlock || "N/A"}</p>
                        </div>
                        <div className="bg-rpn-card p-3 rounded-lg border border-rpn-blue/20 hover:border-rpn-blue/50 transition-colors">
                            <p className="text-[10px] text-rpn-muted uppercase font-bold mb-1 flex items-center gap-1">
                                 <MonitorPlay size={10} /> Items
                            </p>
                            <p className="text-sm text-white font-bold">{display.equippedItems.length} Equipped</p>
                        </div>
                    </div>
                </div>

                {/* 4. SCENARIO EQUIP: INVENTORY LIST */}
                <div>
                    <h4 className="text-rpn-blue text-xs font-bold uppercase font-pixel mb-4 flex items-center gap-2">
                        <Layers size={14} /> Equipped Inventory ({display.equippedItems.length})
                    </h4>

                    {display.equippedItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {display.equippedItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 bg-rpn-card p-2 rounded-lg border border-white/5 hover:border-rpn-blue/40 transition-colors group cursor-default">
                                    {/* Thumbnail Aksesoris */}
                                    <div className="w-12 h-12 bg-rpn-dark rounded border border-white/10 overflow-hidden shrink-0 relative">
                                        <img src={item.thumbnail} className="w-full h-full object-contain" />
                                    </div>
                                    {/* Info Aksesoris */}
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate group-hover:text-rpn-blue transition-colors">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] text-rpn-muted font-mono truncate">
                                            ID: #{item.nft_id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 border-2 border-dashed border-rpn-blue/20 rounded-xl bg-rpn-card/30 text-center">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Empty Slots</p>
                            <p className="text-[10px] text-rpn-muted">
                                Visit your inventory to equip accessories.
                            </p>
                        </div>
                    )}
                </div>
                
            </div>

            {/* 5. Footer (Sticky) */}
            {detailData?.collectionExternalURL && (
                <div className="p-6 border-t border-rpn-blue/20 bg-rpn-card/50">
                     <a 
                        href={detailData.collectionExternalURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-rpn-dark hover:bg-rpn-blue hover:text-rpn-dark text-white py-3 rounded-lg border border-rpn-blue transition-all uppercase tracking-wider"
                    >
                        <ExternalLink size={14} />
                        View Collection on Explorer
                    </a>
                </div>
            )}

        </div>

      </DialogContent>
    </Dialog>
  );
}