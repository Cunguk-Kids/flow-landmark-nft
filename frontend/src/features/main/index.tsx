import Header from "@/components/Header";
import SandboxMap from "../sandbox/SandboxMap";
import { motion } from "motion/react";
const MainPage = () => {
  return (
    <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} className="">
      <div className="min-h-screen isolate relative grid grid-cols-1 text-foreground bg-background">
        <SandboxMap />
        <Header />
      </div>
    </motion.div>
  );
};

export default MainPage;
