'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useGetMomentsPaginated } from '@/hooks/api/useGetNFTMoment';
import { useGetAccessories } from '@/hooks/api/useGetAccessories';
import { useSellAccessory } from '@/hooks/transactions/useSellAccessory';
import { useSellMoment } from '@/hooks/transactions/useSellMoment';
import { Loader2, Image as ImageIcon, Package, ArrowLeft, DollarSign } from 'lucide-react';

interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SellStep = 'SELECT_TYPE' | 'SELECT_ITEM' | 'SET_PRICE';
type ItemType = 'MOMENT' | 'ACCESSORY';

export default function SellItemModal({ isOpen, onClose, onSuccess }: SellItemModalProps) {
  const { user } = useFlowCurrentUser();
  
  // --- STATE ---
  const [step, setStep] = useState<SellStep>('SELECT_TYPE');
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [price, setPrice] = useState('');

  // --- DATA FETCHING ---
  const { data: momentsData, isLoading: loadingMoments } = useGetMomentsPaginated(user?.addr);
  const { data: accessoriesData, isLoading: loadingAccessories } = useGetAccessories(user?.addr, 1, 50);

  // --- TRANSACTIONS ---
  const { sell: sellAccessory, isPending: pendingAcc, isSealed: sealedAcc } = useSellAccessory();
  const { sell: sellMoment, isPending: pendingMom, isSealed: sealedMom } = useSellMoment();

  const isPending = pendingAcc || pendingMom;
  const isSealed = sealedAcc || sealedMom;

  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_TYPE');
      setSelectedType(null);
      setSelectedItem(null);
      setPrice('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSealed) {
      onClose();
      onSuccess();
    }
  }, [isSealed]);

  // --- HANDLERS ---
  const handleTypeSelect = (type: ItemType) => {
    setSelectedType(type);
    setStep('SELECT_ITEM');
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setStep('SET_PRICE');
  };

  const handleSell = () => {
    if (!selectedItem || !price) return;
    const priceNum = parseFloat(price);
    
    if (selectedType === 'ACCESSORY') {
        sellAccessory(Number(selectedItem.nft_id), priceNum);
    } else {
        sellMoment(Number(selectedItem.nft_id), priceNum);
    }
  };

  // --- RENDER HELPERS ---
  console.log(accessoriesData?.data)
  const availableAccessories = accessoriesData?.data.filter(item => {
    // HANYA tampilkan jika 'equipped_on_moment' adalah null/undefined
    return !item.edges?.equipped_on_moment && !item.edges?.listing;
  }) || [];
  const itemsToDisplay = selectedType === 'MOMENT' ? momentsData?.data : availableAccessories;
  const isLoading = selectedType === 'MOMENT' ? loadingMoments : loadingAccessories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isPending}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[600px] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.2)] overflow-hidden">
        
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-black text-white uppercase font-pixel flex items-center gap-2">
             <DollarSign className="text-green-500" /> Sell Item
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px] p-2">
            
            {/* STEP 1: SELECT TYPE */}
            {step === 'SELECT_TYPE' && (
                <div className="grid grid-cols-2 gap-4 h-full pt-4">
                    {/* <button
                        onClick={() => handleTypeSelect('MOMENT')}
                        className="bg-rpn-card border-2 border-white/10 hover:border-rpn-blue hover:bg-rpn-blue/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all group"
                    >
                        <div className="p-4 bg-black rounded-full group-hover:scale-110 transition-transform">
                            <ImageIcon size={32} className="text-rpn-blue" />
                        </div>
                        <span className="font-bold uppercase text-sm">Sell Moment</span>
                    </button> */}

                    <button 
                         onClick={() => handleTypeSelect('ACCESSORY')}
                         className="bg-rpn-card border-2 border-white/10 hover:border-rpn-blue hover:bg-rpn-blue/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all group"
                    >
                        <div className="p-4 bg-black rounded-full group-hover:scale-110 transition-transform">
                            <Package size={32} className="text-purple-400" />
                        </div>
                        <span className="font-bold uppercase text-sm">Sell Accessory</span>
                    </button>
                </div>
            )}

            {/* STEP 2: SELECT ITEM */}
            {step === 'SELECT_ITEM' && (
                <div className="h-[350px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rpn-blue" /></div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {itemsToDisplay?.map((item: any) => (
                                <div 
                                    key={item.nft_id}
                                    onClick={() => handleItemSelect(item)}
                                    className="relative aspect-square bg-black border border-white/20 rounded-lg overflow-hidden cursor-pointer hover:border-rpn-blue hover:shadow-[0_0_15px_rgba(41,171,226,0.3)] transition-all group"
                                >
                                    <img src={item.thumbnail} className="w-full h-full object-contain" />
                                    <div className="absolute bottom-0 left-0 w-full bg-black/80 p-1 text-[8px] text-center font-bold truncate">
                                        {item.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button variant="ghost" onClick={() => setStep('SELECT_TYPE')} className="mt-4 text-xs">
                        <ArrowLeft size={12} className="mr-2"/> Back
                    </Button>
                </div>
            )}

            {/* STEP 3: SET PRICE */}
            {step === 'SET_PRICE' && selectedItem && (
                <div className="flex flex-col items-center justify-center h-full pt-8 gap-6">
                    
                    {/* Preview Selected Item */}
                    <div className="w-32 h-32 bg-black border-2 border-rpn-blue rounded-xl overflow-hidden shadow-lg">
                        <img src={selectedItem.thumbnail} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-bold text-lg">{selectedItem.name}</h3>

                    {/* Input Harga */}
                    <div className="w-full max-w-xs">
                        <label className="text-xs font-bold text-rpn-muted uppercase mb-1 block">Listing Price (FLOW)</label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)}
                                className="bg-rpn-card border-rpn-blue/50 text-white pl-4 pr-12 h-12 text-lg font-mono"
                                placeholder="0.0"
                                min="0"
                                step="0.1"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-green-500">
                                FLOW
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full max-w-xs mt-4">
                        <Button variant="outline" onClick={() => setStep('SELECT_ITEM')} className="flex-1 border-white/20">
                            Back
                        </Button>
                        <Button 
                            onClick={handleSell} 
                            disabled={!price || isPending}
                            className="flex-1 bg-green-500 text-black hover:bg-green-400 font-bold font-pixel shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : "LIST ITEM"}
                        </Button>
                    </div>
                </div>
            )}

        </div>

      </DialogContent>
    </Dialog>
  );
}