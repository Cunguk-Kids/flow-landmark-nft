import React, { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CompactProfileCard from "@/components/CompactProfileCard";

interface ProfilePopupProps {
  address: string;
  children: React.ReactNode;
  user?: any; // Optional: pass user data directly
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export default function ProfilePopup({
  address,
  children,
  user,
  className,
  side = "top",
  align = "center",
}: ProfilePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isOpen) {
      openTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 300); // Delay 300ms sebelum open (biar gak flickering saat lewat doang)
    }
  };

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // Delay 300ms sebelum close (biar user sempat gerakin mouse ke popover)
  };

  const handlePopoverMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  const handlePopoverMouseLeave = () => {
    handleMouseLeave();
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsOpen(!isOpen)} // Handle Click (Mobile & Desktop Click)
          className={className}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 border-none bg-transparent shadow-none z-50"
        side={side}
        align={align}
        sideOffset={10}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        <CompactProfileCard address={address} user={user} />
      </PopoverContent>
    </Popover>
  );
}
