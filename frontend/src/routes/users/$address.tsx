import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { ArrowLeft, MapPin, Calendar, Share2, Hexagon, Copy, Check, Box, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MomentDetailModal from '@/components/modals/MomentDetailModal';

// Definisi Route dengan parameter $address
export const Route = createFileRoute('/users/$address')({
  component: PublicProfile,
});

function PublicProfile() {
  const { address } = Route.useParams(); // Ambil address dari URL
  const navigate = useNavigate();
  
  // Fetch data profil orang lain
  const { data: profile, isLoading } = useUserProfile(address);

  // State untuk interaksi
  const [isCopied, setIsCopied] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any | null>(null); // Untuk modal detail

  const handleBack = () => navigate({ to: '/search' });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-rpn-dark flex items-center justify-center text-rpn-blue font-pixel animate-pulse">
        SCANNING IDENTITY...
      </div>
    );
  }

  // --- 404 STATE (User Tidak Ditemukan) ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-rpn-dark flex flex-col items-center justify-center text-white p-4">
         <div className="text-6xl mb-4">👻</div>
         <h1 className="font-pixel text-xl text-rpn-muted uppercase mb-2">Identity Not Found</h1>
         <p className="font-mono text-sm text-gray-500 mb-6 text-center">
            The address <span className="text-rpn-blue">{address}</span> has not initialized a profile yet.
         </p>
         <Button onClick={handleBack} className="btn-brutalist bg-white text-black">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Search
         </Button>
      </div>
    );
  }

  // --- RENDER UTAMA (Sama seperti Profile Sendiri) ---
  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans pb-20 selection:bg-rpn-blue selection:text-white">
      
      {/* HEADER NAVIGASI */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button 
            onClick={handleBack}
            className="pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-rpn-blue hover:text-white transition-all group shadow-lg"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="relative h-80 w-full overflow-hidden border-b-4 border-rpn-card">
        {profile.bg_image ? (
          <img 
            src={profile.bg_image} 
            alt="Cover" 
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rpn-blue via-blue-600 to-rpn-dark relative">
             <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-rpn-dark to-transparent"></div>
          </div>
        )}
      </div>

      {/* CONTAINER KONTEN */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        
        {/* --- HEADER PROFIL --- */}
        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
            
            {/* Avatar */}
            <div className="relative group cursor-default">
                <div className="w-48 h-48 bg-rpn-dark p-2 rounded-3xl shadow-[0_0_40px_rgba(41,171,226,0.3)] border border-rpn-blue/20">
                    <div className="w-full h-full bg-rpn-card rounded-2xl overflow-hidden border-4 border-rpn-blue relative">
                        {profile.pfp ? (
                            <img src={profile.pfp} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-rpn-card text-rpn-blue text-6xl font-pixel">👾</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info User */}
            <div className="flex-1 pb-2 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2 drop-shadow-lg">
                    {profile.nickname || "Anonymous"}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-mono text-rpn-muted">
                    <span className="bg-rpn-card px-3 py-1 rounded border border-rpn-blue/30 flex items-center gap-2 text-rpn-blue shadow-sm">
                        <Hexagon size={14} />
                        {address}
                    </span>
                    {profile.short_description && (
                        <>
                            <span className="hidden md:inline text-rpn-card/50">|</span>
                            <span className="text-rpn-text font-bold">{profile.short_description}</span>
                        </>
                    )}
                </div>
            </div>

            {/* TOMBOL AKSI: COPY ADDRESS (Gantikan Edit) */}
            <div className="mb-2">
                <button 
                    onClick={handleCopyAddress}
                    className="btn-brutalist bg-white text-rpn-dark border-2 border-rpn-blue px-6 py-3 rounded-xl font-bold shadow-[4px_4px_0px_0px_var(--color-rpn-blue)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-rpn-blue)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
                >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    {isCopied ? "COPIED!" : "COPY ADDRESS"}
                </button>
            </div>
        </div>

        {/* --- BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Bio Box */}
                <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rpn-blue"></div>
                    <h3 className="text-lg font-bold text-rpn-blue mb-4 flex items-center gap-2 font-pixel text-sm">
                        <span className="w-2 h-2 bg-rpn-blue rounded-full"></span>
                        BIO_LOGS
                    </h3>
                    <p className="text-rpn-text leading-relaxed font-mono text-sm md:text-base">
                        {profile.bio || "No bio data available."}
                    </p>
                </div>

                {/* Featured Moment (READ ONLY) */}
                <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase font-pixel text-sm tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-rpn-blue" /> Featured Moment
                    </h3>
                    
                    {/* Di sini kita TIDAK pakai Modal Selection, tapi Modal Detail View */}
                    <div className="aspect-video bg-rpn-dark/50 rounded-xl border-2 border-dashed border-rpn-blue/20 flex flex-col items-center justify-center text-rpn-muted overflow-hidden relative">
                        {profile.highlightedMomentID ? (
                           <div 
                                // Ambil detail jika diklik (Fitur tambahan, butuh logic fetch moment by ID)
                                // onClick={() => setSelectedMoment({ nft_id: profile.highlightedMomentID })} 
                                className="w-full h-full relative cursor-pointer hover:opacity-90 transition-opacity"
                           >
                               {/* Kita butuh data thumbnail featured moment. 
                                   Jika API Profile belum menyediakannya (cuma ID), 
                                   kita mungkin perlu fetch atau tampilkan placeholder ID dulu. 
                                   
                                   *Asumsi: API Profile Anda sudah mengembalikan data lengkap Moment di 'edges.highlightedMoment'*
                                   Jika belum, Anda perlu update API Go 'getUserByAddress' untuk eager load ini.
                               */}
                               
                               {/* Placeholder sementara jika data gambar belum di-eager load */}
                               <div className="flex flex-col items-center justify-center h-full gap-2">
                                   <Box className="text-rpn-blue opacity-50" size={32} />
                                   <p className="font-mono text-xs">Moment #{profile.highlightedMomentID}</p>
                                   <p className="text-[10px] text-rpn-muted">(View details coming soon)</p>
                               </div>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center gap-2 opacity-50">
                               <span className="text-4xl grayscale">🖼️</span>
                               <p className="text-xs uppercase font-bold">Slot Empty</p>
                           </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: STATS & SOCIALS */}
            <div className="space-y-6">
                {/* Stats */}
                <div className="bg-rpn-blue/10 border border-rpn-blue/50 rounded-2xl p-6 backdrop-blur-sm">
                     <h3 className="text-xs font-black text-rpn-blue uppercase mb-4 tracking-[0.2em] border-b border-rpn-blue/20 pb-2">
                        Statistics
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-rpn-dark p-3 rounded-lg text-center border border-white/5">
                            <p className="text-[10px] text-rpn-muted font-bold">MOMENTS</p>
                            <p className="text-2xl font-black text-white">{profile.edges?.moments?.length || 0}</p>
                        </div>
                        <div className="bg-rpn-dark p-3 rounded-lg text-center border border-white/5">
                            <p className="text-[10px] text-rpn-muted font-bold">ITEMS</p>
                            <p className="text-2xl font-black text-white">{profile.edges?.accessories?.length || 0}</p>
                        </div>
                        <div className="bg-rpn-dark p-3 rounded-lg text-center col-span-2 border border-white/5">
                            <p className="text-[10px] text-rpn-muted font-bold">EVENT PASSES</p>
                            <p className="text-2xl font-black text-white">{profile.edges?.event_passes?.length || 0}</p>
                        </div>
                     </div>
                </div>

                {/* Info Join */}
                <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 text-sm text-rpn-muted space-y-3 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rpn-dark rounded-md"><MapPin size={16} className="text-rpn-blue"/></div>
                        <span>Flow Blockchain (Testnet)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rpn-dark rounded-md"><Calendar size={16} className="text-rpn-blue"/></div>
                        <span>Joined: Nov 2025</span>
                    </div>
                </div>

                {/* Socials */}
                {profile.socials && Object.keys(profile.socials).length > 0 && (
                    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-md">
                        <h3 className="text-xs font-black text-white uppercase mb-4 tracking-widest">Social Links</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(profile.socials).map(([key, value]) => (
                                <a key={key} href={value} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-rpn-dark hover:bg-rpn-blue hover:text-white text-rpn-muted transition-all rounded-md text-[10px] font-bold uppercase border border-white/10 hover:border-transparent flex items-center gap-2">
                                    {key}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Modal Detail Moment (Jika diperlukan) */}
      {/* <MomentDetailModal 
           isOpen={!!selectedMoment} 
           onClose={() => setSelectedMoment(null)} 
           moment={selectedMoment} 
           userAddress={address}
      /> */}

    </div>
  );
}