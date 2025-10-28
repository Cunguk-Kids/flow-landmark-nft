import { Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const EventsDetailsPage = () => {
  const { event } = useLoaderData({ from: "/events/details/$eventId" });

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
        <div className="rounded-full -m-2 w-6 h-6 md:w-8 md:h-8 drop-shadow-lg shadow-gray-600 overflow-clip backdrop-blur-3xl">
          <img src={icon} alt="icon" className="w-8" />
        </div>
        <h3 className="text-sm md:text-lg lg:text-xl pr-2 pl-4">{category}</h3>
      </Badge>
    );
  };

  if (!event)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg">Event not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-96 lg:h-128 w-full">
        <div className="w-full absolute left-0 z-50 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
          <BackButton />
        </div>
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="object-cover brightness-75 w-full h-full"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm">{event.hostBy}</p>
        </div>
      </div>

      <ItemGroup className="w-full flex flex-col justify-center items-center">
        <Item className="w-full flex flex-wrap items-center gap-3">
          <Badge className="text-sm md:text-base">{event.status}</Badge>
          {renderCategory(event.category)}
        </Item>

        <Item className="w-full md:w-1/2 md:self-start">
          <ItemContent>
            <ItemTitle className="text-lg md:text-xl font-semibold">
              Date
            </ItemTitle>
            <ItemDescription className="flex md:text-lg items-center gap-1 text-gray-700">
              <Calendar /> {formatDateTime(event.date, "date")}
            </ItemDescription>
          </ItemContent>
          <ItemContent className="w-40">
            <ItemTitle className="text-lg md:text-xl font-semibold">
              Time
            </ItemTitle>
            <ItemDescription className="flex md:text-lg items-center gap-1 text-gray-700">
              <Clock /> {formatDateTime(event.date, "time")}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <ItemContent>
            <ItemHeader className="text-lg md:text-xl font-semibold">
              Venue Location
            </ItemHeader>
            <ItemDescription className="md:text-lg text-gray-700">
              {event.venue}
            </ItemDescription>
            <ItemFooter className="text-sm md:text-base text-gray-500">
              Coordinate: {event.latitude}, {event.longitude}
            </ItemFooter>
          </ItemContent>
        </Item>

        <Item className="w-full md:w-1/2 md:self-start flex gap-4">
          <ItemContent>
            <ItemTitle className="text-lg md:text-xl font-semibold">
              Capacity
            </ItemTitle>
            <ItemDescription className="text-gray-700 md:text-lg">
              {event.capacity.toLocaleString()} capacity
            </ItemDescription>
          </ItemContent>
          <ItemContent className="w-40">
            <ItemTitle className="text-lg md:text-xl font-semibold">
              Ticket Price
            </ItemTitle>
            <ItemDescription className="text-gray-700 md:text-lg">
              {event.ticketPrice > 0
                ? `Rp ${event.ticketPrice.toLocaleString()}`
                : "Free"}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <ItemContent>
            <ItemTitle className="text-lg md:text-xl font-semibold">
              Description
            </ItemTitle>
            <ItemFooter className="text-gray-700 md:text-lg">
              {event.description}
            </ItemFooter>
          </ItemContent>
        </Item>

        <Item className="w-full">
          <Button
            asChild
            size={"lg"}
            disabled={event.status !== "Open"}
            className={`w-full font-semibold transition ${
              event.status === "Open"
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Link to="/events/form/$eventId" params={{ eventId: event.id }}>
              {event.status === "Open" ? "Register Now" : "Sold Out"}
            </Link>
          </Button>
        </Item>
      </ItemGroup>
    </div>
  );
};

export default EventsDetailsPage;
