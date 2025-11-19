import { useEventList } from "@/hooks/useEventList";
import { EventCard } from "@/components/EventCard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LucideExternalLink } from "lucide-react";
import { useTransition } from "@/contexts/TransitionContext";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  useFlowQuery,
  useFlowMutate,
  useFlowTransactionStatus,
  useFlowCurrentUser,
} from '@onflow/react-sdk';
import { useSetupAccount } from "@/hooks/transactions/useSetupAccount";

export const Route = createFileRoute("/")({
  component: Index,
});

function EventsHeroCard() {
  const { data: events, isLoading, error } = useEventList();
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
      className="md:col-span-3 md:row-span-3 card-brutalist bg-red-400 p-8 md:p-12 relative flex flex-col justify-between z-10"
    >
      <h1 className="text-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] mt-8">
        Explore Hundred
        <br />
        Events
      </h1>

      <button
        onClick={handleExploreClick}
        className="btn-brutalist bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg self-start flex items-center gap-2"
      >
        Explore Event
        <LucideExternalLink className="size-4" />
      </button>

      {/* Event Cards Decoration - positioned absolutely */}
      <div className="absolute top-4 right-4 w-64 grid grid-cols-1 grid-rows-1">
        {isLoading && (
          <div className="text-xs text-muted-foreground">Loading...</div>
        )}

        {events?.slice(0, 3).map((event, index) => (
          <div
            className="min-w-[20rem] col-[1/-1] row-[1/-1]"
            style={{
              transform: `rotate(calc(5deg*${index + 1}))`,
            }}
          >
            <EventCard key={event.id} event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Index() {
  const { user, authenticate, unauthenticate } = useFlowCurrentUser();
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Bento Grid Layout */}
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[140px] overflow-hidden">
          <EventsHeroCard />
          {/* Accent Card - Square-ish */}
          <div className="md:col-span-3 md:row-span-3 card-brutalist bg-accent relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-6 right-6 w-20 h-20 pixel-pattern text-black opacity-20" />
            <div className="text-center p-6">
              <div className="w-40 h-40 mx-auto mb-2 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-br from-accent to-accent/80 flex items-center justify-center">
                  <div className="text-7xl">🌟</div>
                </div>
              </div>
                {user?.loggedIn ? 
                  (
                    <div>
                      <p className="text-black">Connected: {user.addr}</p>
                      <Button onClick={unauthenticate}>Disconnect</Button>
                    </div>
                  )
                : (
                  <Button onClick={authenticate} className="btn-brutalist">Connect Wallet</Button>
                )}
            </div>
          </div>

          {/* Green Feature Card - Wide horizontal */}
          <div className="md:col-span-4 md:row-span-2 card-brutalist bg-primary p-8 relative overflow-hidden">
            <h2 className="text-display text-2xl md:text-3xl text-primary-foreground mb-6">
              Whole-Person Care
            </h2>

            <div className="flex flex-wrap gap-3">
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                🏥 A Dedicated Care Advocate
              </span>
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                💊 Proactive Interventions
              </span>
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                📱 Personalised Content
              </span>
              <span className="btn-brutalist bg-card text-card-foreground text-sm">
                📅 On-Demand Appointments
              </span>
            </div>

            <div className="absolute bottom-6 right-6 w-20 h-20 pixel-pattern text-black opacity-20" />
          </div>

          {/* Small Stats Card */}
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
