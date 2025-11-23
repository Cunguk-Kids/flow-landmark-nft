import { createRootRoute, Outlet } from "@tanstack/react-router";
import {
  TransitionProvider,
  useTransition,
} from "@/contexts/TransitionContext";
import { motion, AnimatePresence } from "framer-motion";

function TransitionOverlay() {
  const { isTransitioning, cardBounds } = useTransition();

  if (!cardBounds) return null;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          // --- STYLING MODERN & BERSIH ---
          className="fixed z-[9999] pointer-events-none overflow-hidden"
          style={{
             // Warna RPN Dark Solid
             backgroundColor: "#0F172A", 
             
             // (Opsional) Grid sangat tipis (5% opacity) agar tidak terlalu flat/membosankan
             // Hapus bagian backgroundImage & backgroundSize jika ingin benar-benar polos
             backgroundImage: `
                linear-gradient(to right, rgba(41, 171, 226, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(41, 171, 226, 0.03) 1px, transparent 1px)
             `,
             backgroundSize: "60px 60px"
          }}
          
          // --- ANIMASI EKSPANSI ---
          initial={{
            left: cardBounds.x,
            top: cardBounds.y,
            width: cardBounds.width,
            height: cardBounds.height,
            borderRadius: cardBounds.borderRadius, // Mulai dengan sudut melengkung sesuai kartu
            opacity: 1,
          }}
          animate={{
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            borderRadius: 0, // Berubah menjadi kotak sempurna saat memenuhi layar
            
            transition: {
              duration: 0.6,
              // Bezier Curve: "Ease Out Quint" 
              // (Cepat di awal, sangat lambat/halus di akhir - Standar UI Modern)
              ease: [0.22, 1, 0.36, 1], 
            }
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.2 } // Fade out cepat agar halaman baru langsung terlihat
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
  </TransitionProvider>
);

export const Route = createRootRoute({ component: RootLayout });