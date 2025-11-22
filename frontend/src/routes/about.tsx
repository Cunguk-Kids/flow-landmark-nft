import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, type Variants } from 'framer-motion'; // Pastikan sudah install framer-motion
import { ArrowLeft, Box, Ticket, Users, Zap, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/about')({
  component: AboutUs,
});

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Efek muncul berurutan
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 50 },
  },
};

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rpn-dark text-rpn-text font-sans selection:bg-rpn-blue selection:text-white overflow-x-hidden">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#29ABE2 1px, transparent 1px), linear-gradient(90deg, #29ABE2 1px, transparent 1px)', backgroundSize: '50px 50px' }} 
      />
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rpn-blue/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
        <button 
            onClick={() => navigate({ to: '/' })}
            className="pointer-events-auto bg-rpn-card/80 backdrop-blur border border-rpn-blue/30 text-white p-3 rounded-xl hover:bg-rpn-blue hover:text-black transition-all shadow-lg group"
        >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 min-h-[80vh] flex flex-col justify-center items-center text-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rpn-blue/10 border border-rpn-blue/50 text-rpn-blue font-mono text-xs mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rpn-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rpn-blue"></span>
                </span>
                ESTABLISHED 2025
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-pixel text-4xl md:text-7xl leading-[1.1] uppercase text-white mb-6 drop-shadow-[0_0_30px_rgba(41,171,226,0.5)]">
                Building The <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rpn-blue via-white to-rpn-blue animate-gradient-x">
                    Digital Legacy
                </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-rpn-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                Capt Today is a <span className="text-white font-bold">Super App</span> born from the RPN community. We combine SocialFi events with GameFi collectibility to immortalize your moments on Flow Blockchain.
            </motion.p>

            <motion.div variants={itemVariants}>
                <Button 
                    onClick={() => navigate({ to: '/events' })}
                    className="btn-brutalist bg-rpn-blue text-black border-2 border-white px-8 py-6 text-lg font-black rounded-xl shadow-[6px_6px_0px_0px_#fff] hover:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                    START EXPLORING
                </Button>
            </motion.div>
        </motion.div>

        {/* Floating Elements Decoration */}
        <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-[10%] hidden lg:block opacity-50"
        >
            <Box size={64} className="text-rpn-blue" />
        </motion.div>
        <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-[10%] hidden lg:block opacity-30"
        >
            <Ticket size={80} className="text-purple-500" />
        </motion.div>
      </section>

      {/* --- STATS BANNER --- */}
      <section className="border-y border-rpn-blue/20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
                { label: "Active Users", value: "3.5K+" },
                { label: "Events Hosted", value: "120+" },
                { label: "Moments Minted", value: "50K" },
                { label: "Flow Volume", value: "10K+" },
            ].map((stat, idx) => (
                <div key={idx}>
                    <p className="text-3xl md:text-4xl font-black text-white font-pixel mb-1">{stat.value}</p>
                    <p className="text-xs font-mono text-rpn-blue uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* --- CORE PILLARS (Bento Grid) --- */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-black text-white font-pixel uppercase mb-4">The Ecosystem</h2>
                <p className="text-rpn-muted">Three pillars powering the Capt Today Super App.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Events */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-rpn-card border-2 border-rpn-blue/30 p-8 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rpn-blue/10 rounded-full blur-xl group-hover:bg-rpn-blue/20 transition-all"></div>
                    <Users size={40} className="text-rpn-blue mb-6" />
                    <h3 className="text-xl font-bold text-white font-pixel mb-3">SocialFi Events</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Attend online and offline gatherings. Earn <span className="text-white font-bold">EventPass (SBT)</span> as proof of attendance and fuel for your journey.
                    </p>
                </motion.div>

                {/* Card 2: Moments */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-rpn-card border-2 border-rpn-blue/30 p-8 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                    <Box size={40} className="text-purple-400 mb-6" />
                    <h3 className="text-xl font-bold text-white font-pixel mb-3">UGC Moments</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Mint your memories as NFTs. Customize them with frames and stickers using our unique <span className="text-white font-bold">Equip System</span>.
                    </p>
                </motion.div>

                {/* Card 3: GameFi */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-rpn-card border-2 border-rpn-blue/30 p-8 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all"></div>
                    <Zap size={40} className="text-yellow-400 mb-6" />
                    <h3 className="text-xl font-bold text-white font-pixel mb-3">GameFi Gacha</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Test your luck with our fair on-chain Gacha. Win rare accessories to increase your <span className="text-white font-bold">Profile Rarity</span>.
                    </p>
                </motion.div>
            </div>
        </div>
      </section>

      {/* --- MISSION SECTION --- */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-rpn-blue/5 skew-y-3 transform origin-top-left"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
                <h2 className="text-3xl font-black text-white font-pixel uppercase mb-6">
                    Born from <br/> Community
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Harkon isn't just a product; it's a movement started by <b>RPN (Random Para Nolep)</b>. We believe that web3 education should be fun, interactive, and rewarding.
                </p>
                <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-xs font-mono flex items-center gap-2">
                        <Globe size={12} /> Indonesia
                    </span>
                    <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-xs font-mono flex items-center gap-2">
                        <ShieldCheck size={12} /> Flow Blockchain
                    </span>
                </div>
            </div>
            
            <div className="flex-1 relative">
                {/* Visualisasi Kartu Tumpuk (Miring) */}
                <div className="w-64 h-40 bg-rpn-blue rounded-xl shadow-2xl absolute top-0 right-0 rotate-6 z-10 border-2 border-black"></div>
                <div className="w-64 h-40 bg-white rounded-xl shadow-2xl absolute top-4 right-4 rotate-3 z-20 border-2 border-black flex items-center justify-center">
                    <h3 className="text-black font-pixel text-xl">RPN</h3>
                </div>
                <div className="w-64 h-40 bg-rpn-dark rounded-xl shadow-2xl relative z-30 border-2 border-rpn-blue flex items-center justify-center p-6">
                    <p className="font-mono text-xs text-rpn-blue text-center">
                        "Coding is temporary, <br/> Blocks are forever."
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-10 border-t border-rpn-blue/20 text-center text-rpn-muted font-mono text-xs">
        <p>&copy; 2025 Capt Today. Built on Flow.</p>
      </footer>

    </div>
  );
}