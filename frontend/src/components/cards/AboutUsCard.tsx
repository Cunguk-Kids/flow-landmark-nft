'use client';

import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

interface AboutUsCardProps {
  className?: string;
}

export default function AboutUsCard({ className = "" }: AboutUsCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate({ to: '/about' })}
      className={`
        col-span-1 row-span-2 md:col-span-2 md:row-span-2 
        card-brutalist bg-white p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer
        border-2 border-rpn-dark
        shadow-[4px_4px_0px_0px_#0F172A]
        hover:translate-x-[2px] hover:translate-y-[2px]
        hover:shadow-[2px_2px_0px_0px_#0F172A]
        transition-all duration-300
        ${className}
      `}
    >
      
      {/* Dekorasi Garis Miring */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-rpn-blue/10 rotate-45 group-hover:bg-rpn-blue/20 transition-colors duration-500"></div>
      
      {/* Konten Atas */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-rpn-blue rounded-full animate-ping"></div>
          <span className="text-[10px] font-bold text-rpn-dark uppercase tracking-widest font-sans">
            RPN Ecosystem
          </span>
        </div>
        
        {/* Typography Efektif */}
        <h2 className="text-3xl md:text-4xl font-black text-rpn-dark leading-[0.9] tracking-tighter uppercase mb-2 drop-shadow-sm">
          We Build <br />
          <span className="text-rpn-blue">Digital</span> <br />
          Legacy.
        </h2>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t-2 border-black/10 pt-4 mt-2 relative z-10">
        <p className="text-xs text-gray-500 font-medium max-w-[120px] leading-tight group-hover:text-rpn-dark transition-colors">
          Learn how we tokenize memories.
        </p>
        
        {/* Tombol Bulat (Visual Only) */}
        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-300 group-hover:rotate-[-45deg]">
          <ArrowRight size={16} />
        </div>
      </div>
      
    </div>
  );
}