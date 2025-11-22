import { useEventList } from "@/hooks/useEventList";
import { EventCard } from "@/components/EventCard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LucideExternalLink, CalendarSearch, Search, Plus, PlusSquare, ArrowRight, Users } from "lucide-react";
import { useTransition } from "@/contexts/TransitionContext";
import { useRef } from "react";
import ProfileCard from "@/components/ProfileCard";

export const Route = createFileRoute("/")({
  component: Index,
});

function EventsHeroCard() {
  const { data: events, isLoading } = useEventList();
  const navigate = useNavigate();
  const { triggerTransition } = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
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
      navigate({ to: "/events" });
    }, 800);
  };

  return (
    <div
      ref={cardRef}
      className="
        md:col-span-3 md:row-span-3 
        relative flex flex-col justify-between 
        bg-rpn-blue 
        border-2 border-rpn-dark 
        rounded-xl 
        p-6 md:p-10 
        overflow-hidden 
        z-30 
        shadow-[8px_8px_0px_0px_rgba(15,23,42,0.4)] 
        group
        hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,0.4)]
        hover:translate-x-[1px] hover:translate-y-[1px]
        transition-all
        
        /* --- TAMBAHAN RESPONSIF --- */
        min-h-full
      "
    >
      {/* --- DEKORASI BACKGROUND (Tetap Sama) --- */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-rpn-dark opacity-50" />

      {/* --- KONTEN UTAMA --- */}
      {/* Tambahkan 'relative z-20' agar di atas dekorasi */}
      <div className="relative z-20 mt-4 flex flex-col h-full">
         
         {/* Header Teks */}
         <div className="flex-1"> {/* Flex-1 agar mendorong konten lain */}
             <div className="flex items-center gap-2 mb-4 text-rpn-dark/70 font-mono text-xs font-bold uppercase tracking-widest">
                <CalendarSearch size={14} />
                <span>Discovery Protocol</span>
             </div>

             <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl leading-tight text-rpn-dark uppercase mb-6">
                Explore <br />
                <span className="text-white drop-shadow-[4px_4px_0px_#0F172A] stroke-black">
                   Thousands
                </span> <br />
                of Events
             </h1>
         </div>

         {/* Tombol CTA */}
         {/* Di mobile, kita pastikan dia punya margin bottom agar tidak ketabrak kartu */}
         <div className="mb-32 md:mb-0"> 
             <button
                onClick={handleExploreClick}
                className="
                   bg-rpn-dark text-white 
                   border-2 border-white 
                   px-6 py-4 rounded-lg 
                   font-bold font-sans uppercase tracking-wide 
                   shadow-[4px_4px_0px_0px_#fff] 
                   hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff] 
                   active:translate-x-[4px] active:translate-y-[4px] active:shadow-none 
                   transition-all flex items-center gap-3 w-fit
                "
             >
                Start Exploring
                <LucideExternalLink className="size-5" />
             </button>
         </div>
      </div>

      {/* --- TUMPUKAN KARTU EVENT (DEKORASI) --- */}
      <div className="
          pointer-events-none opacity-90
          absolute bottom-[-2rem] left-1/2 -translate-x-1/2 scale-75
          md:top-1/2 md:right-[-4rem] md:bottom-auto md:left-auto 
          md:-translate-y-1/2 md:translate-x-0 md:scale-90 
          lg:scale-100
          
          w-64 grid grid-cols-1 grid-rows-1
      ">
        
        {isLoading && (
          <div className="bg-white border-2 border-black p-4 rounded-xl font-mono text-xs animate-pulse">
             Scanning Network...
          </div>
        )}

        {events?.slice(0, 3).map((event, index) => (
          <div
            key={event.id}
            className="min-w-[18rem] col-[1/-1] row-[1/-1] transition-transform duration-500 group-hover:scale-105"
            style={{
              transform: `
                translateX(calc(${index} * -10px)) 
                translateY(calc(${index} * 10px)) 
                rotate(calc(6deg * ${index + 1}))
              `,
              zIndex: 3 - index
            }}
          >
             <div className="pointer-events-none select-none shadow-xl">
                <EventCard event={event} />
             </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function FindPeopleHeroCard() {
  const navigate = useNavigate();
  const { triggerTransition } = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
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
      navigate({ to: "/search" });
    }, 800);
  };
  return (
    <div 
      ref={cardRef}
      // Tambahkan onClick navigasi ke halaman search
      onClick={handleExploreClick}
      className="
        col-span-1 row-span-2 md:col-span-2 md:row-span-2 
        card-brutalist bg-rpn-dark border-2 border-rpn-blue 
        p-6 relative overflow-hidden flex flex-col justify-center 
        group cursor-pointer
        hover:border-white hover:shadow-[0_0_20px_rgba(41,171,226,0.3)] 
        transition-all
      "
    >
        {/* Ikon Latar Belakang */}
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity group-hover:scale-110 duration-500">
            <Users size={64} className="text-rpn-blue" />
        </div>
        
        <h3 className="text-white font-pixel text-sm uppercase mb-4 tracking-widest text-rpn-blue group-hover:text-white transition-colors">
            Community
        </h3>
        
        {/* Visualisasi Tombol Search Palsu (CTA) */}
        <div className="w-full bg-black/30 border-2 border-rpn-muted/30 text-rpn-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between group-hover:border-rpn-blue group-hover:text-white transition-colors">
            <span>Find people...</span>
            <div className="bg-rpn-blue text-black p-1.5 rounded">
                <Search size={16} />
            </div>
        </div>
        
        <p className="text-[10px] text-rpn-muted mt-3 group-hover:text-gray-300 transition-colors">
            Search by Wallet Address (0x...) or Username.
        </p>
    </div>
  )
}

export default EventsHeroCard;

function Index() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Bento Grid Layout */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[140px]">
          <div className="col-span-1 row-span-3 md:col-span-3 md:row-span-3">
            <EventsHeroCard />
          </div>
          <ProfileCard className="col-span-1 row-span-4 md:col-span-3 md:row-span-3" />

          {/* 1. SEARCH PEOPLE (Kiri) */}
          <FindPeopleHeroCard />
          {/* 2. LEARN ABOUT US (Tengah) */}
          <div className="col-span-1 row-span-2 md:col-span-2 md:row-span-2 card-brutalist bg-white p-6 relative overflow-hidden flex flex-col justify-between group">
            
            {/* Dekorasi Garis Miring */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rpn-blue/10 rotate-45 group-hover:bg-rpn-blue/20 transition-colors"></div>
            
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-rpn-blue rounded-full animate-ping"></div>
                    <span className="text-[10px] font-bold text-rpn-dark uppercase tracking-widest font-sans">
                        RPN Ecosystem
                    </span>
                </div>
                
                {/* Typography Efektif: Besar, Tebal, Rapat */}
                <h2 className="text-3xl md:text-4xl font-black text-rpn-dark leading-[0.9] tracking-tighter uppercase mb-2">
                    We Build <br/>
                    <span className="text-rpn-blue">Digital</span> <br/>
                    Legacy.
                </h2>
            </div>

            <div className="flex items-center justify-between border-t-2 border-black/10 pt-4 mt-2">
                <p className="text-xs text-gray-500 font-medium max-w-[120px] leading-tight">
                    Learn how we tokenize memories.
                </p>
                <button className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <ArrowRight size={16} />
                </button>
            </div>
          </div>

          {/* 3. ADD NEW MOMENT (Kanan) */}
          {/* Kita gunakan MintMomentSection tapi versi 'Card Kecil' atau tombol pemicu */}
          <div className="col-span-1 row-span-2 md:col-span-2 md:row-span-2 card-brutalist bg-rpn-blue p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-blue-400 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,0.4)]">
            
            {/* Background Icon Besar */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <PlusSquare size={120} className="text-black" />
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                </div>
                
                <h3 className="text-xl font-black text-black uppercase font-pixel mb-1">
                    Mint Moment
                </h3>
                <p className="text-xs text-black/70 font-bold max-w-[150px] mx-auto">
                    Turn your photo into a permanent NFT asset.
                </p>
            </div>
          </div>

          {/* Info Card - Different size */}
          <div className="md:col-span-3 md:row-span-2 card-brutalist bg-card p-8 relative overflow-hidden">
            <h2 className="text-display text-xl md:text-2xl text-card-foreground mb-4 leading-tight">
              Comprehensive
              <br />
              Programs For Complex
              <br />
              Journeys
            </h2>

            <div className="absolute bottom-6 right-6 w-16 h-16 pixel-pattern text-primary opacity-30" />

            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="inline-block text-sm font-bold text-primary">
                20% Better Outcomes
              </span>
            </div>
          </div>

          {/* Small CTA Card */}
          <div className="md:col-span-3 md:row-span-1 card-brutalist bg-accent/50 p-6 relative overflow-hidden flex items-center justify-between">
            <p className="text-accent-foreground font-bold">
              Ready to get started?
            </p>
            <button className="btn-brutalist bg-primary text-primary-foreground text-sm py-1.5 px-4">
              Book A Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
