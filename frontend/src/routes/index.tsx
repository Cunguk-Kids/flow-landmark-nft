import { useEventList } from "@/hooks/useEventList";
import { EventCard } from "@/components/EventCard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LucideExternalLink, CalendarSearch } from "lucide-react";
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

    // Wait for animation, then navigate
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
        p-8 md:p-10 
        overflow-hidden 
        z-30 
        shadow-[8px_8px_0px_0px_rgba(15,23,42,0.4)] 
        group
        hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,0.4)]
        hover:translate-x-[1px] hover:translate-y-[1px]
        transition-all
      "
    >
      {/* --- DEKORASI BACKGROUND --- */}
      {/* Grid Pattern Halus */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      {/* Aksen Pojok Kiri Atas */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-rpn-dark opacity-50" />

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 mt-4">
         {/* Label Kecil */}
         <div className="flex items-center gap-2 mb-4 text-rpn-dark/70 font-mono text-xs font-bold uppercase tracking-widest">
            <CalendarSearch size={14} />
            <span>Discovery Protocol</span>
         </div>

         {/* Judul Besar */}
         <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl leading-tight text-rpn-dark uppercase mb-6">
            Explore <br />
            <span className="text-white drop-shadow-[4px_4px_0px_#0F172A] stroke-black">
               Thousands
            </span> <br />
            of Events
         </h1>

         {/* Tombol CTA */}
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

      {/* --- TUMPUKAN KARTU EVENT (DEKORASI KANAN) --- */}
      {/* Diposisikan absolute di kanan agar tidak mengganggu teks */}
      <div className="absolute top-1/2 right-[-4rem] -translate-y-1/2 w-64 grid grid-cols-1 grid-rows-1 pointer-events-none opacity-90 scale-90 md:scale-100">
        
        {isLoading && (
          <div className="bg-white border-2 border-black p-4 rounded-xl font-mono text-xs animate-pulse">
             Scanning Network...
          </div>
        )}

        {/* Loop Event Cards */}
        {events?.slice(0, 3).map((event, index) => (
          <div
            key={event.id}
            className="min-w-[18rem] col-[1/-1] row-[1/-1] transition-transform duration-500 group-hover:scale-105"
            style={{
              // Rotasi bertumpuk (Stack effect)
              transform: `
                translateX(calc(${index} * -10px)) 
                translateY(calc(${index} * 10px)) 
                rotate(calc(6deg * ${index + 1}))
              `,
              zIndex: 3 - index // Kartu pertama paling atas
            }}
          >
             {/* Kita bungkus EventCard agar ukurannya pas di dekorasi */}
             <div className="pointer-events-none select-none shadow-xl">
                <EventCard event={event} />
             </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Bento Grid Layout */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[140px]">
          <EventsHeroCard />
          <ProfileCard className="md:col-span-3 md:row-span-3" />

          {/* 3. WHOLE PERSON CARE (Tengah Bawah - Lebar) */}
          <div className="md:col-span-4 md:row-span-2 card-brutalist bg-primary p-8 relative overflow-hidden">
            <h2 className="text-display text-2xl md:text-3xl text-primary-foreground mb-6">
              Whole-Person Care
            </h2>

            <div className="flex flex-wrap gap-3">
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                🏥 A Dedicated Care Advocate
              </span>
              {/* ... chips lainnya ... */}
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                📅 On-Demand Appointments
              </span>
            </div>

            <div className="absolute bottom-6 right-6 w-20 h-20 pixel-pattern text-black opacity-20" />
          </div>

          {/* 4. STATS CARD (Kanan Bawah - Kecil) */}
          <div className="md:col-span-2 md:row-span-2 card-brutalist bg-secondary p-6 relative overflow-hidden flex flex-col justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-foreground mb-2">
                98%
              </div>
              <p className="text-sm text-secondary-foreground/80">
                Satisfaction Rate
              </p>
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 pixel-pattern text-black opacity-10" />
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
