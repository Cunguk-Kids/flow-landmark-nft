'use client';

import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SellItemModal from '@/components/modals/SellItemModal';
import { useFlowCurrentUser } from '@onflow/react-sdk';

interface SellItemTriggerProps {
  className?: string;
  children?: React.ReactNode;
  refetchListing: () => void; // Opsi untuk mengubah teks/ikon tombol
}

export default function SellItemTrigger({ className = "", children, refetchListing }: SellItemTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, authenticate } = useFlowCurrentUser();

  const handleClick = () => {
    // UX Security: Cek login dulu
    if (!user?.loggedIn) {
      authenticate(); // Trigger login FCL
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button 
        onClick={handleClick}
        className={`
            h-14 
            bg-rpn-blue text-rpn-dark 
            hover:bg-white hover:text-rpn-blue 
            font-black font-pixel px-6 rounded-xl 
            shadow-[4px_4px_0px_0px_#fff] 
            hover:translate-x-[1px] hover:translate-y-[1px] 
            hover:shadow-[2px_2px_0px_0px_#fff] 
            active:translate-y-[2px] active:shadow-none 
            transition-all flex items-center gap-2
            ${className}
        `}
      >
        {children ? children : (
            // Default Content
            <>
                <Plus size={18} strokeWidth={3} />
                <span>SELL ITEM</span>
            </>
        )}
      </Button>

      {/* MODAL (Terisolasi di sini) */}
      <SellItemModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={refetchListing}
      />
    </>
  );
}