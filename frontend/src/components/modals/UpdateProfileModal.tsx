'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { Loader2, Save, Link as LinkIcon, Edit2 } from 'lucide-react';

// Tipe data profil dari API
interface UserProfileData {
  nickname?: string;
  bio?: string;
  short_description?: string;
  pfp?: string;
  bg_image?: string;
  socials?: Record<string, string>;
}

interface UpdateProfileModalProps {
  currentProfile: UserProfileData | null;
  onSuccess: () => void;
}

export default function UpdateProfileModal({ currentProfile, onSuccess }: UpdateProfileModalProps) {
  const { updateProfile, isPending, isSealed, error } = useUpdateProfile();

  // --- STATE FORMULIR ---
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  
  // State URL gambar
  const [pfpUrl, setPfpUrl] = useState('');
  const [bgUrl, setBgUrl] = useState('');

  // Efek: Isi formulir saat modal dibuka
  useEffect(() => {
    if (isOpen && currentProfile) {
      setNickname(currentProfile.nickname || '');
      setShortDesc(currentProfile.short_description || '');
      setBio(currentProfile.bio || '');
      setPfpUrl(currentProfile.pfp || '');
      setBgUrl(currentProfile.bg_image || '');
      
      if (currentProfile.socials) {
        setTwitter(currentProfile.socials['twitter'] || '');
        setWebsite(currentProfile.socials['website'] || '');
      }
    }
  }, [isOpen, currentProfile]);

  // Efek: Tutup modal saat sukses
  useEffect(() => {
    if (isSealed) {
      setIsOpen(false);
      onSuccess()
    }
  }, [isSealed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const socialsMap: Record<string, string> = {};
    if (twitter) socialsMap['twitter'] = twitter;
    if (website) socialsMap['website'] = website;

    const payload: UpdateProfileDTO = {
      nickname,
      shortDescription: shortDesc,
      bio,
      pfp: pfpUrl,
      bgImage: bgUrl,
      socials: socialsMap,
      momentID: currentProfile?.highlightedMomentID || null
    };

    updateProfile(payload);
  };

  return (
    <>
      {/* TOMBOL PEMICU */}
      <button 
          onClick={() => setIsOpen(true)}
          className="
            bg-white text-rpn-dark 
            border-2 border-rpn-blue
            px-6 py-3 rounded-xl font-bold font-sans uppercase
            shadow-[4px_4px_0px_0px_var(--color-rpn-blue)] 
            hover:translate-x-[2px] hover:translate-y-[2px] 
            hover:shadow-[2px_2px_0px_0px_var(--color-rpn-blue)] 
            active:translate-y-[4px] active:shadow-none 
            transition-all flex items-center gap-2 mb-2 cursor-pointer
          "
      >
          <Edit2 size={18} className="text-rpn-blue" />
          EDIT PROFILE
      </button>

      {/* MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={!isPending}>
        <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[500px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)]">
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-rpn-blue uppercase tracking-tighter font-pixel drop-shadow-sm">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-rpn-muted font-mono text-xs">
              Update your public identity on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            {/* Baris 1: Nickname */}
            <div className="space-y-1">
              <Label htmlFor="nickname" className="text-rpn-blue text-xs font-bold uppercase font-pixel">Nickname</Label>
              <Input 
                id="nickname" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                className="bg-rpn-card border-rpn-blue/30 text-rpn-text focus:border-rpn-blue rounded-lg"
                placeholder="CryptoKing"
              />
            </div>

            {/* Baris 2: Short Description (Tagline) */}
            <div className="space-y-1">
              <Label htmlFor="shortDesc" className="text-rpn-blue text-xs font-bold uppercase font-pixel">Tagline</Label>
              <Input 
                id="shortDesc" 
                value={shortDesc} 
                onChange={(e) => setShortDesc(e.target.value)}
                className="bg-rpn-card border-rpn-blue/30 text-rpn-text focus:border-rpn-blue rounded-lg"
                placeholder="Blockchain Enthusiast"
                maxLength={50}
              />
            </div>

            {/* Baris 3: Bio */}
            <div className="space-y-1">
              <Label htmlFor="bio" className="text-rpn-blue text-xs font-bold uppercase font-pixel">Bio Logs</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="bg-rpn-card border-rpn-blue/30 text-rpn-text focus:border-rpn-blue rounded-lg min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Baris 4: Gambar (URL Input) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label htmlFor="pfp" className="text-rpn-blue text-xs font-bold uppercase font-pixel">Avatar URL</Label>
                  <Input id="pfp" value={pfpUrl} onChange={e => setPfpUrl(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-rpn-text rounded-lg" placeholder="ipfs://..." />
              </div>
              <div className="space-y-1">
                  <Label htmlFor="bg" className="text-rpn-blue text-xs font-bold uppercase font-pixel">Banner URL</Label>
                  <Input id="bg" value={bgUrl} onChange={e => setBgUrl(e.target.value)} className="bg-rpn-card border-rpn-blue/30 text-rpn-text rounded-lg" placeholder="ipfs://..." />
              </div>
            </div>

            {/* Baris 5: Socials */}
            <div className="space-y-2 border-t border-rpn-blue/20 pt-4 mt-4">
              <Label className="text-rpn-text text-xs font-bold uppercase flex items-center gap-2 font-pixel">
                  <LinkIcon size={12} className="text-rpn-blue"/> Social Links
              </Label>
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                      placeholder="Twitter Handle (@...)" 
                      value={twitter} 
                      onChange={e => setTwitter(e.target.value)}
                      className="bg-rpn-card border-rpn-blue/30 text-rpn-text rounded-lg text-xs"
                  />
                  <Input 
                      placeholder="Website URL" 
                      value={website} 
                      onChange={e => setWebsite(e.target.value)}
                      className="bg-rpn-card border-rpn-blue/30 text-rpn-text rounded-lg text-xs"
                  />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-error text-xs font-bold bg-error/10 p-2 border border-error rounded-lg font-mono">
                  Error: {error.message}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <Button 
                  type="submit" 
                  disabled={isPending}
                  className="
                    bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue 
                    font-black font-sans uppercase rounded-lg
                    shadow-[4px_4px_0px_0px_#fff] 
                    hover:translate-x-[2px] hover:translate-y-[2px] 
                    hover:shadow-[2px_2px_0px_0px_#fff] 
                    disabled:opacity-50 disabled:shadow-none
                    transition-all px-6
                  "
              >
                  {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SAVING...
                    </>
                  ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        SAVE CHANGES
                    </>
                  )}
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}