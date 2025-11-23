'use client';

import React, { useEffect, useRef } from 'react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useSetupAccount } from '@/hooks/transactions/useSetupAccount';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { Button } from './ui/button';
import { LogOut, User as UserIcon, Shield, LogIn, Settings } from 'lucide-react';
import { useTransition } from "@/contexts/TransitionContext";
import { useNavigate } from '@tanstack/react-router';
import ProfileShowcase from './profile/ProfileShowcase';

interface ProfileCardProps {
  className?: string;
  address?: string; // Optional address prop
}

export default function ProfileCard({ className = "", address }: ProfileCardProps) {
  const { user, authenticate, unauthenticate } = useFlowCurrentUser();
  // Use the provided address or fall back to the current user's address
  const targetAddress = address || user?.addr;
  const { data: profile, refetch: refetchProfile } = useUserProfile(targetAddress);
  const { isSealed, setup, isPending: isSetupPending } = useSetupAccount();
  console.log(profile)
  const { triggerTransition } = useTransition();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSealed) refetchProfile();
  }, [isSealed, refetchProfile]);

  const handleSettingsClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(cardRef.current);
      const borderRadius = parseFloat(computedStyle.borderRadius);

      triggerTransition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        borderRadius: borderRadius,
      });
    }

    setTimeout(() => {
      navigate({ to: "/profile" });
    }, 800);
  };

  // --- RENDER UTAMA ---
  return (
    <div
      ref={cardRef}
      className={`
        relative w-full h-full
        bg-rpn-card border-2 border-gray-800 rounded-xl overflow-hidden 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] 
        flex flex-col 
        transition-all duration-200 ease-in-out
        hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] 
        hover:border-white
        ${className}
      `}
    >

      {/* =============================================
        BALOK 1: BANNER
        - Mobile: Relative (Tumpuk Biasa), Tinggi Tetap
        - Desktop: Absolute (Tumpuk Layer), Tinggi Persen
        =============================================
      */}
      <div className="relative h-40 w-full md:absolute md:top-0 md:left-0 md:h-[55%] z-0 shrink-0">
        {profile?.bg_image ? (
          <img
            src={profile.bg_image}
            alt="Banner"
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rpn-blue via-blue-600 to-rpn-dark">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
          </div>
        )}
        {/* Overlay Gelap (Hanya muncul di Desktop untuk blending) */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-rpn-card to-transparent"></div>
      </div>

      {/* =============================================
        BALOK 2: KONTEN UTAMA
        - Mobile: Relative (Lanjut bawah banner), Flex-1 (Isi sisa ruang)
        - Desktop: Absolute (Nempel bawah), Tinggi 50%
        =============================================
      */}
      <div className="relative flex-1 w-full md:absolute md:bottom-0 md:left-0 md:h-[50%] z-20 bg-rpn-card">

        {/* Efek Fade/Blend (Hanya Desktop) */}
        <div className="hidden md:block absolute -top-12 left-0 w-full h-32 bg-gradient-to-b from-transparent to-rpn-card pointer-events-none"></div>

        {/* CONTAINER ISI */}
        {/* Padding Right besar (pr-16) untuk memberi ruang bagi Sidebar */}
        <div className="h-full w-full pl-4 pr-16 pb-4 md:pl-6 md:pb-6 relative flex flex-col items-end">

          {/* --- KONDISI: LOGIN & SETUP --- */}
          {(user?.loggedIn && profile) ? (
            <>
              {/* AVATAR (Mengambang ke atas) */}
              <div className="relative -mt-12 md:-mt-16 z-40 shrink-0 mb-2 scale-90 md:scale-100 origin-right">
                <div className="w-32 h-32 rounded-2xl shadow-xl transform rotate-3 transition-transform hover:rotate-0 bg-rpn-card p-1">
                  <div className="w-full h-full bg-rpn-dark rounded-xl overflow-hidden border-2 border-rpn-blue">
                    {profile?.pfp ? (
                      <img src={profile.pfp} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rpn-dark text-rpn-blue"><UserIcon size={48} /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* =====================================================
                    BALOK 5: SHOWCASE (Code Splitting)
                    Kita cukup lempar ID-nya saja. Component anak yang akan fetch.
                   =====================================================
                */}
              <ProfileShowcase
                highlightedMomentID={profile.highlightedMomentID ? Number(profile.highlightedMomentID) : undefined}
                highlightedPassIDs={profile.highlightedEventPassIds} // Kirim array ID
              />

              {/* TEXT INFO */}
              <div className="text-right flex flex-col items-end z-30 relative w-full">
                <h2 className="text-2xl md:text-3xl font-pixel text-white uppercase tracking-tighter leading-none break-all drop-shadow-md">
                  {profile?.nickname || "Anonymous"}
                </h2>

                <div className="flex items-center justify-end gap-2 mt-2 bg-rpn-dark px-2 py-1 rounded border border-rpn-blue/30">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <p className="text-[10px] md:text-xs font-mono text-rpn-blue truncate max-w-[120px] md:max-w-[150px]">
                    {user?.addr}
                  </p>
                </div>

                <p className="text-[10px] md:text-xs text-rpn-muted mt-2 md:mt-3 line-clamp-2 italic max-w-[200px] md:max-w-[250px] ml-auto font-sans">
                  "{profile?.bio || "No bio."}"
                </p>

                {/* STATS */}
                <div className="mt-3 md:mt-4 flex gap-3 md:gap-4 justify-end w-full font-pixel text-[8px] md:text-[10px]">
                  <div className="text-right">
                    <p className="text-rpn-muted font-bold uppercase mb-0.5">Moments</p>
                    <p className="text-sm md:text-base text-white">{profile?.edges?.moments?.length || 0}</p>
                  </div>
                  <div className="w-[1px] bg-rpn-blue/30 h-6 md:h-8"></div>
                  <div className="text-right">
                    <p className="text-rpn-muted font-bold uppercase mb-0.5">Items</p>
                    <p className="text-sm md:text-base text-white">{profile?.edges?.accessories?.length || 0}</p>
                  </div>
                </div>
              </div>
            </>

          ) : (user?.loggedIn && !profile) ? (
            // --- KONDISI: BELUM SETUP ---
            <div className="flex flex-col items-end justify-center h-full w-full">
              <h2 className="text-xl md:text-2xl font-pixel text-white uppercase tracking-tighter leading-none break-all text-right">
                Setup Account
              </h2>
              <p className="text-[10px] md:text-xs text-rpn-muted mt-2 line-clamp-2 italic max-w-[200px] ml-auto text-right font-sans mb-4">
                Initialize storage to start.
              </p>
              <Button
                className="bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-bold font-pixel text-[10px] md:text-xs px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_#fff]"
                onClick={setup}
                disabled={isSetupPending}
              >
                {isSetupPending ? "Processing..." : "INITIALIZE"}
              </Button>
            </div>

          ) : (
            // --- KONDISI: BELUM LOGIN ---
            <div className="flex flex-col items-end justify-center h-full w-full">
              <h2 className="text-xl md:text-2xl font-pixel text-white uppercase tracking-tighter leading-none break-all text-right">
                Connect Wallet
              </h2>
              <p className="text-[10px] md:text-xs text-rpn-muted mt-2 line-clamp-2 italic max-w-[200px] ml-auto text-right font-sans mb-4">
                Access your Identity.
              </p>
              <Button
                className="bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-bold font-pixel text-[10px] md:text-xs px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_#fff]"
                onClick={authenticate}
              >
                CONNECT
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* BALOK 4: DEKORASI KURVA (Hidden on Mobile) */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-full z-[25] pointer-events-none">
        <div className="h-full w-full" style={{ clipPath: 'ellipse(100% 101% at 100% 1%)' }}>
          <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-white/5 to-transparent backdrop-blur-[1px]"></div>
        </div>
      </div>

      {/* BALOK 3: SIDEBAR */}
      {/* Gunakan 'absolute' di Desktop, tapi pastikan tidak overlap di Mobile */}
      <div className="absolute top-0 right-0 h-full w-12 md:w-14 z-30 flex flex-col border-l border-white/10 bg-black/20 backdrop-blur-md">

        {/* 1. Bagian Atas (Level) */}
        <div className="flex-1 flex flex-col items-center py-4 gap-4 md:gap-6">
          <div className="flex flex-col items-center gap-1">
            <Shield size={16} className="text-rpn-blue md:w-[18px] md:h-[18px]" />
            <span className="text-[8px] font-bold text-rpn-muted font-pixel mt-1">LVL</span>
            <span className="text-xs md:text-sm font-black text-white font-sans">42</span>
          </div>
        </div>

        {/* 2. Bagian Bawah (Tombol) */}
        {user?.loggedIn ? (
          <div className="w-full flex flex-col">
            <Button
              onClick={handleSettingsClick}
              className="h-12 md:h-14 w-full bg-rpn-blue hover:bg-blue-400 rounded-none flex items-center justify-center text-white transition-colors p-0"
              title="Setting Account"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </Button>
            <button
              onClick={unauthenticate}
              className="h-12 md:h-14 w-full bg-error hover:bg-red-500 flex items-center justify-center text-white transition-colors border-t border-black/20"
              title="Logout"
            >
              <LogOut size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={authenticate}
            className="h-12 md:h-14 w-full bg-rpn-blue hover:bg-blue-400 flex items-center justify-center text-white transition-colors"
            title="Login"
          >
            <LogIn size={18} className="md:w-5 md:h-5" />
          </button>
        )}
      </div>

    </div>
  );
}