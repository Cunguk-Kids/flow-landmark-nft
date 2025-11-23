import { TrendingUp, Images, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTransition } from '@/contexts/TransitionContext';
import { useRef } from 'react';

export default function ExploreMomentsCard() {
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
      navigate({ to: '/moments' });
    }, 800);
  };

  // Fetch moments (using a dummy address or global if API supported it, 
  // but for now we'll use a known address or just show loading/empty state as placeholder)
  // Ideally, we'd have a useExploreMoments hook. 
  // For this demo, we'll just use the hook we have, maybe for a specific user or just show UI structure.
  // Since we don't have a global explore API ready, we will mock the UI structure requested.

  return (
    <>
      <div className="p-4 relative overflow-hidden group hover:bg-rpn-blue/5 transition-all duration-300 rounded-xl flex flex-col justify-between border border-transparent hover:border-rpn-blue/20">

        {/* --- DEKORASI MENGAMBANG --- */}
        {/* Ikon Utama Besar */}
        <div className="absolute -right-4 -top-4 text-rpn-blue/10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
          <Images size={80} strokeWidth={1.5} />
        </div>

        {/* Header Kecil */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="p-1.5 bg-white shadow-sm border border-rpn-dark/10 text-rpn-dark rounded-lg group-hover:text-rpn-blue transition-colors">
            <Images size={16} />
          </div>
          {/* Indikator Live */}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>

        {/* Data */}
        <div className="relative z-10 mt-2">
          <h4 className="text-3xl font-black text-rpn-dark leading-none mb-1 tracking-tighter">
            2.4k<span className="text-rpn-blue text-xl">+</span>
          </h4>
          <p className="text-[10px] font-bold text-rpn-muted uppercase tracking-widest leading-tight">
            Total <br /> Mints
          </p>
        </div>
      </div>

      {/* 2. Explore Button (Bottom Row - 2x1) */}
      <div
        ref={cardRef}
        onClick={handleExploreClick}
        className="col-span-2 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-rpn-dark/5 group-hover:bg-rpn-dark/10 transition-colors rounded-xl" />

        <div className="relative h-full flex items-center justify-between px-4 py-2 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-black/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <TrendingUp size={18} className="text-rpn-blue" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rpn-dark uppercase leading-none">Explore</h3>
              <p className="text-[10px] text-rpn-muted font-bold mt-0.5">Discover community moments</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-rpn-blue text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </>
  );
}
