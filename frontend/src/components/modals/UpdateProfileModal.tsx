'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { Loader2, Save, Link as LinkIcon, Edit2, Upload } from 'lucide-react';
import { useUploadImage } from '@/hooks/api/useUploadImage';
import { toast } from 'sonner';

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
  const uploadImage = useUploadImage();

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

  // State untuk file upload
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>('');
  const [bgPreview, setBgPreview] = useState<string>('');

  // Upload loading states
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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
      toast.success('Profile updated successfully!', {
        description: 'Your profile changes have been saved on the blockchain.'
      });
      setIsOpen(false);
      onSuccess()
    }
  }, [isSealed, onSuccess]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to update profile', {
        description: error.message
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPfpUrl = pfpUrl;
    let finalBgUrl = bgUrl;

    // Upload profile picture if file selected
    if (pfpFile) {
      setIsUploadingPfp(true);
      try {
        const result = await uploadImage.mutateAsync(pfpFile);
        finalPfpUrl = result.url;
        toast.success('Avatar uploaded to IPFS');
      } catch (err) {
        console.error("PFP upload failed:", err);
        toast.error('Upload failed', {
          description: 'Failed to upload profile picture.'
        });
        return;
      } finally {
        setIsUploadingPfp(false);
      }
    }

    // Upload banner if file selected
    if (bgFile) {
      setIsUploadingBanner(true);
      try {
        const result = await uploadImage.mutateAsync(bgFile);
        finalBgUrl = result.url;
        toast.success('Banner uploaded to IPFS');
      } catch (err) {
        console.error("Banner upload failed:", err);
        toast.error('Upload failed', {
          description: 'Failed to upload banner image.'
        });
        return;
      } finally {
        setIsUploadingBanner(false);
      }
    }

    const socialsMap: Record<string, string> = {};
    if (twitter) socialsMap['twitter'] = twitter;
    if (website) socialsMap['website'] = website;

    const payload: UpdateProfileDTO = {
      nickname,
      shortDescription: shortDesc,
      bio,
      pfp: finalPfpUrl,
      bgImage: finalBgUrl,
      socials: socialsMap,
      momentID: currentProfile?.highlighted_moment_id || null,
      highlightedEventPassIds: currentProfile?.highlighted_eventPass_ids || null
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

            {/* Baris 4: Profile Picture Upload */}
            <div className="space-y-3 border-t border-rpn-blue/20 pt-4">
              <Label className="text-rpn-blue text-xs font-bold uppercase font-pixel flex items-center gap-2">
                <Upload size={12} /> Profile Images
              </Label>

              <div className="grid grid-cols-2 gap-4">
                {/* Avatar */}
                <div className="space-y-1">
                  <Label htmlFor="pfp" className="text-rpn-text text-[10px] font-bold uppercase">Avatar</Label>
                  <Input
                    id="pfp"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPfpFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setPfpPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-rpn-blue file:text-rpn-dark hover:file:bg-white hover:file:text-rpn-blue cursor-pointer text-xs"
                  />
                  {(pfpPreview || pfpUrl) && (
                    <div className="mt-1 relative w-full h-24 rounded overflow-hidden border border-rpn-blue/30">
                      <img src={pfpPreview || pfpUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Banner */}
                <div className="space-y-1">
                  <Label htmlFor="bg" className="text-rpn-text text-[10px] font-bold uppercase">Banner</Label>
                  <Input
                    id="bg"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBgFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setBgPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="bg-rpn-card border-rpn-blue/30 text-white rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-rpn-blue file:text-rpn-dark hover:file:bg-white hover:file:text-rpn-blue cursor-pointer text-xs"
                  />
                  {(bgPreview || bgUrl) && (
                    <div className="mt-1 relative w-full h-24 rounded overflow-hidden border border-rpn-blue/30">
                      <img src={bgPreview || bgUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Baris 5: Socials */}
            <div className="space-y-2 border-t border-rpn-blue/20 pt-4 mt-4">
              <Label className="text-rpn-text text-xs font-bold uppercase flex items-center gap-2 font-pixel">
                <LinkIcon size={12} className="text-rpn-blue" /> Social Links
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
                disabled={isPending || isUploadingPfp || isUploadingBanner}
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
                {isUploadingPfp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    UPLOADING AVATAR...
                  </>
                ) : isUploadingBanner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    UPLOADING BANNER...
                  </>
                ) : isPending ? (
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