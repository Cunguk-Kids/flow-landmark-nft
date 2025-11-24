import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEventDetail } from "@/hooks/api/useEventDetail";
import { ArrowLeft, MapPin, Calendar, User, Share2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRegisterEvent } from "@/hooks/transactions/useRegisterEvent";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import { useCheckInUser } from "@/hooks/api/useCheckInUser";
import { toast } from 'sonner';

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useFlowCurrentUser();
  const { data: event, isLoading, refetch } = useEventDetail(eventId, user?.addr);
  console.log(event, 'woi')
  const {
    register,
    isPending: isRegistering,
    isSealed: isRegistered,
    error: registerError
  } = useRegisterEvent();

  const {
    mutate: checkIn,
    isPending: isCheckingIn,
    isSuccess: isCheckedIn,
    isError: isCheckInError
  } = useCheckInUser();

  const handleCheckIn = () => {
    checkIn(eventId, {
      onSuccess: () => {
        toast.success('Check-in successful!', {
          description: 'You have successfully checked in to the event.'
        });
        refetch(); // Refetch event detail after check-in
      },
      onError: (error: any) => {
        toast.error('Check-in failed', {
          description: error?.response?.data?.error || 'You may have already checked in.'
        });
      }
    });
  };

  useEffect(() => {
    if (isRegistered) {
      toast.success('Registration successful!', {
        description: 'You have been registered for this event.'
      });
      refetch(); // Refetch event detail after registration
    }
  }, [isRegistered, refetch]);

  useEffect(() => {
    if (registerError) {
      toast.error('Registration failed', {
        description: registerError.message
      });
    }
  }, [registerError]);

  if (isLoading) return <div className="min-h-screen bg-rpn-dark flex items-center justify-center text-rpn-blue font-pixel animate-pulse">LOADING DATA...</div>;
  if (!event) return <div className="min-h-screen bg-rpn-dark flex items-center justify-center text-red-500 font-mono">EVENT NOT FOUND</div>;

  const eventDate = new Date(event.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans selection:bg-rpn-blue selection:text-white pb-20">

      {/* --- 1. NAVIGATION BAR --- */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between">
          <button
            onClick={() => navigate({ to: '/events' })}
            className="pointer-events-auto bg-rpn-dark/80 backdrop-blur border border-rpn-blue/30 text-white p-3 rounded-xl hover:bg-rpn-blue hover:text-black transition-all shadow-lg group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button className="pointer-events-auto bg-rpn-dark/80 backdrop-blur border border-rpn-blue/30 text-white p-3 rounded-xl hover:bg-white hover:text-black transition-all shadow-lg">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* --- 2. HERO IMAGE (Cinematic) --- */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-rpn-dark/50 to-rpn-dark z-10"></div>
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={event.image}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Judul Besar di Atas Banner */}
        <div className="absolute bottom-0 left-0 w-full z-20 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-3 py-1 bg-rpn-blue text-rpn-dark text-xs font-bold font-pixel uppercase mb-4 rounded">
              Upcoming Event
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase font-pixel leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* --- 3. CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* --- KOLOM KIRI: INFO UTAMA --- */}
          <div className="lg:col-span-2 space-y-8">

            {/* Host Info */}
            <div className="flex items-center gap-4 p-4 border border-white/10 rounded-2xl bg-white/5">
              <div className="w-12 h-12 rounded-full bg-rpn-blue flex items-center justify-center text-rpn-dark">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs text-rpn-muted uppercase font-bold">Hosted By</p>
                <p className="text-white font-mono font-bold">{event.organizer}</p>
              </div>
              {/* Badge Verified Host (Ide masa depan) */}
              <div className="ml-auto">
                <ShieldCheck className="text-green-500" />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-rpn-blue rounded-full"></span>
                About Event
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {event.description}
              </p>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-rpn-card border border-rpn-blue/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-rpn-blue">
                  <Calendar size={24} />
                  <span className="font-bold uppercase text-xs tracking-wider">Date & Time</span>
                </div>
                <p className="text-white font-bold text-lg">{eventDate}</p>
                <p className="text-rpn-muted">{eventTime}</p>
              </div>
              <div className="p-6 bg-rpn-card border border-rpn-blue/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-rpn-blue">
                  <MapPin size={24} />
                  <span className="font-bold uppercase text-xs tracking-wider">Location</span>
                </div>
                <p className="text-white font-bold text-lg truncate">{event.location}</p>
                <p className="text-rpn-muted">On-site / Online</p>
              </div>
            </div>

          </div>

          {/* --- KOLOM KANAN: ACTION CARD (Sticky) --- */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="bg-rpn-card border-2 border-rpn-blue rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(41,171,226,0.2)]">

                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                  <span className="text-rpn-muted font-mono text-sm">Price</span>
                  <span className="text-2xl font-black text-white font-pixel">FREE</span>
                </div>

                <div className="space-y-4 mb-8">
                  {/* 1. LOGIKA HITUNG */}
                  {(() => {
                    const attendeesCount = event.attendees?.length || 0;
                    const percentage = Math.min((attendeesCount / event.quota) * 100, 100);
                    const seatsLeft = event.quota - attendeesCount;

                    // Tentukan Warna & Status Text
                    let statusColor = "bg-green-500";
                    let textColor = "text-green-500";
                    let statusText = "Spots Available";

                    if (percentage >= 100) {
                      statusColor = "bg-red-600";
                      textColor = "text-red-600";
                      statusText = "SOLD OUT";
                    } else if (percentage > 80) {
                      statusColor = "bg-red-500";
                      textColor = "text-red-500";
                      statusText = "Final Call!";
                    } else if (percentage > 50) {
                      statusColor = "bg-yellow-500";
                      textColor = "text-yellow-500";
                      statusText = "Filling Fast";
                    }

                    return (
                      <>
                        {/* Label Atas */}
                        <div className="flex justify-between text-sm items-end">
                          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Capacity</span>
                          <span className="text-white font-bold font-mono">
                            <span className={textColor}>{attendeesCount}</span>
                            <span className="text-gray-600 mx-1">/</span>
                            {event.quota}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-white/5 relative">
                          {/* Bar Berwarna */}
                          <div
                            className={`h-full transition-all duration-500 ease-out ${statusColor}`}
                            style={{ width: `${percentage}%` }}
                          ></div>

                          {/* Efek Kilau (Opsional, biar techy) */}
                          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]"></div>
                        </div>

                        {/* Label Bawah */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full House"}
                          </span>
                          <p className={`text-xs font-bold uppercase animate-pulse ${textColor}`}>
                            {statusText}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* TOMBOL AKSI */}
                {/* Register Button */}
                <div className="space-y-2">
                  <Button
                    onClick={() => register(eventId)}
                    disabled={isRegistering || !user?.loggedIn || event.isRegistered}
                    className={`
                                  w-full h-14 font-black text-lg uppercase rounded-xl shadow-lg transition-all
                                  ${event.isRegistered
                        ? "bg-green-900/50 text-green-500 border-2 border-green-900 cursor-not-allowed hover:bg-green-900/50 shadow-none"
                        : "bg-rpn-blue hover:bg-white hover:text-rpn-blue text-rpn-dark"
                      }
                              `}
                  >
                    {isRegistering ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" /> Processing...
                      </span>
                    ) : event?.isRegistered ? (
                      <span className="flex items-center gap-2">
                        <ShieldCheck /> Already Registered
                      </span>
                    ) : (
                      "Register Now"
                    )}
                  </Button>

                  {event?.isRegistered && (
                    <p className="text-xs text-center text-green-400 font-mono">
                      ✓ You are registered for this event
                    </p>
                  )}
                </div>

                <p className="text-[10px] text-center text-gray-500 my-4">
                  By registering, you agree to receive an EventPass (SBT) upon check-in.
                </p>

                {/* Check-in Button */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn || event.isCheckedIn || !event.isRegistered}
                    className={`
                                w-full h-14 font-black text-lg uppercase rounded-xl shadow-lg transition-all
                                ${event.isCheckedIn
                        ? "bg-blue-900/50 text-blue-400 border-2 border-blue-900 cursor-not-allowed hover:bg-blue-900/50 shadow-none"
                        : "bg-rpn-blue hover:bg-white hover:text-rpn-blue text-white"
                      }
                              `}
                  >
                    {isCheckingIn ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" /> Checking in...
                      </span>
                    ) : event.isCheckedIn ? (
                      <span className="flex items-center gap-2">
                        <ShieldCheck /> Already Checked In
                      </span>
                    ) : (
                      "Check In Now"
                    )}
                  </Button>

                  {event.isCheckedIn && (
                    <p className="text-xs text-center text-blue-400 font-mono">
                      ✓ You have checked in to this event
                    </p>
                  )}
                </div>

                <p className="text-[10px] text-center text-gray-500 my-4">
                  This button is for testing only, will be removed in real case
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}