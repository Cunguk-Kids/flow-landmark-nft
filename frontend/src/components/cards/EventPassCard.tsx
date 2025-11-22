'use client';

import { Ticket, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { type EventPassData } from '@/hooks/api/useGetEventPass';

interface EventPassCardProps {
  pass: EventPassData;
}

export default function EventPassCard({ pass }: EventPassCardProps) {
  const event = pass.edges?.event;
  const eventDate = event?.start_date 
    ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : 'N/A';

  return (
    <div className={`
      relative flex flex-col 
      bg-rpn-dark border-2 ${pass.is_redeemed ? 'border-gray-700 opacity-60' : 'border-rpn-blue'} 
      rounded-xl overflow-hidden 
      transition-all duration-300
      hover:-translate-y-1
      group
    `}>
      
      {/* Bagian Atas: Gambar Event */}
      <div className="relative h-24 bg-black overflow-hidden border-b border-white/10">
        {event?.thumbnail ? (
           <img 
             src={event.thumbnail} 
             alt={event.name} 
             className={`w-full h-full object-cover ${pass.is_redeemed ? 'grayscale' : ''}`}
           />
        ) : (
           <div className="w-full h-full bg-rpn-card flex items-center justify-center">
             <Ticket className="text-rpn-muted opacity-20" />
           </div>
        )}
        
        {/* Badge Status */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[8px] font-bold uppercase flex items-center gap-1 shadow-md ${pass.is_redeemed ? 'bg-gray-800 text-gray-400' : 'bg-green-500 text-black'}`}>
            {pass.is_redeemed ? (
                <>
                  <XCircle size={10} /> Used
                </>
            ) : (
                <>
                  <CheckCircle2 size={10} /> Active
                </>
            )}
        </div>
      </div>

      {/* Bagian Bawah: Info */}
      <div className="p-3 flex flex-col flex-1 justify-between">
         <div>
            <h4 className="text-xs font-bold text-white line-clamp-1 font-pixel mb-1" title={event?.name}>
                {event?.name || "Unknown Event"}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-rpn-muted font-mono">
                <Calendar size={10} />
                {eventDate}
            </div>
         </div>

         <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
             <span className="text-[8px] text-rpn-muted uppercase font-bold">PASS #{pass.pass_id}</span>
             <div className="w-2 h-2 rounded-full bg-rpn-blue animate-pulse"></div>
         </div>
      </div>

      {/* Dekorasi "Sobekan Tiket" (Kiri & Kanan) */}
      <div className="absolute top-24 -left-1.5 w-3 h-3 bg-rpn-card rounded-full border-r-2 border-gray-600"></div>
      <div className="absolute top-24 -right-1.5 w-3 h-3 bg-rpn-card rounded-full border-l-2 border-gray-600"></div>

    </div>
  );
}