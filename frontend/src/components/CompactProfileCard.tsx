import { useUserProfile } from "@/hooks/api/useUserProfile";
import { User, Shield, ArrowRight, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useGetMomentById } from "@/hooks/api/useGetMomentById";
import { useGetEventPassesByIds } from "@/hooks/api/useGetEventPassesByIds";

interface CompactProfileCardProps {
  address: string;
  className?: string;
  user?: any;
}

export default function CompactProfileCard({
  address,
  className = "",
  user: initialUser,
}: CompactProfileCardProps) {
  // 1. Fetch Data Lengkap
  const { data: fetchedProfile, isLoading } = useUserProfile(address);

  // --- PERBAIKAN LOGIKA MERGE ---
  // Gunakan fetchedProfile jika ada, jika belum load pakai initialUser
  const profile = fetchedProfile || initialUser;

  // --- PERBAIKAN LOGIKA FEATURED ---
  // PENTING: Gunakan 'fetchedProfile' secara eksplisit untuk ID Highlight.
  // Jika kita pakai 'profile' (gabungan), dan initialUser tidak punya field ini, 
  // maka dia akan undefined terus meskipun fetchedProfile sudah load (jika logika merge salah).
  // Dengan cara ini, Featured Section hanya akan muncul setelah data API selesai load.

  const sourceForIds = fetchedProfile; // Hanya percaya data dari API untuk ID
  const highlightedMomentID = sourceForIds?.highlighted_moment_id ? Number(sourceForIds.highlighted_moment_id) : undefined;
  const highlightedPassIDs = sourceForIds?.highlighted_eventPass_ids || [];
  const passIdsNum = highlightedPassIDs.map(Number).filter((id: number) => id > 0);

  // Fetch Data Featured
  const { data: featuredMoment } = useGetMomentById(highlightedMomentID, { staleTime: 0 });
  const { data: featuredPasses } = useGetEventPassesByIds(passIdsNum);

  if (!profile) return null;

  return (
    <div
      className={`
        relative w-80 overflow-hidden rounded-xl bg-rpn-card border-2 border-rpn-blue/50 
        shadow-[0_0_20px_rgba(0,0,0,0.5)]
        hover:border-rpn-blue hover:shadow-[0_0_25px_rgba(41,171,226,0.3)] hover:-translate-y-1
        transition-all duration-300 group flex flex-col
        ${className}
      `}
    >

      {/* --- 1. BANNER (Top) --- */}
      <div className="absolute top-0 left-0 w-full h-24 z-0">
        {profile.bgImage || profile.bg_image ? ( // Handle camelCase (DTO) or snake_case (Raw)
          <img
            src={profile.bgImage || profile.bg_image}
            alt="Banner"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rpn-blue via-blue-600 to-rpn-dark"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-rpn-card to-transparent"></div>
      </div>

      {/* --- 2. CONTENT LAYER --- */}
      <div className="relative z-10 p-4 pt-16 flex flex-col h-full">

        {/* HEADER ROW */}
        <div className="flex justify-between items-end mb-3 relative">

          {/* A. AVATAR */}
          <div className="relative -mt-8">
            <div className="w-16 h-16 rounded-xl bg-rpn-dark border-2 border-rpn-blue shadow-lg overflow-hidden transform group-hover:scale-105 transition-transform origin-bottom-left">
              {profile.pfp ? (
                <img src={profile.pfp} className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rpn-blue"><User size={24} /></div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-rpn-card"></div>
          </div>

          {/* B. FEATURED MOMENT (Hanya muncul jika ID valid & data ter-load) */}
          {featuredMoment ? (
            <div className="absolute -top-12 right-0 w-16 h-16 rounded-lg border-2 border-yellow-500/50 bg-black/50 shadow-lg overflow-hidden transform rotate-3 group-hover:rotate-0 transition-transform origin-bottom-right animate-in fade-in zoom-in duration-300">
              <img
                src={featuredMoment.thumbnail}
                className="w-full h-full object-cover opacity-90"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[6px] font-bold px-1 rounded-bl">
                <Star size={6} />
              </div>
            </div>
          ) : (
            // Placeholder loading hanya jika sedang loading API user profile
            isLoading && (
              <div className="absolute -top-12 right-0 w-16 h-16 rounded-lg border-2 border-white/10 bg-black/20 animate-pulse"></div>
            )
          )}
        </div>

        {/* --- 3. USER INFO --- */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-white text-base font-pixel uppercase tracking-tight truncate max-w-[70%] group-hover:text-rpn-blue transition-colors">
              {profile.nickname || "Anonymous"}
            </h3>
            <div className="flex items-center gap-1 bg-rpn-dark/80 px-1.5 py-0.5 rounded border border-white/10 text-[8px] font-mono text-rpn-muted">
              <Shield size={8} className="text-rpn-blue" /> LVL 42
            </div>
          </div>

          <p className="text-[10px] text-rpn-muted font-mono truncate mb-1.5 bg-rpn-dark/50 px-1 rounded inline-block">
            {address}
          </p>

          {/* Stats Mini (Ambil dari fetchedProfile agar akurat, atau fallback 0) */}
          <div className="flex gap-3 text-[9px] font-bold text-rpn-muted uppercase">
            <span><span className="text-white">{fetchedProfile?.edges?.moments?.length || 0}</span> Moments</span>
            <span className="w-px h-3 bg-white/10"></span>
            <span><span className="text-white">{fetchedProfile?.edges?.accessories?.length || 0}</span> Items</span>
          </div>
        </div>

        {/* --- 4. FEATURED PASSES --- */}
        {featuredPasses && featuredPasses.length > 0 ? (
          <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center -space-x-2">
              {featuredPasses.slice(0, 4).map((pass: any, idx: number) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full bg-black border border-white/20 overflow-hidden relative z-10 hover:z-20 hover:scale-125 transition-transform"
                  title={pass.name}
                >
                  <img src={pass.thumbnail} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Spacer jika tidak ada pass
          <div className="mt-auto pt-3 h-6"></div>
        )}
        <div className="text-[8px] font-bold text-rpn-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto">
          VIEW <ArrowRight size={10} />
        </div>

      </div>

      <Link
        to="/users/$address"
        params={{ address: address }}
        className="absolute inset-0 z-20"
        aria-label={`View ${profile.nickname}'s profile`}
      />
    </div>
  );
}