'use client';

import React, { useEffect, useRef } from 'react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useSetupAccount } from '@/hooks/transactions/useSetupAccount';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { Button } from './ui/button';
import { LogOut, User as UserIcon, Shield, LogIn, Settings } from 'lucide-react'; 
import { useTransition } from "@/contexts/TransitionContext";
import { useNavigate } from '@tanstack/react-router';

interface ProfileCardProps {
  className?: string;
}

export default function ProfileCard({ className = "" }: ProfileCardProps) {
  // ... (Semua hooks dan logic tetap sama) ...
  const { user, authenticate, unauthenticate } = useFlowCurrentUser();
  const { data: profile, refetch: refetchProfile } = useUserProfile(user?.addr);
  const { isSealed, setup, isPending: isSetupPending } = useSetupAccount();
  const { triggerTransition } = useTransition();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSealed) refetchProfile();
  }, [isSealed, refetchProfile]);

  const handleSettingsClick = () => {
    // ... (Logic transisi tetap sama) ...
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
        relative w-full h-full min-h-[400px] 
        bg-rpn-card 
        border-2 border-rpn-blue 
        rounded-xl 
        overflow-hidden 
        flex flex-col 
        
        /* --- PERUBAHAN STYLE DI SINI --- */
        /* 1. Shadow Hitam Transparan (Lebih Elegan) */
        shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]
        
        /* 2. Transisi */
        transition-all duration-200 ease-in-out

        /* 3. Hover Effect: "Ditekan" (Sama seperti Event Card) */
        /* Kartu bergeser ke kanan & bawah */
        hover:translate-x-[2px] 
        hover:translate-y-[2px]
        /* Bayangan memendek */
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]
        
        ${className}
      `}
    >
      
      {/* ... (SISA KODE DI DALAMNYA TETAP SAMA PERSIS) ... */}
      
      {/* BALOK 1: BANNER */}
      <div className="absolute top-0 left-0 w-full h-[55%] z-0">
        {/* ... */}
        {profile?.bg_image ? (
             <img src={profile.bg_image} alt="Banner" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        ) : (
             <div className="w-full h-full bg-gradient-to-br from-rpn-blue via-blue-600 to-rpn-dark">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             </div>
        )}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-rpn-card to-transparent"></div>
      </div>

      {/* BALOK 2: KONTEN UTAMA */}
      {(user?.loggedIn && profile) ? (
        <div className="absolute bottom-0 left-0 w-full h-[50%] z-20">
            {/* ... Konten Profile ... */}
            <div className="absolute -top-12 left-0 w-full h-32 bg-gradient-to-b from-transparent to-rpn-card pointer-events-none"></div>
            <div className="h-full bg-rpn-card pl-6 pr-16 pb-6 relative flex flex-col items-end"> 
                <div className="relative -mt-16 z-40 shrink-0 mb-2"> 
                    <div className="w-32 h-32 rounded-2xl shadow-xl transform rotate-3 transition-transform hover:rotate-0 bg-rpn-card p-1">
                        <div className="w-full h-full bg-rpn-dark rounded-xl overflow-hidden border-2 border-rpn-blue">
                            {profile?.pfp ? <img src={profile.pfp} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} /> : <div className="w-full h-full flex items-center justify-center bg-rpn-dark text-rpn-blue"><UserIcon size={48}/></div>}
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end z-30 relative w-full">
                    <h2 className="text-2xl md:text-3xl font-pixel text-white uppercase tracking-tighter leading-none break-all drop-shadow-md">{profile?.nickname || "Anonymous"}</h2>
                    <div className="flex items-center justify-end gap-2 mt-2 bg-rpn-dark px-2 py-1 rounded border border-rpn-blue/30">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-mono text-rpn-blue truncate max-w-[150px]">{user?.addr}</p>
                    </div>
                    <p className="text-xs text-rpn-muted mt-3 line-clamp-2 italic max-w-[250px] ml-auto font-sans">"{profile?.bio || "No bio - just vibing in the RPN."}"</p>
                     <div className="mt-4 flex gap-4 justify-end w-full font-pixel text-[10px]">
                        <div className="text-right">
                            <p className="text-rpn-muted font-bold uppercase mb-1">Moments</p>
                            <p className="text-base text-white">{profile?.edges?.moments?.length || 0}</p>
                        </div>
                        <div className="w-[1px] bg-rpn-blue/30 h-8"></div>
                        <div className="text-right">
                            <p className="text-rpn-muted font-bold uppercase mb-1">Items</p>
                            <p className="text-base text-white">{profile?.edges?.accessories?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (user?.loggedIn && !profile) ? (
        // ... State Belum Setup ...
        <div className="absolute bottom-0 left-0 w-full h-[50%] z-20">
            <div className="absolute -top-12 left-0 w-full h-32 bg-gradient-to-b from-transparent to-rpn-card pointer-events-none"></div>
            <div className="h-full bg-rpn-card pl-6 pr-16 pb-6 relative flex flex-col items-end justify-center">
                <h2 className="text-2xl font-pixel text-white uppercase tracking-tighter leading-none break-all mt-4 text-right">Setup Account</h2>
                <p className="text-xs text-rpn-muted mt-2 line-clamp-2 italic max-w-[250px] ml-auto text-right font-sans">Initialize your storage to start collecting.</p>
                <Button className="mt-4 bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-bold font-pixel text-xs px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_#fff]" onClick={setup} disabled={isSetupPending}>
                  {isSetupPending ? "Setting up..." : "INITIALIZE"}
                </Button>
            </div>
        </div>
      ) : (
        // ... State Belum Login ...
        <div className="absolute bottom-0 left-0 w-full h-[50%] z-20">
            <div className="absolute -top-12 left-0 w-full h-32 bg-gradient-to-b from-transparent to-rpn-card pointer-events-none"></div>
            <div className="h-full bg-rpn-card pl-6 pr-16 pb-6 relative flex flex-col items-end justify-center">
                <h2 className="text-2xl font-pixel text-white uppercase tracking-tighter leading-none break-all mt-4 text-right">Connect Wallet</h2>
                <p className="text-xs text-rpn-muted mt-2 line-clamp-2 italic max-w-[250px] ml-auto text-right font-sans">Access your RPN Identity.</p>
            </div>
        </div>
      )}

      {/* BALOK 4: DEKORASI KURVA (Tetap Sama) */}
      <div className="absolute top-0 left-0 w-full h-full z-[25] pointer-events-none">
        <div className="h-full w-full" style={{ clipPath: 'ellipse(100% 101% at 100% 1%)' }}>
            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-white/5 to-transparent backdrop-blur-[1px]">
                 <div className="absolute top-[20%] left-[10%] w-[2px] h-[60%] bg-rpn-blue/50"></div>
                 <div className="absolute top-[25%] left-[15%] w-[1px] h-[50%] bg-white/20"></div>
                 <span className="absolute top-1/2 left-4 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 text-[10px] font-mono text-rpn-blue/50 tracking-[0.5em]">SYSTEM_ONLINE</span>
            </div>
        </div>
      </div>

      {/* BALOK 3: SIDEBAR (Tetap Sama) */}
      <div className="absolute top-0 right-0 h-full w-14 z-30 flex flex-col">
        <div className="flex-1 bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col items-center py-4 gap-6">
            <div className="flex flex-col items-center gap-1">
                <Shield size={18} className="text-rpn-blue" />
                <span className="text-[8px] font-bold text-rpn-muted font-pixel mt-1">LVL</span>
                <span className="text-sm font-black text-white font-sans">42</span>
            </div>
        </div>
        {user?.loggedIn ? (
            <div className="w-full flex flex-col">
                <Button onClick={handleSettingsClick} className="h-14 w-full bg-rpn-blue hover:bg-blue-400 rounded-none flex items-center justify-center text-white transition-colors border-l border-white/20 p-0" title="Setting Account">
                  <Settings size={20} />
                </Button>
                <button onClick={unauthenticate} className="h-14 w-full bg-error hover:bg-red-500 flex items-center justify-center text-white transition-colors border-l border-white/20" title="Logout">
                  <LogOut size={20} />
                </button>
            </div>
          ) : (
            <button onClick={authenticate} className="h-14 w-full bg-rpn-blue hover:bg-blue-400 flex items-center justify-center text-white transition-colors border-l border-white/20" title="Login">
                <LogIn size={20} />
            </button>
          )}
      </div>

    </div>
  );
}