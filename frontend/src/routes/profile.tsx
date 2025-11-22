import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useUserProfile } from '@/hooks/api/useUserProfile';
import { ArrowLeft, Edit2, MapPin, Calendar, Share2, Hexagon } from 'lucide-react';
import UpdateProfileModal from '@/components/modals/UpdateProfileModal'; // Pastikan path benar
import HighlightMomentModal from '@/components/modals/HighlightMomentModal';
import MyMomentsBox from '@/components/MyMomentsBox';
import MyEventPassBox from '@/components/profile/MyEventPassBox';

export const Route = createFileRoute('/profile')({
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user } = useFlowCurrentUser();
  const { data: profile, isLoading, refetch } = useUserProfile(user?.addr);

  const handleBack = () => {
    navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rpn-dark flex items-center justify-center text-rpn-blue font-pixel animate-pulse">
        LOADING_DATA...
      </div>
    );
  }

  if (user?.loggedIn === false) {
      navigate({ to: '/' });
      return null;
  }

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans pb-20 selection:bg-rpn-blue selection:text-white">
      
      {/* --- 1. HEADER NAVIGASI (Floating) --- */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button 
            onClick={handleBack}
            className="pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-rpn-blue hover:text-white transition-all group shadow-lg"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <button 
            className="pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-white hover:text-rpn-dark transition-all shadow-lg"
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* --- 2. HERO BANNER --- */}
      <div className="relative h-80 w-full overflow-hidden border-b-4 border-rpn-card">
        {profile?.bg_image ? (
          <img 
            src={profile.bg_image} 
            alt="Cover" 
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          // RPN Gradient Banner
          <div className="w-full h-full bg-gradient-to-br from-rpn-blue via-blue-600 to-rpn-dark relative">
             <div className="absolute inset-0 opacity-20" 
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-rpn-dark to-transparent"></div>
          </div>
        )}
      </div>

      {/* --- 3. MAIN CONTENT (Container) --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        
        {/* --- HEADER PROFIL --- */}
        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
            
            {/* Avatar Hexagon Besar */}
            <div className="relative group">
                <div className="w-48 h-48 bg-rpn-dark p-2 rounded-3xl shadow-[0_0_40px_rgba(41,171,226,0.3)] transform -rotate-2 transition-transform group-hover:rotate-0 border border-rpn-blue/20">
                    <div className="w-full h-full bg-rpn-card rounded-2xl overflow-hidden border-4 border-rpn-blue relative">
                        {profile?.pfp ? (
                            <img src={profile.pfp} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-rpn-card text-rpn-blue text-6xl font-pixel">👾</div>
                        )}
                    </div>
                </div>
                {/* Status Indicator (Tetap Hijau karena 'Online') */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-success rounded-full border-4 border-rpn-dark animate-pulse shadow-[0_0_15px_#00EF8B]"></div>
            </div>

            {/* Nama & Info */}
            <div className="flex-1 pb-2 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2 drop-shadow-lg font-sans">
                    {profile?.nickname || "Anonymous"}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-mono text-rpn-muted">
                    <span className="bg-rpn-card px-3 py-1 rounded border border-rpn-blue/30 flex items-center gap-2 text-rpn-blue shadow-sm">
                        <Hexagon size={14} />
                        {user?.addr}
                    </span>
                    
                    {profile?.short_description && (
                        <>
                            <span className="hidden md:inline text-rpn-card/50">|</span>
                            <span className="text-rpn-text font-bold">{profile.short_description}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Tombol Edit (Menggunakan Komponen Modal) */}
            <div className="mb-2">
                <UpdateProfileModal onSuccess={refetch} currentProfile={profile} />
            </div>
        </div>

        {/* --- 4. BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kiri: Bio & Info (Col Span 2) */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Kotak Bio */}
                <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-rpn-blue/60 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rpn-blue group-hover:w-2 transition-all duration-300"></div>
                    
                    <h3 className="text-lg font-bold text-rpn-blue mb-4 flex items-center gap-2 font-pixel text-sm">
                        <span className="w-2 h-2 bg-rpn-blue rounded-full animate-ping"></span>
                        BIO_LOGS
                    </h3>
                    <p className="text-rpn-text leading-relaxed font-mono text-sm md:text-base">
                        {profile?.bio || "No bio data available. This user prefers to remain mysterious."}
                    </p>
                </div>

                {/* Kotak Featured Moment */}
                <HighlightMomentModal 
                  currentProfile={profile || null} 
                  onSuccess={refetch} 
                />

                {/* Kotak My Moments */}
                <MyMomentsBox />

                <MyEventPassBox />
            </div>

            {/* Kanan: Stats & Socials (Col Span 1) */}
            <div className="space-y-6">
                
                {/* Kotak Statistik */}
                <div className="bg-rpn-blue/10 border border-rpn-blue/50 rounded-2xl p-6 backdrop-blur-sm">
                     <h3 className="text-xs font-black text-rpn-blue uppercase mb-4 tracking-[0.2em] border-b border-rpn-blue/20 pb-2">
                        Statistics
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-rpn-dark p-3 rounded-lg text-center border border-white/5 hover:border-rpn-blue/30 transition-colors">
                            <p className="text-[10px] text-rpn-muted font-bold">MOMENTS</p>
                            <p className="text-2xl font-black text-white">{profile?.edges?.moments?.length || 0}</p>
                        </div>
                        <div className="bg-rpn-dark p-3 rounded-lg text-center border border-white/5 hover:border-rpn-blue/30 transition-colors">
                            <p className="text-[10px] text-rpn-muted font-bold">ITEMS</p>
                            <p className="text-2xl font-black text-white">{profile?.edges?.accessories?.length || 0}</p>
                        </div>
                        <div className="bg-rpn-dark p-3 rounded-lg text-center col-span-2 border border-white/5 hover:border-rpn-blue/30 transition-colors">
                            <p className="text-[10px] text-rpn-muted font-bold">EVENT PASSES</p>
                            <p className="text-2xl font-black text-white">{profile?.edges?.event_passes?.length || 0}</p>
                        </div>
                     </div>
                </div>

                {/* Kotak Info Tambahan */}
                <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 text-sm text-rpn-muted space-y-3 shadow-md">
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 bg-rpn-dark rounded-md group-hover:text-rpn-blue transition-colors">
                            <MapPin size={16} />
                        </div>
                        <span>Flow Blockchain (Testnet)</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 bg-rpn-dark rounded-md group-hover:text-rpn-blue transition-colors">
                            <Calendar size={16} />
                        </div>
                        <span>Joined: Nov 2025</span>
                    </div>
                </div>

                {/* Socials */}
                {profile?.socials && Object.keys(profile.socials).length > 0 && (
                    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-md">
                        <h3 className="text-xs font-black text-white uppercase mb-4 tracking-widest">Social Links</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(profile.socials).map(([key, value]) => (
                                <a 
                                  key={key} 
                                  href={value} 
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-rpn-dark hover:bg-rpn-blue hover:text-white text-rpn-muted transition-all rounded-md text-[10px] font-bold uppercase border border-white/10 hover:border-transparent flex items-center gap-2"
                                >
                                    {/* Ikon dinamis bisa ditambahkan di sini jika mau */}
                                    {key}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>

      </div>
    </div>
  );
}