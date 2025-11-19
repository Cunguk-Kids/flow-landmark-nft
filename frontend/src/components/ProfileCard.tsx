'use client';

import { useEffect } from 'react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useSetupAccount } from '@/hooks/transactions/useSetupAccount';
// import { useUserProfile } from '@/hooks/api/useUserProfile';
import { Loader2, Wallet, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from './ui/button';

// Definisikan props agar parent bisa mengatur ukuran grid
interface ProfileCardProps {
  className?: string;
}

export default function ProfileCard({ className = "" }: ProfileCardProps) {
  // 1. Hook Auth
  const { user, authenticate, unauthenticate } = useFlowCurrentUser();

  // 2. Hook Cek Profil
  // const { 
  //   data: profile, 
  //   isLoading: isCheckingProfile, 
  //   refetch: refetchProfile 
  // } = useUserProfile(user?.addr);

  // 3. Hook Setup Account
  const { 
    setup, 
    isPending: isSetupPending, 
    isSealed, 
  } = useSetupAccount();

  // Efek: Refresh profil jika setup berhasil
  // useEffect(() => {
  //   if (isSealed) {
  //     refetchProfile();
  //   }
  // }, [isSealed, refetchProfile]);

  // --- LOGIKA TAMPILAN (RENDER) ---

  const renderContent = () => {
    // KONDISI 1: Loading Awal (Cek user/profil)
    // if (user?.loggedIn && isCheckingProfile) {
    //   return (
    //     <div className="flex flex-col items-center animate-pulse">
    //       <div className="w-40 h-40 rounded-full bg-black/20 mb-4" />
    //       <p className="font-bold text-black">Checking Profile...</p>
    //     </div>
    //   );
    // }

    // KONDISI 2: Belum Login
    if (!user?.loggedIn) {
      return (
        <div className="text-center">
          <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-black bg-yellow-300 flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-linear-to-br from-yellow-300 to-yellow-500 flex items-center justify-center transition-transform group-hover:scale-110">
                <Wallet size={64} className="text-black" />
             </div>
          </div>
          <h3 className="text-2xl font-black text-black mb-2 uppercase">Welcome!</h3>
          <p className="text-sm text-black/70 mb-6 font-mono">Connect wallet to start.</p>
          
          <Button onClick={authenticate} className="btn-brutalist">Connect Wallet</Button>
        </div>
      );
    }

    // KONDISI 3: Sudah Login TAPI Belum Setup (Profile == null)
    if (!profile) {
      return (
        <div className="text-center w-full max-w-xs">
           <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-red-500 bg-red-100 flex items-center justify-center animate-bounce">
              <span className="text-5xl">⚠️</span>
           </div>
           <h3 className="text-xl font-black text-black mb-1">Account Not Ready</h3>
           <p className="text-xs text-black/70 mb-6 font-mono">You need to initialize your storage.</p>

           <button 
            onClick={setup}
            disabled={isSetupPending}
            className="w-full bg-red-500 text-white border-2 border-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
           >
             {isSetupPending ? <Loader2 className="animate-spin" /> : <Settings size={18} />}
             {isSetupPending ? "Setting up..." : "Setup Account"}
           </button>
           
           <button onClick={unauthenticate} className="mt-4 text-xs text-black underline font-mono hover:text-red-600">
             Disconnect
           </button>
        </div>
      );
    }

    // KONDISI 4: Sudah Login DAN Sudah Setup (Profile Ada)
    return (
      <div className="text-center w-full">
        {/* Avatar Container */}
        <div className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-black overflow-hidden relative bg-white">
          {profile.pfp ? (
            <img 
              src={profile.pfp} // Pastikan URL ini sudah di-resolve (https)
              alt="Profile" 
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-full h-full bg-green-400 flex items-center justify-center">
               <UserIcon size={64} className="text-black opacity-50" />
            </div>
          )}
        </div>

        {/* User Info */}
        <h3 className="text-2xl font-black text-black mb-0 uppercase tracking-tighter">
          {profile.nickname || "Anon"}
        </h3>
        <p className="text-xs font-mono bg-black text-white px-2 py-1 rounded inline-block mb-6">
          {user.addr}
        </p>

        {/* Stats Row (Contoh) */}
        <div className="flex justify-center gap-4 mb-6 border-t-2 border-b-2 border-black py-2 bg-white/50">
            <div className="text-center">
                <p className="text-xs font-bold text-gray-500">MOMENTS</p>
                <p className="text-xl font-black">{profile.edges?.moments?.length || 0}</p>
            </div>
            <div className="w-[2px] bg-black"></div>
            <div className="text-center">
                <p className="text-xs font-bold text-gray-500">ITEMS</p>
                <p className="text-xl font-black">{profile.edges?.accessories?.length || 0}</p>
            </div>
        </div>

        {/* Action */}
        <button 
          onClick={unauthenticate}
          className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-red-600 hover:bg-red-100 px-4 py-2 rounded transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  };

  // --- RENDER CONTAINER ---
  // Kita gabungkan className dari props dengan style dasar 'card-brutalist'
  return (
    <div className={`card-brutalist bg-accent relative overflow-hidden flex items-center justify-center p-6 ${className}`}>
      
      {/* Dekorasi Pixel di Pojok */}
      <div className="absolute top-4 right-4 w-16 h-16 pixel-pattern text-black opacity-10 pointer-events-none" />
      
      {/* Konten Utama */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {renderContent()}
      </div>

    </div>
  );
}