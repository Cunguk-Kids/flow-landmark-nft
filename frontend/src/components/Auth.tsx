import { useState } from 'react';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { useNavigate } from '@tanstack/react-router';
import { Typhography } from './ui/typhography';
import { useAccount } from '@/hooks/useAccount';
import { useUserEvents, useCheckIn, formatEvent } from '@/hooks';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import {
  LucideCircleUserRound,
  LucideLogIn,
  LucideLogOut,
  LucideMenu,
  LucideCalendar,
  LucideMapPin,
  LucideCheckCircle,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { authenticate, unauthenticate } = useFlowCurrentUser();
  const { data } = useAccount();
  const [open, setOpen] = useState(false);

  // Fetch user's registered events
  const { data: eventsData, isLoading: isLoadingEvents } = useUserEvents({
    userAddress: data?.address || '',
    status: 'Registered',
    limit: 10,
  });

  console.log(eventsData, '============eventsData===========');

  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();

  const handleCheckIn = (eventId: number, brandAddress: string) => {
    if (!data?.address) {
      toast.error('Please connect your wallet first!');
      return;
    }

    checkIn(
      {
        eventId: String(eventId),
        userAddress: data.address,
        brandAddress: brandAddress,
      },
      {
        onSuccess: () => {
          toast.success('Checked in successfully!');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Check-in failed');
        },
      },
    );
  };

  const handleEventClick = (eventId: number) => {
    setOpen(false);
    navigate({ to: '/events/details/$eventId', params: { eventId: String(eventId) } });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          {data ? (
            <img src={data?.avatar} className="block size-10" />
          ) : (
            <LucideMenu className="size-5 text-foreground" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="dark flex flex-col overflow-y-auto">
        <SheetHeader>
          <div className="relative isolate rounded-md overflow-hidden p-0">
            <img src="/profile-bg.png" className="block h-auto w-full" />
            <div className="flex gap-2 items-center -mt-10 backdrop-blur-lg absolute bottom-0 left-0 right-0 p-2 shadow-2xl">
              <div className="backdrop-blur-md border rounded-full overflow-hidden size-12 sm:size-15 flex items-center justify-center">
                {data ? (
                  <img src={data?.avatar} className="block size-full" />
                ) : (
                  <LucideCircleUserRound className="size-full text-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <SheetTitle>
                  <Typhography variant="t1">{data?.address ?? '0x0'}</Typhography>
                </SheetTitle>
                <SheetDescription>
                  <Typhography variant="t3">
                    {eventsData?.data.length || 0} Events Registered
                  </Typhography>
                </SheetDescription>
              </div>
            </div>
          </div>
          {data ? (
            <Button onClick={unauthenticate} variant="destructive">
              <LucideLogOut />
              <Typhography>Disconnect Wallet</Typhography>
            </Button>
          ) : (
            <Button
              onClick={() => {
                authenticate().then((x) => console.log(x));
                requestAnimationFrame(() => {
                  const frame = document.querySelector('#FCL_IFRAME') as HTMLIFrameElement | null;
                  if (frame) frame.style.pointerEvents = 'auto';
                });
              }}
              variant="default">
              <LucideLogIn />
              <Typhography>Connect Wallet</Typhography>
            </Button>
          )}
        </SheetHeader>

        {/* My Events Section */}
        {data && (
          <div className="flex-1 mt-6 space-y-4 mx-4">
            <div className="flex items-center justify-between">
              <Typhography variant="lg" className="font-semibold">
                My Events
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
                  const isCheckedIn = event.participants.some(
                    (p) => p.userAddress === data.address && p.isCheckedIn,
                  );

                  return (
                    <div
                      key={event.id}
                      className="bg-background/10 backdrop-blur-lg border border-border rounded-lg p-3 space-y-3 cursor-pointer hover:bg-background/20 transition-colors"
                      onClick={() => handleEventClick(event.id)}>
                      <div className="flex gap-3">
                        <img
                          src={event.image}
                          alt={event.eventName}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <Typhography variant="t1" className="font-semibold line-clamp-1">
                            {event.eventName}
                          </Typhography>
                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <LucideCalendar size={12} />
                            <Typhography variant="t3" className="line-clamp-1">
                              {event.startDateTime.toLocaleDateString()}
                            </Typhography>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <LucideMapPin size={12} />
                            <Typhography variant="t3" className="line-clamp-1">
                              {event.partner?.name || 'TBA'}
                            </Typhography>
                          </div>
                        </div>
                      </div>

                      {/* Check-in Button */}
                      {!isCheckedIn && event.statusLabel === 'Active' && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckIn(event.eventId, event.brandAddress);
                          }}
                          disabled={isCheckingIn}>
                          {isCheckingIn ? (
                            <>
                              <Spinner />
                              <Typhography variant="t2">Checking In...</Typhography>
                            </>
                          ) : (
                            <>
                              <LucideCheckCircle size={16} />
                              <Typhography variant="t2">Check In</Typhography>
                            </>
                          )}
                        </Button>
                      )}

                      {isCheckedIn && (
                        <div className="flex items-center justify-center gap-2 py-2 bg-primary/10 rounded-md">
                          <LucideCheckCircle size={16} className="text-primary" />
                          <Typhography variant="t2" className="text-primary font-semibold">
                            Checked In
                          </Typhography>
                        </div>
                      )}

                      {event.statusLabel !== 'Active' && !isCheckedIn && (
                        <Badge variant="secondary" className="w-full justify-center">
                          <Typhography variant="t2">{event.statusLabel}</Typhography>
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-background/5 backdrop-blur-sm border border-border/50 rounded-lg">
                <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm mb-4">
                  <LucideCalendar size={32} className="text-primary" />
                </div>
                <Typhography variant="lg" className="font-semibold mb-2">
                  No events registered yet
                </Typhography>
                <Typhography variant="t2" className="text-muted-foreground mb-6 max-w-[250px]">
                  Browse events and register to see them here
                </Typhography>
                <Button
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: '/' });
                  }}>
                  <Typhography variant="t2">Browse Events</Typhography>
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
