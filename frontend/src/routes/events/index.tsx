import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEventList } from "@/hooks/api/useEventList"; // <-- Import hook baru
import { EventCard } from "@/components/EventCard";
import { motion } from "framer-motion"; 
import { CalendarSearch, Terminal, RefreshCw, PlusSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateEventModal from "@/components/modals/CreateEventModal";
import { useFlowCurrentUser } from "@onflow/react-sdk";

export const Route = createFileRoute("/events/")({
  component: Events,
});

function Events() {
  // Panggil hook (default page 1)
  const navigate = useNavigate();
  const { user } = useFlowCurrentUser();
  const { data: events, isLoading, error, refetch, isRefetching } = useEventList();
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans relative selection:bg-rpn-blue selection:text-white">
      <div className="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button 
            onClick={handleBack}
            className="pointer-events-auto bg-rpn-card/80 backdrop-blur-md border border-rpn-blue/30 text-rpn-text p-3 rounded-xl hover:bg-rpn-blue hover:text-white transition-all group shadow-lg"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      {/* --- BACKGROUND DECORATION --- */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ 
            backgroundImage: 'linear-gradient(#29ABE2 1px, transparent 1px), linear-gradient(90deg, #29ABE2 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}
      />

      <motion.div
        className="relative z-10 p-4 md:p-8 pt-24 md:pt-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="mx-auto max-w-7xl">
          
          {/* --- HEADER SECTION --- */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-l-4 border-rpn-blue pl-6 py-2 gap-4">
            <div>
                <div className="flex items-center gap-2 text-rpn-blue font-mono text-xs font-bold uppercase tracking-widest mb-2">
                   <Terminal size={14} />
                   <span>System / Events_Log</span>
                </div>

                <h1 className="font-pixel text-4xl md:text-6xl leading-tight text-white uppercase mb-4 drop-shadow-[4px_4px_0px_rgba(41,171,226,0.3)]">
                  All Events
                </h1>
                
                <p className="text-rpn-muted text-lg max-w-2xl font-sans">
                  Discover amazing gatherings, workshops, and meetups happening in the <span className="text-rpn-blue font-bold">RPN Ecosystem</span>.
                </p>
            </div>

            <div className="flex gap-4 items-center">
              {/* Tombol Refresh Manual (Opsional tapi berguna) */}
              <Button 
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  variant="outline"
                  className="border-rpn-blue text-rpn-blue hover:bg-rpn-blue hover:text-white rounded-lg"
              >
                  <RefreshCw size={16} className={isRefetching ? "animate-spin mr-2" : "mr-2"} />
                  {isRefetching ? "Syncing..." : "Refresh Data"}
              </Button>
              {user?.loggedIn && (
                  <Button 
                      onClick={() => setIsCreateOpen(true)}
                      className="bg-rpn-blue text-white hover:bg-white hover:text-rpn-blue font-bold px-6 py-6 rounded-xl shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#fff] transition-all flex items-center gap-2"
                  >
                      <PlusSquare size={20} />
                      <span className="font-pixel text-xs uppercase">Create Event</span>
                  </Button>
              )}
            </div>
          </div>

          {/* --- CONTENT GRID --- */}
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-rpn-blue animate-pulse font-pixel text-xs">
               <div className="w-12 h-12 border-4 border-t-rpn-blue border-r-rpn-blue border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
               SCANNING DATABASE...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border-2 border-red-500 text-red-500 p-8 rounded-xl text-center font-mono">
              <p className="font-bold text-xl mb-2">ERROR_CONNECTION_LOST</p>
              <p className="text-sm">Failed to load events data. Is the backend running?</p>
              <p className="text-xs mt-2 opacity-70">{(error as Error).message}</p>
            </div>
          )}

          {/* Data Grid */}
          {events && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {events.map((event, index) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }} // Efek muncul berurutan
                >
                    {/* EventCard menerima data yang sudah di-transformasi oleh Hook */}
                    <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events?.length === 0 && (
             <div className="text-center py-20 opacity-50">
                <CalendarSearch size={48} className="mx-auto mb-4 text-rpn-muted" />
                <p className="font-pixel text-xs text-rpn-muted">NO EVENTS DETECTED</p>
             </div>
          )}

        </div>
      </motion.div>
      <CreateEventModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
            // Refresh list setelah sukses create
            if (refetch) refetch(); 
        }}
      />
    </div>
  );
}