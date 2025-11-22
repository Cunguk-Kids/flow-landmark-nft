'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetEventPasses } from '@/hooks/api/useGetEventPass';
import { useMintMoment } from '@/hooks/transactions/useMintMoment';
import { useFreeMintMoment } from '@/hooks/transactions/useFreeMintMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { Loader2, Ticket, Upload, Image as ImageIcon, ArrowRight, Check, Gift, Sparkles, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label"; // Tambahkan Label

interface MintMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MintMode = 'SELECT' | 'FREE' | 'PASS';

export default function MintMomentModal({ isOpen, onClose }: MintMomentModalProps) {
  const { user } = useFlowCurrentUser();

  // State Alur
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<MintMode>('SELECT');

  // Form State
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Data Fetching
  const { data: userProfile, refetch: refetchProfile } = useUserProfile(user?.addr);
  // (Pastikan API profile Anda mengembalikan field 'is_free_minted' di root object atau di traits)
  // Jika belum ada di API, mungkin perlu ditambahkan atau dicek manual lewat script
  const isFreeMinted = userProfile?.is_free_minted || false; // Asumsi field ini ada

  const { data: passesData, isLoading: isLoadingPasses } = useGetEventPasses(user?.addr);

  const { mutate: mintMomentWithPass, isPending: isMintingPass } = useMintMoment();
  const { mutate: mintFreeMoment, isPending: isMintingFree } = useFreeMintMoment();

  const isMinting = isMintingPass || isMintingFree;

  // Filter unused passes
  const unusedPasses = passesData?.data.filter(p => !p.is_redeemed) || [];
  const selectedPass = unusedPasses.find(p => String(p.pass_id) === selectedPassId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state saat modal dibuka/tutup
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setMode('SELECT');
        setSelectedPassId(null);
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
      }, 300);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!user?.addr || !name || !imageFile) return;

    const onSuccess = () => {
      refetchProfile(); // Update status free mint
      onClose();
    };

    if (mode === 'FREE') {
      mintFreeMoment({
        recipient: user.addr,
        name,
        description,
        thumbnail: imageFile,
      }, { onSuccess });
    } else if (mode === 'PASS' && selectedPassId) {
      mintMomentWithPass({
        recipient: user.addr,
        eventPassID: selectedPassId,
        name,
        description,
        thumbnail: imageFile,
      }, { onSuccess });
    }
  };

  // --- LANGKAH 1: PILIH MODE (FREE vs PASS) ---
  const renderModeSelection = () => (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h3 className="text-white font-black text-xl uppercase font-pixel mb-2 text-rpn-blue">Select Method</h3>
        <p className="text-rpn-muted text-xs font-mono">Choose how you want to create your Moment.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">

        {/* Opsi 1: Free Mint */}
        <div
          onClick={() => !isFreeMinted && [setMode('FREE'), setStep(2)]}
          className={`
            relative p-4 rounded-xl border-2 transition-all cursor-pointer group flex items-center gap-4
            ${isFreeMinted
              ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
              : 'border-white/10 bg-rpn-card hover:border-rpn-blue hover:bg-rpn-blue/10 hover:shadow-[0_0_15px_rgba(41,171,226,0.2)]'}
          `}
        >
          <div className={`p-3 rounded-full ${isFreeMinted ? 'bg-white/10 text-white/30' : 'bg-yellow-500/20 text-yellow-500'}`}>
            <Gift size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm uppercase font-pixel">Free Mint</h4>
            <p className="text-[10px] text-rpn-muted mt-1 font-mono">One-time gift for new users.</p>
          </div>
          {isFreeMinted && (
            <span className="text-[10px] font-bold bg-white/10 text-white/50 px-2 py-1 rounded uppercase">CLAIMED</span>
          )}
          {!isFreeMinted && (
            <ArrowRight className="text-rpn-blue opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Opsi 2: Event Pass */}
        <div
          onClick={() => {
            setMode('PASS');
            setStep(1); // Ke Langkah Pilih Pass
          }}
          className="relative p-4 rounded-xl border-2 border-white/10 bg-rpn-card hover:border-rpn-blue hover:bg-rpn-blue/10 hover:shadow-[0_0_15px_rgba(41,171,226,0.2)] transition-all cursor-pointer group flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-rpn-blue/20 text-rpn-blue">
            <Ticket size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm uppercase font-pixel">Redeem Pass</h4>
            <p className="text-[10px] text-rpn-muted mt-1 font-mono">Burn a pass to mint a moment.</p>
          </div>
          <div className="text-right bg-rpn-dark px-3 py-1 rounded border border-rpn-blue/20">
            <span className="text-lg font-bold text-white block leading-none">{unusedPasses.length}</span>
            <span className="text-[8px] text-rpn-muted uppercase">Available</span>
          </div>
        </div>

      </div>
    </div>
  );

  // --- LANGKAH 1 (PASS): PILIH TIKET ---
  const renderPassSelection = () => (
    <div className="space-y-4 flex flex-col h-full">
      <div className="text-center mb-2">
        <h3 className="text-white font-bold text-lg uppercase font-pixel">Select Pass</h3>
        <p className="text-rpn-muted text-xs font-mono">Which event pass to redeem?</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
        {isLoadingPasses ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-rpn-blue" /></div>
        ) : unusedPasses.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl bg-rpn-dark/30 h-full flex flex-col items-center justify-center">
            <Ticket className="text-rpn-muted mb-2 opacity-50" size={32} />
            <p className="text-rpn-muted text-xs font-mono">No redeemable passes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unusedPasses.map((pass) => (
              <div
                key={pass.pass_id}
                onClick={() => setSelectedPassId(String(pass.pass_id))}
                className={`
                  cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all group
                  ${selectedPassId === String(pass.pass_id)
                    ? 'border-rpn-blue shadow-[0_0_15px_rgba(41,171,226,0.4)] scale-[1.02]'
                    : 'border-white/10 hover:border-rpn-blue/50 hover:bg-rpn-blue/5'}
                `}
              >
                {/* Gambar Pass */}
                <div className="aspect-square bg-rpn-dark relative">
                  {pass.edges?.event?.thumbnail ? (
                    <img
                      src={pass.edges.event.thumbnail} // Helper IPFS jika perlu
                      alt="Pass"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Ticket className="text-white/20" /></div>
                  )}

                  {/* Checkmark Selected */}
                  {selectedPassId === String(pass.pass_id) && (
                    <div className="absolute inset-0 bg-rpn-blue/20 flex items-center justify-center animate-in fade-in">
                      <div className="bg-rpn-blue text-black rounded-full p-1 shadow-lg">
                        <Check size={16} strokeWidth={4} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Pass */}
                <div className={`p-2 text-center border-t transition-colors ${selectedPassId === String(pass.pass_id) ? 'bg-rpn-blue text-black border-rpn-blue' : 'bg-rpn-card text-white border-white/5'}`}>
                  <p className="text-[9px] font-bold truncate uppercase">{pass.edges?.event?.name || "Unknown Event"}</p>
                  <p className={`text-[8px] font-mono ${selectedPassId === String(pass.pass_id) ? 'text-black/70' : 'text-rpn-muted'}`}>#{pass.pass_id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={() => setMode('SELECT')} className="text-rpn-muted hover:text-white hover:bg-white/10 font-bold text-xs">
          <ArrowLeft size={14} className="mr-2" /> BACK
        </Button>
        <Button
          disabled={!selectedPassId}
          onClick={() => setStep(2)}
          className="bg-rpn-blue text-rpn-dark font-black font-pixel text-xs hover:bg-white transition-all shadow-[4px_4px_0px_0px_#fff]"
        >
          NEXT STEP <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  // --- LANGKAH 2: UPLOAD & DETAIL ---
  const renderDetailsForm = () => (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center mb-2">
        <h3 className="text-white font-bold text-lg uppercase font-pixel">Moment Details</h3>
        <p className="text-rpn-muted text-xs font-mono">Upload your photo and give it a name.</p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Image Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
                w-full aspect-video bg-rpn-dark border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                ${imagePreview ? 'border-rpn-blue' : 'border-white/20 hover:border-rpn-blue hover:bg-rpn-blue/5'}
            `}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider"><Upload size={16} /> Change Image</p>
              </div>
            </>
          ) : (
            <div className="text-center text-rpn-muted">
              <ImageIcon className="mx-auto mb-2 opacity-50 group-hover:text-rpn-blue group-hover:scale-110 transition-all" size={32} />
              <p className="text-xs font-bold uppercase group-hover:text-white">Click to Upload</p>
              <p className="text-[10px] font-mono opacity-70">JPG, PNG (Max 5MB)</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <Label className="text-[10px] font-bold text-rpn-blue uppercase mb-1 block font-pixel">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Moment"
              className="bg-rpn-card border-rpn-blue/30 text-white focus:border-rpn-blue rounded-lg"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-rpn-blue uppercase mb-1 block font-pixel">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this moment..."
              className="bg-rpn-card border-rpn-blue/30 text-white focus:border-rpn-blue rounded-lg resize-none h-20 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-white/10 mt-auto">
        <Button
          variant="ghost"
          onClick={() => mode === 'FREE' ? setMode('SELECT') : setStep(1)}
          className="text-rpn-muted hover:text-white hover:bg-white/10 font-bold text-xs"
        >
          <ArrowLeft size={14} className="mr-2" /> BACK
        </Button>
        <Button
          disabled={!name || !imageFile}
          onClick={() => setStep(3)}
          className="bg-rpn-blue text-rpn-dark font-black font-pixel text-xs hover:bg-white transition-all shadow-[4px_4px_0px_0px_#fff]"
        >
          REVIEW <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  // --- LANGKAH 3: REVIEW & MINT ---
  const renderReview = () => (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg uppercase font-pixel">Confirm Mint</h3>
        <p className="text-rpn-muted text-xs font-mono">Review details before minting.</p>
      </div>

      <div className="flex-1">
        <div className="bg-rpn-card rounded-xl p-4 border border-rpn-blue/30 space-y-4 shadow-lg">
          {/* Header Summary */}
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-black rounded-lg overflow-hidden border border-white/10 shrink-0">
              {imagePreview && <img src={imagePreview} className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="text-white font-bold text-lg font-pixel uppercase leading-tight">{name}</p>
              <p className="text-rpn-muted text-xs line-clamp-2 mt-1 italic font-mono">"{description || 'No description'}"</p>
            </div>
          </div>

          {/* Payment Method Summary */}
          <div className="pt-3 border-t border-white/10 flex justify-between items-center bg-black/20 p-2 rounded">
            <span className="text-xs text-rpn-muted font-bold uppercase">Payment Method</span>
            {mode === 'FREE' ? (
              <span className="text-xs font-mono text-yellow-400 font-bold flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">
                <Gift size={12} /> FREE MINT
              </span>
            ) : (
              <div className="text-right">
                <span className="text-xs font-mono text-rpn-blue font-bold flex items-center gap-1 justify-end">
                  <Ticket size={12} /> PASS REDEMPTION
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {selectedPass?.edges?.event?.name} #{selectedPass?.pass_id}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-500 mt-6 max-w-[80%] mx-auto">
          By clicking Mint Now, you agree to create this NFT permanently on the blockchain. This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-between pt-4 border-t border-white/10 mt-auto">
        <Button variant="ghost" onClick={() => setStep(2)} disabled={isMinting} className="text-rpn-muted hover:text-white hover:bg-white/10 font-bold text-xs">
          <ArrowLeft size={14} className="mr-2" /> BACK
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isMinting}
          className="bg-rpn-blue text-rpn-dark font-black font-pixel text-sm hover:bg-white transition-all shadow-[4px_4px_0px_0px_#fff] min-w-[140px]"
        >
          {isMinting ? <Loader2 className="animate-spin" /> : 'MINT NOW'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-white sm:max-w-[500px] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.2)] min-h-[550px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Mint Moment</DialogTitle>
        </DialogHeader>

        {/* Progress Bar (Hanya jika sudah pilih mode) */}
        {mode !== 'SELECT' && (
          <div className="flex gap-2 mb-4 px-1">
            {(mode === 'FREE' ? [2, 3] : [1, 2, 3]).map((s, idx) => {
              const totalSteps = mode === 'FREE' ? 2 : 3;
              const currentStepIdx = mode === 'FREE' ? step - 2 : step - 1;
              const isActive = idx <= currentStepIdx;

              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${isActive ? 'bg-rpn-blue shadow-[0_0_10px_#29ABE2]' : 'bg-white/10'}`}
                />
              )
            })}
          </div>
        )}

        {/* CONTENT SWITCHER */}
        <div className="flex-1">
          {mode === 'SELECT' && renderModeSelection()}
          {mode === 'PASS' && step === 1 && renderPassSelection()}
          {step === 2 && mode !== 'SELECT' && renderDetailsForm()}
          {step === 3 && mode !== 'SELECT' && renderReview()}
        </div>

      </DialogContent>
    </Dialog>
  );
}