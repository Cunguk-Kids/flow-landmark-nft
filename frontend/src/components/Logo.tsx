import { cn } from "@/lib/utils";
import { LucideStars } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "default" | "hero";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "font-bold flex flex-col text-transparent bg-linear-to-r from-primary to-white bg-clip-text",
        isHero ? "text-6xl md:text-8xl" : "text-2xl",
        className
      )}
    >
      <div className="flex gap-0 items-start">
        <span>Capt</span>
        <LucideStars
          className={cn(
            "text-transparent fill-white self-start",
            isHero ? "size-8 md:size-12" : "size-4"
          )}
        />
        <span
          className={cn(
            "self-center",
            isHero ? "text-2xl md:text-4xl mt-4 md:mt-8" : "text-xs mt-2"
          )}
        >
          today
        </span>
      </div>
    </div>
  );
}
