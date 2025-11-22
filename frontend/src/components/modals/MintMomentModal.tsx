'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetEventPasses } from '@/hooks/api/useGetEventPass';
import { useMintMoment } from '@/hooks/transactions/useMintMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2, Ticket, Upload, Image as ImageIcon, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MintMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MintMomentModal({ isOpen, onClose }: MintMomentModalProps) {
  const { user } = useFlowCurrentUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Data Fetching
  const { data: passesData, isLoading: isLoadingPasses } = useGetEventPasses(user?.addr);
  const { mutate: mintMoment, isPending: isMinting } = useMintMoment();

  // Filter unused passes
  const unusedPasses = passesData?.data.filter(p => !p.is_redeemed) || [];
  const selectedPass = unusedPasses.find(p => String(p.pass_id) === selectedPassId);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!user?.addr || !selectedPassId || !name || !imageFile) return;

    mintMoment({
      recipient: user.addr,
      eventPassID: selectedPassId,
      name,
      description,
      thumbnail: imageFile,
    }, {
      onSuccess: () => {
        // Reset and Close
        setStep(1);
        setSelectedPassId(null);
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        onClose();
      }
    });
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">Select an Event Pass</h3>
        <p className="text-rpn-muted text-xs">Choose a pass to redeem for a new Moment.</p>
      </div>

      {isLoadingPasses ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-rpn-blue" /></div>
      ) : unusedPasses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl bg-rpn-dark/30">
          <Ticket className="mx-auto text-rpn-muted mb-2 opacity-50" size={32} />
          <p className="text-rpn-muted text-sm">No redeemable passes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
          {unusedPasses.map((pass) => (
            <div
              key={pass.pass_id}
              onClick={() => setSelectedPassId(String(pass.pass_id))}
              className={`
                cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all
                ${selectedPassId === String(pass.pass_id)
                  ? 'border-rpn-blue shadow-[0_0_15px_rgba(41,171,226,0.5)] scale-[1.02]'
                  : 'border-white/10 hover:border-rpn-blue/50 hover:scale-[1.01]'}
              `}
            >
              <div className="aspect-square bg-rpn-dark relative">
                <img
                  src={pass.edges?.event?.thumbnail || '/placeholder.png'}
                  alt={pass.edges?.event?.name}
                  className="w-full h-full object-cover"
                />
                {selectedPassId === String(pass.pass_id) && (
                  <div className="absolute inset-0 bg-rpn-blue/20 flex items-center justify-center">
                    <div className="bg-rpn-blue text-white rounded-full p-1">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2 bg-rpn-card text-center">
                <p className="text-[10px] font-bold text-white truncate">{pass.edges?.event?.name}</p>
                <p className="text-[8px] font-mono text-rpn-muted">#{pass.pass_id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button
          disabled={!selectedPassId}
          onClick={() => setStep(2)}
          className="bg-rpn-blue text-rpn-dark font-bold hover:bg-white"
        >
          Next <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">Moment Details</h3>
        <p className="text-rpn-muted text-xs">Upload your photo and give it a name.</p>
      </div>

      {/* Image Upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full aspect-video bg-rpn-dark border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-rpn-blue hover:bg-rpn-blue/5 transition-colors relative overflow-hidden group"
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white font-bold flex items-center gap-2"><Upload size={16} /> Change Image</p>
            </div>
          </>
        ) : (
          <div className="text-center text-rpn-muted">
            <ImageIcon className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm font-bold">Click to Upload</p>
            <p className="text-[10px]">JPG, PNG, WEBP (Max 5MB)</p>
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
          <label className="text-[10px] font-bold text-rpn-muted uppercase mb-1 block">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Moment"
            className="bg-rpn-dark border-white/10 text-white focus:border-rpn-blue"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-rpn-muted uppercase mb-1 block">Description (Optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about this moment..."
            className="bg-rpn-dark border-white/10 text-white focus:border-rpn-blue resize-none h-20"
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={() => setStep(1)} className="text-rpn-muted hover:text-white">Back</Button>
        <Button
          disabled={!name || !imageFile}
          onClick={() => setStep(3)}
          className="bg-rpn-blue text-rpn-dark font-bold hover:bg-white"
        >
          Review <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">Confirm Mint</h3>
        <p className="text-rpn-muted text-xs">Review your details before minting.</p>
      </div>

      <div className="bg-rpn-dark/50 rounded-xl p-4 border border-white/10 space-y-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-rpn-dark rounded-lg overflow-hidden border border-white/10 shrink-0">
            {imagePreview && <img src={imagePreview} className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{name}</p>
            <p className="text-rpn-muted text-xs line-clamp-2">{description || 'No description'}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs text-rpn-muted">Redeeming Pass:</span>
          <span className="text-xs font-mono text-rpn-blue font-bold">
            {selectedPass?.edges?.event?.name} #{selectedPass?.pass_id}
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep(2)} disabled={isMinting} className="text-rpn-muted hover:text-white">Back</Button>
        <Button
          onClick={handleSubmit}
          disabled={isMinting}
          className="bg-rpn-blue text-rpn-dark font-bold hover:bg-white min-w-[120px]"
        >
          {isMinting ? <Loader2 className="animate-spin" /> : 'MINT NOW'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-rpn-card border-2 border-rpn-blue text-white sm:max-w-[500px] rounded-xl shadow-[0_0_50px_rgba(41,171,226,0.2)]">
        <DialogHeader>
          <DialogTitle className="sr-only">Mint Moment</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-rpn-blue' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

      </DialogContent>
    </Dialog>
  );
}
