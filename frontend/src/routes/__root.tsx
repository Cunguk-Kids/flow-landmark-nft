import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  TransitionProvider,
  useTransition,
} from "@/contexts/TransitionContext";
import { motion, AnimatePresence } from "motion/react";

function TransitionOverlay() {
  const { isTransitioning, cardBounds } = useTransition();

  if (!cardBounds) return null;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed bg-red-400 z-[9999] pointer-events-none origin-top-left"
          initial={{
            left: cardBounds.x,
            top: cardBounds.y,
            width: 0,
            height: 0,
            borderRadius: cardBounds.borderRadius,
          }}
          animate={{
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            borderRadius: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        />
      )}
    </AnimatePresence>
  );
}

const RootLayout = () => (
  <TransitionProvider>
    <Outlet />
    <TransitionOverlay />
    <TanStackRouterDevtools />
  </TransitionProvider>
);

export const Route = createRootRoute({ component: RootLayout });
