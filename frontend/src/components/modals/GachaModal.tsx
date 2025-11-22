'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBuyGacha } from '@/hooks/transactions/useBuyGacha';
import { useRevealGacha } from '@/hooks/transactions/useRevealGacha';
import { useCheckReceipt } from '@/hooks/scripts/useCheckReceipt';
import { Package, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowCurrentUser } from '@onflow/react-sdk';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Definisi Step Flow
type GachaStep = 'IDLE' | 'BUYING' | 'READY_TO_OPEN' | 'REVEALING' | 'FINISHED';

export default function GachaModal({ isOpen, onClose }: GachaModalProps) {
  const { user } = useFlowCurrentUser();
  // State untuk melacak proses
  const [step, setStep] = useState<GachaStep>('IDLE');

  const { 
    hasReceipt, 
    isLoading: isChecking, 
    refetch: refetchReceipt 
  } = useCheckReceipt(user?.addr || "");

  // Hooks Transaksi
  const { 
    buyPack, 
    isPending: isBuying, 
    isSealed: isBuySealed, 
    reset: resetBuy,
    error: buyError
  } = useBuyGacha();

  const { 
    revealPack, 
    isPending: isRevealing, 
    isSealed: isRevealSealed, 
    reset: resetReveal,
    error: revealError
  } = useRevealGacha();

  // --- EFEK PERUBAHAN STATE ---

  useEffect(() => {
    if (isOpen && user?.addr) {
      console.log('masuk ga')
      refetchReceipt();
    }
  }, [isOpen, user?.addr]);

  // 1. Jika Buy Selesai -> Pindah ke state READY_TO_OPEN
  useEffect(() => {
    if (hasReceipt && (step === 'IDLE' || step === "BUYING")) {
      setStep('READY_TO_OPEN');
    }
  }, [hasReceipt, step]);

  useEffect(() => {
    if (isBuySealed) {
      refetchReceipt();
      resetBuy();
    }
  }, [isBuySealed]);

  // 2. Jika Reveal Selesai -> Pindah ke state FINISHED
  useEffect(() => {
    if (isRevealSealed) {
      setStep('FINISHED');
      resetReveal();
      resetBuy();
      refetchReceipt();
    }
  }, [isRevealSealed]);

  // Reset modal jika ditutup
  useEffect(() => {
    if (!isOpen) {
      // Delay sedikit agar animasi close selesai baru reset state
      setTimeout(() => setStep('IDLE'), 300);
    }
  }, [isOpen]);


  // --- HANDLERS ---

  const handleBuyClick = () => {
    setStep('BUYING');
    buyPack();
  };

  const handleOpenClick = () => {
    setStep('REVEALING');
    revealPack();
  };

  const handleClose = () => {
    onClose();
  };

  // Error Handling Sederhana
  const error = buyError || revealError;
  console.log(isBuySealed, isRevealSealed, 'sealed')
  console.log(step, "step")
  console.log(hasReceipt, "woi receipt")
  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={!isBuying && !isRevealing}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-white sm:max-w-[400px] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.3)] p-8 text-center overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #29ABE2 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <AnimatePresence mode='wait'>
          
          {/* --- STATE: FINISHED (ITEM GET) --- */}
          {step === 'FINISHED' ? (
            <motion.div 
                key="result"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center z-10 relative"
            >
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-black text-rpn-blue font-pixel mb-2">ITEM RECEIVED!</h2>
                <p className="text-xs text-gray-400 mb-6 font-mono">Item has been sent to your inventory.</p>
                
                <Button onClick={handleClose} className="w-full bg-rpn-blue text-black font-bold font-pixel">
                    AWESOME
                </Button>
            </motion.div>

          ) : (

            /* --- STATE: MAIN FLOW --- */
            <motion.div 
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="z-10 relative flex flex-col items-center"
            >
                {/* JUDUL DINAMIS */}
                <h2 className="text-2xl font-black text-white uppercase font-pixel mb-2">
                    {step === 'BUYING' ? "PURCHASING..." : 
                     step === 'READY_TO_OPEN' ? "PACK RECEIVED!" : 
                     step === 'REVEALING' ? "OPENING..." : 
                     "GACHA SHOP"}
                </h2>

                {/* STATUS TEXT */}
                <p className="text-xs text-rpn-blue font-mono mb-8 bg-rpn-blue/10 px-3 py-1 rounded-full">
                    {step === 'IDLE' ? "1 Pack = 1.0 FLOW" : 
                     step === 'READY_TO_OPEN' ? "Tap below to reveal your item" : 
                     "Please wait for transaction..."}
                </p>

                {/* VISUAL BOX ANIMATION */}
                <div className="relative mb-8">
                    <motion.div
                        animate={
                            step === 'BUYING' ? { rotate: [0, 5, -5, 0] } : 
                            step === 'REVEALING' ? { 
                                y: [0, -20, 0], 
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.2, 1] 
                            } : {}
                        }
                        transition={
                            step === 'REVEALING' 
                                ? { duration: 0.5, repeat: Infinity } 
                                : { duration: 1, repeat: Infinity, repeatDelay: 0.5 }
                        }
                    >
                        <Package 
                            size={120} 
                            strokeWidth={1} 
                            className={`drop-shadow-[0_0_30px_rgba(41,171,226,0.6)] ${step === 'READY_TO_OPEN' ? "text-white fill-white/10" : "text-rpn-muted"}`} 
                        />
                    </motion.div>
                    
                    {/* Efek Partikel saat Ready */}
                    {step === 'READY_TO_OPEN' && (
                        <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-pulse" size={32} />
                    )}
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-red-200 text-[10px] font-mono break-words w-full">
                        Error: {error.message}
                    </div>
                )}

                {/* TOMBOL AKSI (BERUBAH SESUAI STATE) */}
                {step === 'READY_TO_OPEN' ? (
                    <Button 
                        onClick={handleOpenClick}
                        disabled={isRevealing} // Disable saat sedang reveal
                        className="w-full h-14 bg-white text-rpn-dark hover:bg-rpn-blue hover:text-white font-black font-pixel text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all animate-pulse"
                    >
                        {isRevealing ? <Loader2 className="animate-spin mr-2" /> : null}
                        OPEN NOW
                    </Button>
                ) : (
                    <Button 
                        onClick={handleBuyClick}
                        disabled={step !== 'IDLE'} // Disable jika sedang buying atau revealing
                        className="w-full h-14 bg-rpn-blue text-rpn-dark hover:bg-white font-black font-pixel text-sm shadow-[4px_4px_0px_0px_#fff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'BUYING' || step === 'REVEALING' ? (
                            <><Loader2 className="animate-spin mr-2" /> {step}...</>
                        ) : (
                            "BUY PACK"
                        )}
                    </Button>
                )}

            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}