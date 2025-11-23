'use client';

import { useNavigate } from '@tanstack/react-router';
import { ShoppingBag, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

interface MarketplaceCardProps {
  className?: string;
}

export default function MarketplaceCard({ className = "" }: MarketplaceCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate({ to: '/marketplace' })}
      className={`
        md:col-span-4 md:row-span-2 
        card-brutalist bg-[#0F172A] /* RPN Dark */
        border-2 border-white/10
        p-8 relative overflow-hidden 
        flex flex-col justify-between 
        group cursor-pointer
        hover:border-rpn-blue hover:shadow-[0_0_30px_rgba(74,222,128,0.1)]
        transition-all duration-300
        ${className}
      `}
    >

      {/* --- DEKORASI BACKGROUND (CHART) --- */}
      <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-10 pointer-events-none">
        {/* Simulasi Grafik Naik */}
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full text-green-500 fill-current">
          <path d="M0 100 L0 80 L20 85 L40 60 L60 70 L90 40 L120 50 L150 20 L180 30 L200 0 L200 100 Z" />
        </svg>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest font-mono">
              Live Market
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white font-pixel uppercase leading-tight tracking-tighter drop-shadow-lg">
            Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Assets</span> <br />
            & Collectibles
          </h2>
        </div>

        {/* Icon Floating */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
          <ArrowUpRight size={32} />
        </div>
      </div>

      {/* --- STATS ROW (Bento Mini di dalam Card) --- */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

        {/* Stat 1: Volume */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm group-hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-1">
            <Activity size={12} /> 24h Volume
          </div>
          <p className="text-xl font-mono font-bold text-white">
            12.5 <span className="text-xs text-green-400">FLOW</span>
          </p>
        </div>

        {/* Stat 2: Items */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm group-hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-1">
            <ShoppingBag size={12} /> Listings
          </div>
          <p className="text-xl font-mono font-bold text-white">
            842
          </p>
        </div>

        {/* Stat 3: Trend (Hidden on mobile small) */}
        <div className="hidden md:block bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm group-hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-1">
            <TrendingUp size={12} /> Trend
          </div>
          <p className="text-xl font-mono font-bold text-green-400">
            +5.2%
          </p>
        </div>

        {/* CTA Button (Fake) */}
        <div className="flex items-end">
          <button className="w-full bg-white text-black font-bold font-pixel text-xs py-3 rounded hover:bg-green-400 transition-colors shadow-lg">
            ENTER MARKET
          </button>
        </div>

      </div>

    </div>
  );
}