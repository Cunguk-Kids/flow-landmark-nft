import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { usePartnerDetail, useEventList, formatEvent } from '@/hooks';
import { Typhography } from './ui/typhography';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  LucideBuilding2,
  LucideMail,
  LucideCalendar,
  LucideMapPin,
  LucideUsers,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface PartnerInfoSheetProps {
  partnerAddress: string;
  partnerName: string;
  children: React.ReactNode;
}

export function PartnerInfoSheet({ partnerAddress, partnerName, children }: PartnerInfoSheetProps) {
  const [open, setOpen] = useState(false);

  // Fetch partner details
  const { data: partner, isLoading: isLoadingPartner } = usePartnerDetail(partnerAddress);

  // Fetch events by this partner
  const { data: eventsData, isLoading: isLoadingEvents } = useEventList({
    brandAddress: partnerAddress,
    limit: 20,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="dark flex flex-col overflow-y-auto w-full sm:max-w-xl">
        <SheetHeader>
          {/* Partner Header */}
          <div className="relative isolate rounded-lg overflow-hidden p-0 bg-gradient-to-br from-primary/20 to-purple-500/20">
            <div className="p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-border">
                  {partner?.image ? (
                    <img
                      src={partner.image}
                      alt={partner.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <LucideBuilding2 className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <SheetTitle>
                    <Typhography variant="2xl" className="font-bold">
                      {isLoadingPartner ? 'Loading...' : partner?.name || partnerName}
                    </Typhography>
                  </SheetTitle>
                  <SheetDescription>
                    <Typhography
                      variant="t1"
                      className="text-muted-foreground flex items-center gap-2 mt-1">
                      <LucideMail size={14} />
                      {partner?.email || 'No email provided'}
                    </Typhography>
                  </SheetDescription>
                </div>
              </div>

              {/* Description */}
              {partner?.description && (
                <div className="mt-4">
                  <Typhography variant="t1" className="text-foreground/90">
                    {partner.description}
                  </Typhography>
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Partner Events Section */}
        <div className="flex-1 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Typhography variant="lg" className="font-semibold">
              Events by {partner?.name || partnerName}
            </Typhography>
            {eventsData?.data.length ? (
              <Badge variant="secondary">
                <Typhography variant="t3">{eventsData.data.length}</Typhography>
              </Badge>
            ) : null}
          </div>

          {isLoadingEvents ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : eventsData?.data.length ? (
            <div className="space-y-3">
              {eventsData.data.map((rawEvent) => {
                const event = formatEvent(rawEvent);

                return (
                  <Link
                    key={event.id}
                    to="/events/details/$eventId"
                    params={{ eventId: event.eventId.toString() }}
                    onClick={() => setOpen(false)}>
                    <div className="bg-background/10 backdrop-blur-lg border border-border rounded-lg p-3 space-y-3 cursor-pointer hover:bg-background/20 transition-colors">
                      <div className="flex gap-3">
                        <img
                          src={event.image}
                          alt={event.eventName}
                          className="w-20 h-20 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Typhography variant="t1" className="font-semibold line-clamp-2">
                              {event.eventName}
                            </Typhography>
                            <Badge
                              variant={event.statusLabel === 'Active' ? 'default' : 'secondary'}>
                              <Typhography variant="t3">{event.statusLabel}</Typhography>
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <LucideCalendar size={12} />
                            <Typhography variant="t3" className="line-clamp-1">
                              {formatDateTime(event.startDateTime.toISOString(), 'date')}
                            </Typhography>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <LucideMapPin size={12} />
                            <Typhography variant="t3" className="line-clamp-1">
                              {event.partner?.name || 'TBA'}
                            </Typhography>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <LucideUsers size={12} />
                            <Typhography variant="t3">
                              {event.participantCount}/{event.quota}{' '}
                              {event.isFull ? '(Full)' : 'spots'}
                            </Typhography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-background/5 backdrop-blur-sm border border-border/50 rounded-lg">
              <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm mb-4">
                <LucideCalendar size={32} className="text-primary" />
              </div>
              <Typhography variant="lg" className="font-semibold mb-2">
                No events yet
              </Typhography>
              <Typhography variant="t2" className="text-muted-foreground max-w-[250px]">
                This partner hasn't created any events yet
              </Typhography>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
