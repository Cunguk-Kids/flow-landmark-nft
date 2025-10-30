import { Link, useLoaderData } from "@tanstack/react-router";
import { usePartnerDetail, useEventList, formatEvent } from "@/hooks";
import { Typhography } from "@/components/ui/typhography";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "motion/react";
import {
  LucideBuilding2,
  LucideMail,
  LucideCalendar,
  LucideMapPin,
  LucideUsers,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Galaxy from "@/components/Galaxy";
import { PageHeader } from "@/components/PageHeader";

const PartnerDetailsPage = () => {
  const { address } = useLoaderData({
    from: "/partners/details/$address",
  });

  // Fetch partner details
  const { data: partner, isLoading: isLoadingPartner, error: partnerError } = usePartnerDetail(address);

  // Fetch events by this partner
  const { data: eventsData, isLoading: isLoadingEvents } = useEventList({
    brandAddress: address,
    limit: 50,
  });

  if (partnerError) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="min-h-screen bg-background relative isolate flex items-center justify-center"
      >
        <div className="absolute inset-0 -z-1">
          <Galaxy />
        </div>
        <div className="text-center">
          <Typhography variant="2xl" className="text-destructive">
            Partner not found
          </Typhography>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      className="min-h-screen bg-background relative isolate"
    >
      <div className="absolute inset-0 -z-1">
        <Galaxy />
      </div>

      {/* Header */}
      <PageHeader showLogo />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoadingPartner ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Partner Header Card */}
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-primary/50 via-purple-500/50 to-pink-500/50">
              <div className="bg-background/10 backdrop-blur-lg rounded-xl p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Partner Logo */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border-2 border-border flex-shrink-0">
                    {partner?.image ? (
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <LucideBuilding2 className="w-12 h-12 text-primary" />
                    )}
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 text-center sm:text-left flex flex-col">
                    <Typhography variant="3xl" className="font-bold mb-2">
                      {partner?.name || "Loading..."}
                    </Typhography>

                    {partner?.email && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-4">
                        <LucideMail size={16} />
                        <Typhography variant="t1">{partner.email}</Typhography>
                      </div>
                    )}

                    {partner?.description && (
                      <Typhography variant="lg" className="text-foreground/90 max-w-2xl">
                        {partner.description}
                      </Typhography>
                    )}

                    {/* Partner Address */}
                    <div className="mt-4 inline-block bg-background/30 backdrop-blur-sm rounded-lg px-4 py-2">
                      <Typhography variant="t2" className="text-muted-foreground">
                        Address: <span className="text-primary font-mono">{address}</span>
                      </Typhography>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typhography variant="2xl" className="font-bold">
                  Events by {partner?.name || "this Partner"}
                </Typhography>
                {eventsData?.data.length ? (
                  <Badge variant="secondary">
                    <Typhography variant="t1">{eventsData.data.length} Events</Typhography>
                  </Badge>
                ) : null}
              </div>

              {isLoadingEvents ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : eventsData?.data.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventsData.data.map((rawEvent) => {
                    const event = formatEvent(rawEvent);

                    return (
                      <Link
                        key={event.id}
                        to="/events/details/$eventId"
                        params={{ eventId: event.id.toString() }}
                      >
                        <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl overflow-hidden hover:bg-background/20 transition-all hover:scale-[1.02] cursor-pointer h-full">
                          {/* Event Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.eventName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge
                                variant={
                                  event.statusLabel === "Active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                <Typhography variant="t3">
                                  {event.statusLabel}
                                </Typhography>
                              </Badge>
                            </div>

                            {/* Event Name Overlay */}
                            <div className="absolute bottom-3 left-3 right-3">
                              <Typhography
                                variant="lg"
                                className="font-bold text-white line-clamp-2"
                              >
                                {event.eventName}
                              </Typhography>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <LucideCalendar size={14} />
                              <Typhography variant="t2">
                                {formatDateTime(
                                  event.startDateTime.toISOString(),
                                  "date"
                                )}
                              </Typhography>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <LucideMapPin size={14} />
                              <Typhography variant="t2" className="line-clamp-1">
                                {event.partner?.name || "TBA"}
                              </Typhography>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <LucideUsers size={14} />
                              <Typhography variant="t2">
                                {event.participantCount}/{event.quota}{" "}
                                {event.isFull ? "(Full)" : "spots"}
                              </Typhography>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-background/5 backdrop-blur-sm border border-border/50 rounded-xl">
                  <div className="p-6 rounded-full bg-primary/10 backdrop-blur-sm mb-4">
                    <LucideCalendar size={48} className="text-primary" />
                  </div>
                  <Typhography variant="2xl" className="font-bold mb-2">
                    No events yet
                  </Typhography>
                  <Typhography
                    variant="lg"
                    className="text-muted-foreground max-w-md"
                  >
                    This partner hasn't created any events yet. Check back later!
                  </Typhography>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PartnerDetailsPage;
