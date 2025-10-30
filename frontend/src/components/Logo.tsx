import { cn } from "@/lib/utils";
import { LucideStars } from "lucide-react";

export function Logo(props: { className?: string }) {
  return (
    <div
      className={cn(
        "font-bold text-2xl flex flex-col text-transparent bg-linear-to-r from-primary to-white bg-clip-text",
        props.className
      )}
    >
      <div className="flex gap-0">
        <span>Capt</span>
        <LucideStars className="text-transparent fill-white size-4 self-start" />
        <span className="text-xs mt-2">today</span>
      </div>
    </div>
  );
}
