import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  dateInput: string | Date,
  mode: "datetime" | "date" | "time" = "datetime"
): string {
  const date = new Date(dateInput);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  switch (mode) {
    case "date":
      return `${day} ${month} ${year}`;
    case "time":
      return `${hours}.${minutes}`;
    default:
      return `${day} ${month} ${year} | ${hours}.${minutes}`;
  }
}
