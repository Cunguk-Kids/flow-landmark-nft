import type { Event } from "@/hooks/useEventList";
import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Ticket, Users } from "lucide-react"; // Tambah icon Ticket

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // Parse date
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = eventDate.getDate();
  console.log(event)
  return (
    <div className="group relative h-full">
      {/* Card Container */}
      <div className="
        h-full flex flex-col
        bg-rpn-card 
        border-2 border-rpn-blue 
        rounded-xl 
        overflow-hidden 
        shadow-[6px_6px_0px_0px_rgba(41,171,226,0.2)] 
        transition-all duration-300 
        hover:-translate-y-1 
        hover:shadow-[8px_8px_0px_0px_rgba(41,171,226,0.4)]
        hover:border-white
      ">
        
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden border-b-2 border-rpn-blue group-hover:border-white transition-colors">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            // Placeholder dengan Gradient RPN
            <div className="w-full h-full bg-linear-to-br from-rpn-blue via-blue-600 to-rpn-dark flex items-center justify-center">
               <div className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
               </div>
               <div className="text-6xl animate-bounce">🎉</div>
            </div>
          )}
          
          {/* Type Badge (Overlay) */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-rpn-blue text-rpn-blue px-2 py-1 text-[10px] font-bold font-pixel uppercase rounded shadow-sm">
             {/* Asumsi ada field type, atau hardcode 'Event' */}
             EVENT
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex-1 flex flex-col bg-rpn-card">
          
          {/* Date Badge and Info */}
          <div className="flex items-start gap-4 mb-3">
            
            {/* Date Badge (Kotak Kalender Retro) */}
            <div className="flex flex-col items-center justify-center border-2 border-rpn-blue/30 bg-rpn-dark rounded-lg p-2 min-w-[65px]">
              <span className="text-[10px] font-bold text-rpn-blue font-pixel mb-1">
                {month}
              </span>
              <span className="text-2xl font-black text-white leading-none font-sans">
                {day}
              </span>
            </div>

            {/* Location and Title */}
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs font-mono text-rpn-muted mb-2">
                <MapPin className="size-3 text-rpn-blue" />
                <span className="truncate">{event.location}</span>
              </div>

              <h3 className="text-lg font-bold text-white leading-tight mb-2 font-sans group-hover:text-rpn-blue transition-colors line-clamp-2">
                {event.title}
              </h3>

              <p className="text-xs text-rpn-muted line-clamp-2 font-sans">
                {event.description}
              </p>
            </div>
          </div>

          {/* Spacer untuk mendorong footer ke bawah */}
          <div className="flex-1"></div>

          <div className="pt-4 border-t border-rpn-blue/20 mt-2 space-y-3">
            
            {/* Baris 1: Organizer & Quota */}
            <div className="flex items-center justify-between text-xs text-rpn-muted font-mono">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rpn-dark border border-rpn-blue/30 flex items-center justify-center">
                        <Clock className="size-3 text-rpn-blue" />
                    </div>
                    {/* Organizer */}
                    <span className="truncate max-w-[80px]">By {event.organizer || "RPN"}</span>
                </div>

                {/* --- TAMBAHAN: SLOT INDICATOR --- */}
                <div className="flex items-center gap-1.5">
                    <Users className="size-3 text-rpn-blue" />
                    <span>
                        {/* Asumsi kita punya field 'attendeesCount' nanti, sementara placeholder */}
                        <span className="text-white font-bold">?</span> / {event.quota}
                    </span>
                </div>
            </div>

            {/* Baris 2: Price & Status (Full Width) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rpn-dark rounded border border-rpn-blue/30">
                    <Ticket className="size-3 text-green-400" />
                    {event.price > 0 ? (
                        <span className="text-xs font-bold text-green-400 font-mono">{event.price} FLOW</span>
                    ) : (
                        <span className="text-xs font-bold text-green-400 font-mono uppercase">FREE</span>
                    )}
                </div>
                
                {/* Tombol Kecil "View" */}
                <Link
                    to="/events/$eventId"
                    params={{ eventId: String(event.id) }}
                    className="text-[10px] font-bold text-rpn-blue uppercase tracking-widest group-hover:underline decoration-2 underline-offset-2 transition-all cursor-pointer"
                >
                    View Details &rarr;
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}