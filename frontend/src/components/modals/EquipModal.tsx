'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetAccessories } from '@/hooks/api/useGetAccessories';
import { useEquipAccessory } from '@/hooks/transactions/useEquipAccessory';
import { useUnequipAccessory } from '@/hooks/transactions/useUnequipAccessory';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2, Check, X, Box } from 'lucide-react';
import { type MomentData } from '@/components/MomentCard';

interface EquipModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: MomentData | null;
}

export default function EquipModal({ isOpen, onClose, moment }: EquipModalProps) {
  const { user } = useFlowCurrentUser();

  // Fetch Inventaris Aksesori User
  const { data: accessoriesData, isLoading: isLoadingItems } = useGetAccessories(user?.addr, 1, 50); // Ambil 50 item sekaligus
  const inventoryItems = accessoriesData?.data || [];

  const [selectedAccessory, setSelectedAccessory] = useState<any | null>(null);
  const { equip, isPending: isEquipping, isSealed: isEquipSealed } = useEquipAccessory();
  const { unequip, isPending: isUnequipping, isSealed: isUnequipSealed } = useUnequipAccessory();

  const isPending = isEquipping || isUnequipping;
  const isSealed = isEquipSealed || isUnequipSealed;

  useEffect(() => {
    if (isOpen) setSelectedAccessory(null);
  }, [isOpen]);

  useEffect(() => {
    if (isSealed) onClose();
  }, [isSealed, onClose]);

  if (!moment) return null;

  // --- LOGIKA PREVIEW ---
  const currentEquipped = moment.edges?.equipped_accessories?.[0];
  // Jika user memilih 'undefined' (klik unequip), preview kosong.
  // Jika user belum memilih (null), tampilkan yg terpasang.
  // Jika user memilih item, tampilkan item itu.
  const previewItem = selectedAccessory === undefined ? null : (selectedAccessory || currentEquipped);

  const handleSave = () => {
    if (selectedAccessory) {
      // Equip new accessory
      equip(Number(moment.nft_id), Number(selectedAccessory.nft_id));
    } else if (selectedAccessory === undefined) {
      // Unequip current accessory
      unequip(Number(moment.nft_id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isPending}>
      {/* PERBAIKAN 1: LEBAR MODAL
         - max-w-7xl: Jauh lebih lebar
         - h-[90vh]: Tinggi hampir penuh layar
      */}
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text max-w-6xl w-[95vw] h-[90vh] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.2)] p-0 overflow-hidden gap-0 flex flex-col md:flex-row outline-none sm:max-w-7xl">

        {/* ================= KIRI: PREVIEW AREA (40%) ================= */}
        <div className="
            relative 
            
            /* MOBILE (Default): 
               - w-full: Lebar penuh.
               - h-auto: Tingginya menyesuaikan isinya (Card). Jangan dipaksa stretch.
               - shrink-0: Jangan biarkan dia mengecil/gepeng.
            */
            w-full h-auto shrink-0

            /* DESKTOP (md): 
               - w-[40%]: Lebar 40%.
               - h-full: Tinggi penuh modal.
            */
            md:w-[40%] md:h-full 
            
            bg-black border-b-2 md:border-b-0 md:border-r-2 border-rpn-blue 
            flex flex-col items-center justify-center 
            p-6 md:p-8
        ">

          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #29ABE2 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          {/* PREVIEW CARD CONTAINER (Kotak Gambar) */}
          <div className="
                relative 
                
                /* KUNCI RASIO 1:1 */
                aspect-square 

                /* UKURAN MOBILE: 
                   - Batasi lebar maksimal agar tidak memenuhi seluruh layar HP.
                   - 260px - 300px biasanya pas di HP (430px width).
                */
                w-64 sm:w-72
                
                /* UKURAN DESKTOP:
                   - Biarkan dia membesar mengisi kolom kiri, tapi jangan terlalu raksasa.
                */
                md:w-full md:max-w-[400px]
                
                border-4 border-rpn-blue 
                rounded-xl overflow-hidden 
                shadow-[0_0_40px_rgba(41,171,226,0.2)] 
                bg-rpn-card group
                z-10
            ">

            {/* Layer 1: Moment (Base) */}
            <img
              src={moment.thumbnail}
              // object-cover: Memaksa gambar mengisi penuh kotak 1:1 (crop jika perlu)
              className="absolute inset-0 w-full h-full object-cover z-10"
              style={{ imageRendering: 'pixelated' }}
              alt="Base"
            />

            {/* Layer 2: Accessory Preview */}
            {previewItem && (
              <img
                src={previewItem.thumbnail}
                // object-contain: Memastikan seluruh bingkai terlihat utuh di dalam kotak 1:1
                className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-300"
                style={{ imageRendering: 'pixelated' }}
                alt="Accessory"
              />
            )}

            {/* Overlay Nama */}
            <div className="absolute bottom-0 left-0 w-full bg-black/70 p-2 text-center translate-y-full group-hover:translate-y-0 transition-transform z-30">
              <p className="text-white font-bold text-sm font-pixel truncate px-2">{moment.name}</p>
            </div>
          </div>

          {/* Status Label */}
          {/* Di Mobile, kita taruh di pojok kiri atas Container, bukan Card, agar tidak menutupi gambar */}
          <div className="absolute top-4 left-4 bg-black/80 border border-rpn-blue/50 px-2 py-1 rounded text-[10px] font-bold font-pixel text-rpn-blue shadow-lg z-0 opacity-50 md:opacity-100">
            PREVIEW MODE
          </div>
        </div>
        {/* ================= KANAN: INVENTORY PICKER (60%) ================= */}
        <div className="w-full md:w-[60%] flex flex-col h-full bg-rpn-dark relative">

          {/* Header */}
          <div className="p-6 border-b border-rpn-blue/20 flex justify-between items-center bg-rpn-card/50 backdrop-blur">
            <div>
              <DialogTitle className="text-xl font-black text-white uppercase font-pixel flex items-center gap-2">
                <Box className="text-rpn-blue" /> Wardrobe
              </DialogTitle>
              <p className="text-xs text-rpn-muted font-mono mt-1">
                Select an item to equip. Changes are saved on-chain.
              </p>
            </div>
            {/* Counter */}
            <div className="bg-rpn-dark px-3 py-1 rounded border border-rpn-blue/30 text-xs font-mono text-rpn-blue">
              {inventoryItems.length} Items
            </div>
          </div>

          {/* Grid Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

            {isLoadingItems ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-rpn-blue">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="font-pixel text-xs">LOADING INVENTORY...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">

                {/* Tombol Lepas (Unequip) */}
                {currentEquipped && (
                  <div
                    onClick={() => setSelectedAccessory(undefined)}
                    className={`
                                    aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2
                                    ${selectedAccessory === undefined
                        ? 'border-red-500 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'border-gray-600 text-gray-500 hover:border-red-400 hover:text-red-400 hover:bg-red-900/10'}
                                `}
                  >
                    <X size={24} />
                    <span className="text-[10px] font-bold uppercase">Unequip</span>
                  </div>
                )}

                {/* List Item */}
                {inventoryItems.length > 0 ? (
                  inventoryItems.map((item: any) => {
                    const isSelected = selectedAccessory?.nft_id === item.nft_id;
                    const isCurrentlyEquipped = currentEquipped?.nft_id === item.nft_id;

                    return (
                      <div
                        key={item.nft_id}
                        onClick={() => setSelectedAccessory(item)}
                        className={`
                                            relative flex flex-col rounded-xl overflow-hidden cursor-pointer border-2 transition-all group
                                            ${isSelected
                            ? 'border-rpn-blue bg-rpn-blue/10 shadow-[0_0_15px_rgba(41,171,226,0.4)] scale-[1.02]'
                            : 'border-white/10 hover:border-rpn-blue/50 bg-rpn-card'}
                                        `}
                      >
                        {/* Bagian Gambar */}
                        <div className="aspect-square w-full p-2 flex items-center justify-center bg-black/20">
                          <img src={item.thumbnail} className="w-full h-full object-contain drop-shadow-md" />
                        </div>

                        {/* PERBAIKAN 3: Teks di Bawah (Bukan Overlay) */}
                        <div className={`p-2 text-center border-t ${isSelected ? 'border-rpn-blue/30 bg-rpn-blue text-black' : 'border-white/5 bg-rpn-card'}`}>
                          <p className={`text-[9px] font-bold uppercase truncate ${isSelected ? 'text-black' : 'text-white group-hover:text-rpn-blue'}`}>
                            {item.name}
                          </p>
                          <p className={`text-[8px] font-mono ${isSelected ? 'text-black/70' : 'text-rpn-muted'}`}>
                            #{item.nft_id}
                          </p>
                        </div>

                        {/* Badge Status */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-rpn-blue text-black rounded-full p-0.5 shadow-sm z-10">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                        {isCurrentlyEquipped && !isSelected && (
                          <div className="absolute top-2 right-2 bg-gray-600 text-white rounded px-1.5 py-0.5 text-[8px] font-bold uppercase opacity-80">
                            Equipped
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-rpn-muted border-2 border-dashed border-white/10 rounded-xl bg-rpn-card/20">
                    <Box size={48} className="opacity-20 mb-2" />
                    <p className="text-sm font-bold">Inventory Empty</p>
                    <p className="text-xs opacity-70">Play Gacha to get accessories!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-rpn-blue/20 bg-rpn-card/50 backdrop-blur flex justify-end gap-4">
            <Button variant="ghost" onClick={onClose} className="text-rpn-muted hover:text-white font-bold hover:bg-white/5">
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || selectedAccessory === null}
              className="bg-rpn-blue text-rpn-dark hover:bg-white font-black font-sans uppercase rounded-lg shadow-[4px_4px_0px_0px_#fff] px-8 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> PROCESSING...</>
              ) : selectedAccessory === undefined ? (
                "CONFIRM UNEQUIP"
              ) : (
                "CONFIRM EQUIP"
              )}
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}