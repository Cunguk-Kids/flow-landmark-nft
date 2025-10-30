import { Link, useLoaderData } from "@tanstack/react-router";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typhography } from "@/components/ui/typhography";
import IconTech from "@/assets/icon/icon-tech.png";
import IconArt from "@/assets/icon/icon-art.png";
import IconSport from "@/assets/icon/icon-sport.png";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Calendar, Clock } from "lucide-react";
import BackButton from "@/components/BackButton";
import { motion } from "motion/react";
import { formatEvent } from "@/hooks";

const EventsDetailsPage = () => {
  const { event: rawEvent } = useLoaderData({ from: "/events/details/$eventId" });
  const event = rawEvent ? formatEvent(rawEvent) : null;

  const renderCategory = (category: string) => {
    let icon;

    if (category.toLowerCase().includes("tech")) {
      icon = IconTech;
    } else if (category.toLowerCase().includes("art")) {
      icon = IconArt;
    } else if (category.toLowerCase().includes("sport")) {
      icon = IconSport;
    }

    return (
      <Badge variant={"secondary"} className="flex items-center">
        <div className="rounded-full -m-2 w-6 h-6 md:w-8 md:h-8 drop-shadow-lg shadow-muted-foreground/60 overflow-clip backdrop-blur-3xl">
          <img src={icon} alt="icon" className="w-8" />
        </div>
        <Typhography variant="2xl" className="pr-2 pl-4">
          {category}
        </Typhography>
      </Badge>
    );
  };

  if (!event)
    return (
      <div className="flex h-screen items-center justify-center">
        <Typhography variant="2xl" className="text-muted-foreground">
          Event not found.
        </Typhography>
      </div>
    );

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="relative h-64 md:h-96 lg:h-128 w-full">
        <div className="w-full absolute left-0 z-50 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <BackButton />
        </div>
        <img
          src={event.image}
          alt={event.eventName}
          className="object-cover brightness-75 w-full h-full"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <Typhography variant="3xl" className="font-bold">
            {event.eventName}
          </Typhography>
          <Typhography variant="lg">
            {event.partner?.name || event.brandAddress || "Unknown Partner"}
          </Typhography>
        </div>
      </div>

      <ItemGroup className="w-full flex flex-col justify-center items-center">
        <Item className="w-full flex flex-wrap items-center gap-3">
          <Badge>
            <Typhography variant="lg">{event.statusLabel}</Typhography>
          </Badge>
          {/* Category not available in backend yet */}
        </Item>

        <Item className="w-full md:w-1/2 md:self-start">
          <ItemContent>
            <ItemTitle>
              <Typhography variant="2xl" className="font-semibold">
                Date
              </Typhography>
            </ItemTitle>
            <ItemDescription className="flex items-center gap-1 text-muted-foreground">
              <Calendar />
              <Typhography variant="2xl">
                {formatDateTime(event.startDateTime.toISOString(), "date")}
              </Typhography>
            </ItemDescription>
          </ItemContent>
          <ItemContent className="w-40">
            <ItemTitle>
              <Typhography variant="2xl" className="font-semibold">
                Time
              </Typhography>
            </ItemTitle>
            <ItemDescription className="flex items-center gap-1 text-muted-foreground">
              <Clock />
              <Typhography variant="2xl">
                {formatDateTime(event.startDateTime.toISOString(), "time")}
              </Typhography>
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <ItemContent>
            <ItemHeader>
              <Typhography variant="2xl" className="font-semibold">
                Location
              </Typhography>
            </ItemHeader>
            <ItemDescription className="text-muted-foreground">
              <Typhography variant="2xl">
                Radius: {event.radius}m
              </Typhography>
            </ItemDescription>
            <ItemFooter className="text-muted-foreground/70">
              <Typhography variant="lg">
                Coordinate: {event.lat}, {event.long}
              </Typhography>
            </ItemFooter>
          </ItemContent>
        </Item>

        <Item className="w-full md:w-1/2 md:self-start flex gap-4">
          <ItemContent>
            <ItemTitle>
              <Typhography variant="2xl" className="font-semibold">
                Participants
              </Typhography>
            </ItemTitle>
            <ItemDescription className="text-muted-foreground">
              <Typhography variant="2xl">
                {event.participantCount} / {event.quota}
                {event.isFull && " (Full)"}
              </Typhography>
            </ItemDescription>
          </ItemContent>
          <ItemContent className="w-40">
            <ItemTitle>
              <Typhography variant="2xl" className="font-semibold">
                Rare NFTs
              </Typhography>
            </ItemTitle>
            <ItemDescription className="text-muted-foreground">
              <Typhography variant="2xl">
                {event.totalRareNFT} available
              </Typhography>
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <ItemContent>
            <ItemTitle>
              <Typhography variant="2xl" className="font-semibold">
                Description
              </Typhography>
            </ItemTitle>
            <ItemFooter className="text-muted-foreground">
              <Typhography variant="2xl">{event.description}</Typhography>
            </ItemFooter>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <Button
            asChild
            size={"lg"}
            disabled={event.statusLabel !== "Open" || event.isFull}
            variant={event.statusLabel === "Open" && !event.isFull ? "default" : "secondary"}
            className="w-full font-semibold"
          >
            <Link to="/events/form/$eventId" params={{ eventId: event.id.toString() }}>
              <Typhography variant="2xl">
                {event.isFull ? "Event Full" : event.statusLabel === "Open" ? "Register Now" : event.statusLabel}
              </Typhography>
            </Link>
          </Button>
        </Item>
      </ItemGroup>
    </motion.div>
  );
};

export default EventsDetailsPage;
