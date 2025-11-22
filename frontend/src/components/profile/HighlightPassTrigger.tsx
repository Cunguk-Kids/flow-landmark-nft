'use client';

import React from 'react';
import { Ticket } from 'lucide-react';

export default function HighlightPassTrigger() {
  return (
    <div className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-4 shadow-lg cursor-not-allowed opacity-70 h-full flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2 relative z-10">
            <h3 className="text-sm font-bold text-white uppercase font-pixel tracking-widest flex items-center gap-2">
                Top Badge
            </h3>
            <span className="text-[8px] text-rpn-muted bg-rpn-dark px-1.5 py-0.5 rounded font-mono">
                SOON
            </span>
        </div>

        <div className="w-full aspect-square bg-rpn-dark/30 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-rpn-muted relative">
             <Ticket size={32} className="opacity-20 mb-2" />
             <p className="text-[10px] font-mono text-center px-2">Showcase your rarest Event Pass here.</p>
        </div>
    </div>
  );
}