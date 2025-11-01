import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { UserTicket } from "@/types";
import ticketsListDummy from "@/assets/json/tickets-list.json";
import { Typhography } from "@/components/ui/typhography";
import { formatDateTime } from "@/lib/utils";

const TicketsList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<UserTicket[]>([]);

  useEffect(() => {
    setTickets(ticketsListDummy);
  }, []);

  return (
    <div className="p-4">
      <Typhography className="text-lg font-semibold mb-3">
        My Tickets
      </Typhography>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() =>
              navigate({ to: `/events/details/${ticket.eventId}` })
            }
            className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer transition"
          >
            <Typhography className="font-semibold">
              {ticket.eventTitle}
            </Typhography>
            <Typhography className="text-sm text-gray-600">
              {formatDateTime(ticket.date)} • {ticket.venue}
            </Typhography>
            <Typhography className="text-xs mt-1 text-gray-500">
              Category: {ticket.eventCategory}
              <Typhography
                className={`font-medium ${
                  ticket.status === "Active"
                    ? "text-green-600"
                    : ticket.status === "Checked In"
                      ? "text-blue-600"
                      : "text-red-500"
                }`}
              >
                {ticket.status}
              </Typhography>
            </Typhography>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsList;
