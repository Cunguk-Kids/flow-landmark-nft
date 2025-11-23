import { createContext, useContext, useState, ReactNode } from "react";

interface CardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface TransitionContextType {
  isTransitioning: boolean;
  cardBounds: CardBounds | null;
  triggerTransition: (bounds: CardBounds) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardBounds, setCardBounds] = useState<CardBounds | null>(null);

  const triggerTransition = (bounds: CardBounds) => {
    setCardBounds(bounds);
    setIsTransitioning(true);
    // Reset after animation
    setTimeout(() => {
      setIsTransitioning(false);
      setCardBounds(null);
    }, 1000);
  };

  return (
    <TransitionContext.Provider value={{ isTransitioning, cardBounds, triggerTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within TransitionProvider");
  }
  return context;
}
