import { Link, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typhography } from "@/components/ui/typhography";
import { Spinner } from "@/components/ui/spinner";
import { Calendar, MapPin, Users, Clock, LucideCheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { formatEvent, useCheckIn } from "@/hooks";
import { useAccount } from "@/hooks/useAccount";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import { toast } from "sonner";

import Galaxy from "@/components/Galaxy";
import { PageHeader } from "@/components/PageHeader";

const EventsDetailsPage = () => {
  const { event: rawEvent } = useLoaderData({
    from: "/events/details/$eventId",
  });
  const event = rawEvent ? formatEvent(rawEvent) : null;
  const { user } = useFlowCurrentUser();
  const { data: accountData } = useAccount();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const [isCheckInSuccess, setIsCheckInSuccess] = useState(false);

  if (!event)
    return (
      <div className="flex h-screen items-center justify-center">
        <Typhography variant="2xl" className="text-muted-foreground">
          Event not found.
        </Typhography>
      </div>
    );

  // Check if current user is registered for this event
  const userParticipant = event.participants.find(
    (p) => p.userAddress === accountData?.address
  );
  const isUserRegistered = !!userParticipant;
  const isUserCheckedIn = userParticipant?.isCheckedIn || isCheckInSuccess;

  const handleCheckIn = () => {
    if (!accountData?.address) {
      toast.error("Please connect your wallet first!");
      return;
    }

    checkIn(
      {
        eventId: String(event.eventId),
        userAddress: accountData.address,
        brandAddress: event.brandAddress,
      },
      {
        onSuccess: () => {
          toast.success("Checked in successfully!");
          setIsCheckInSuccess(true);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Check-in failed");
        },
      }
    );
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      className="min-h-screen bg-background relative isolate"
    >
      <div className="fixed inset-0 -z-1">
        <Galaxy />
      </div>

      {/* Header with back button */}
      <PageHeader showLogo />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Column - Event Card */}
          <div className="space-y-6">
            {/* Event Image Card with gradient border */}
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-primary/50 via-purple-500/50 to-pink-500/50">
              <div className="relative rounded-xl overflow-hidden bg-background/10 backdrop-blur-lg">
                <img
                  src={event.image}
                  alt={event.eventName}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Event info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-3">
                  <Typhography variant="3xl" className="font-bold">
                    {event.eventName}
                  </Typhography>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} />
                    <Typhography variant="t1">
                      {formatDateTime(
                        event.startDateTime.toISOString(),
                        "date"
                      )}
                    </Typhography>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    <Typhography variant="t1">
                      {event.partner?.name || "Location TBA"}
                    </Typhography>
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={
                      event.statusLabel === "Active" ? "default" : "secondary"
                    }
                  >
                    <Typhography variant="t2">{event.statusLabel}</Typhography>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Hosted By Section */}
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-4">
              <Typhography
                variant="lg"
                className="font-semibold text-muted-foreground"
              >
                Hosted By
              </Typhography>

              {event.partner && (
                <Link
                  to="/partners/details/$address"
                  params={{ address: event.partner.address }}
                >
                  <div className="flex items-center gap-3 mt-2 cursor-pointer hover:bg-background/10 rounded-lg p-2 -m-2 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      {event.partner.image ? (
                        <img
                          src={event.partner.image}
                          alt={event.partner.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Typhography variant="lg" className="font-bold">
                          {event.partner.name.charAt(0)}
                        </Typhography>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <Typhography variant="lg" className="font-semibold">
                        {event.partner.name}
                      </Typhography>
                      <Typhography variant="t2" className="text-muted-foreground line-clamp-1">
                        {event.partner.description}
                      </Typhography>
                    </div>
                    <Typhography variant="t3" className="text-primary">
                      View →
                    </Typhography>
                  </div>
                </Link>
              )}
            </div>

            {/* Participants Section */}
            {event.participantCount > 0 && (
              <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-3">
                <Typhography variant="lg" className="font-semibold">
                  {event.participantCount} Registered
                </Typhography>

                <div className="flex items-center gap-2 mt-2">
                  {/* Show first 5 participants as avatars */}
                  <div className="flex -space-x-2">
                    {event.participants?.slice(0, 5).map((participant) => {
                      const accountData = useAccount.fetch(
                        participant.userAddress
                      );
                      return (
                        <img
                          key={participant.id}
                          src={accountData.avatar}
                          alt={participant.userAddress}
                          className="w-8 h-8 rounded-full border-2 border-background"
                        />
                      );
                    })}
                  </div>
                  {event.participantCount > 5 && (
                    <Typhography
                      variant="t2"
                      className="text-muted-foreground ml-2"
                    >
                      and {event.participantCount - 5} others
                    </Typhography>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <Typhography variant="3xl" className="font-bold mb-2">
                {event.eventName}
              </Typhography>
            </div>

            {/* Date & Time Card */}
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
                  <Typhography
                    variant="t1"
                    className="text-primary font-semibold uppercase"
                  >
                    {
                      formatDateTime(
                        event.startDateTime.toISOString(),
                        "date"
                      ).split(" ")[0]
                    }
                  </Typhography>
                  <Typhography variant="2xl" className="text-primary font-bold">
                    {
                      formatDateTime(
                        event.startDateTime.toISOString(),
                        "date"
                      ).split(" ")[1]
                    }
                  </Typhography>
                </div>
                <div className="flex flex-col">
                  <Typhography variant="lg" className="font-semibold mb-1">
                    {formatDateTime(event.startDateTime.toISOString(), "date")}
                  </Typhography>
                  <Typhography variant="t1" className="text-muted-foreground">
                    {formatDateTime(event.startDateTime.toISOString(), "time")}{" "}
                    - {formatDateTime(event.endDateTime.toISOString(), "time")}
                  </Typhography>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="relative bg-background/10 backdrop-blur-lg border border-border rounded-xl overflow-hidden min-h-[200px]">
              {/* OpenStreetMap Static Background (no API key needed) */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://staticmap.openstreetmap.de/staticmap.php?center=${event.lat},${event.long}&zoom=14&size=600x300&maptype=mapnik)`,
                }}
              />

              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative p-6 flex items-start gap-3 h-full min-h-[200px]">
                <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm shadow-lg">
                  <MapPin className="text-white drop-shadow-lg" size={20} />
                </div>
                <div className="flex flex-col text-white drop-shadow-lg">
                  <Typhography
                    variant="lg"
                    className="font-semibold mb-1 drop-shadow-md"
                  >
                    Location
                  </Typhography>
                  <Typhography
                    variant="t1"
                    className="font-medium drop-shadow-md"
                  >
                    {event.partner?.name || "TBA"}
                  </Typhography>
                  <Typhography
                    variant="t2"
                    className="opacity-90 mt-1 drop-shadow-md"
                  >
                    Within {event.radius}m radius
                  </Typhography>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-4 flex flex-col">
              <Typhography variant="lg" className="font-semibold">
                Registration
              </Typhography>

              {event.statusLabel === "Pending" && (
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <Clock className="text-muted-foreground" size={20} />
                  <div className="flex flex-col">
                    <Typhography variant="t1" className="font-semibold">
                      Event Not Started
                    </Typhography>
                    <Typhography variant="t2" className="text-muted-foreground">
                      Registration will open soon.
                    </Typhography>
                  </div>
                </div>
              )}

              {event.statusLabel === "Ended" && (
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <Calendar className="text-muted-foreground" size={20} />
                  <div>
                    <Typhography variant="t1" className="font-semibold">
                      Event Ended
                    </Typhography>
                    <Typhography variant="t2" className="text-muted-foreground">
                      This event has concluded.
                    </Typhography>
                  </div>
                </div>
              )}

              {event.isFull && (
                <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <Users className="text-muted-foreground" size={20} />
                  <div>
                    <Typhography variant="t1" className="font-semibold">
                      Event Full
                    </Typhography>
                    <Typhography variant="t2" className="text-muted-foreground">
                      All spots have been filled.
                    </Typhography>
                  </div>
                </div>
              )}

              {/* Show different messages based on user state */}
              {!isUserRegistered && event.statusLabel === "Active" && !event.isFull && (
                <Typhography variant="t1" className="text-muted-foreground">
                  Welcome! To join the event, please register below.
                </Typhography>
              )}

              {isUserRegistered && !isUserCheckedIn && event.statusLabel === "Active" && (
                <Typhography variant="t1" className="text-muted-foreground">
                  You're registered! Check in to confirm your attendance.
                </Typhography>
              )}

              {isUserCheckedIn && (
                <div className="bg-primary/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <LucideCheckCircle className="text-primary" size={20} />
                  <div>
                    <Typhography variant="t1" className="font-semibold text-primary">
                      Checked In
                    </Typhography>
                    <Typhography variant="t2" className="text-muted-foreground">
                      See you at the event!
                    </Typhography>
                  </div>
                </div>
              )}

              {/* Button logic based on user state */}
              {!isUserRegistered ? (
                <Button
                  asChild
                  size="lg"
                  disabled={event.statusLabel !== "Active" || event.isFull}
                  variant={
                    event.statusLabel === "Active" && !event.isFull
                      ? "default"
                      : "secondary"
                  }
                  className="w-full font-semibold"
                >
                  <Link
                    to="/events/form/$eventId"
                    params={{ eventId: event.id.toString() }}
                  >
                    <Typhography variant="lg">
                      {event.isFull
                        ? "Event Full"
                        : event.statusLabel === "Active"
                          ? "Request to Join"
                          : event.statusLabel}
                    </Typhography>
                  </Link>
                </Button>
              ) : !isUserCheckedIn && event.statusLabel === "Active" ? (
                <Button
                  size="lg"
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="w-full font-semibold"
                >
                  {isCheckingIn ? (
                    <>
                      <Spinner />
                      <Typhography variant="lg">Checking In...</Typhography>
                    </>
                  ) : (
                    <>
                      <LucideCheckCircle size={20} />
                      <Typhography variant="lg">Check In</Typhography>
                    </>
                  )}
                </Button>
              ) : isUserCheckedIn ? (
                <Button
                  size="lg"
                  disabled
                  variant="secondary"
                  className="w-full font-semibold"
                >
                  <LucideCheckCircle size={20} />
                  <Typhography variant="lg">Checked In</Typhography>
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled
                  variant="secondary"
                  className="w-full font-semibold"
                >
                  <Typhography variant="lg">
                    {event.statusLabel === "Pending" ? "Not Started" : "Event Ended"}
                  </Typhography>
                </Button>
              )}
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-4 flex flex-col">
                <Typhography
                  variant="t2"
                  className="text-muted-foreground mb-1"
                >
                  Capacity
                </Typhography>
                <Typhography variant="2xl" className="font-bold">
                  {event.participantCount} / {event.quota}
                </Typhography>
              </div>
              <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-4 flex flex-col">
                <Typhography
                  variant="t2"
                  className="text-muted-foreground mb-1"
                >
                  Rare NFTs
                </Typhography>
                <Typhography variant="2xl" className="font-bold">
                  {event.totalRareNFT}
                </Typhography>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-3 flex flex-col">
              <Typhography variant="lg" className="font-semibold">
                About Event
              </Typhography>
              <Typhography
                variant="t1"
                className="text-muted-foreground leading-relaxed"
              >
                {event.description}
              </Typhography>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventsDetailsPage;
