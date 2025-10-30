import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Typhography } from "@/components/ui/typhography";
import { Badge } from "@/components/ui/badge";
import {
  LucideCalendar,
  LucideMapPin,
  LucideTicket,
  LucideSparkles,
  LucideChevronRight,
  LucideCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import CircularGallery from "@/components/CircularGallery";
import Galaxy from "@/components/Galaxy";

const features = [
  {
    icon: LucideCalendar,
    title: "Discover Events",
    description: "Explore cultural events and moments happening around you",
  },
  {
    icon: LucideTicket,
    title: "Mint NFT Tickets",
    description:
      "Register for events and receive unique NFT tickets on Flow blockchain",
  },
  {
    icon: LucideSparkles,
    title: "Cultural Elements",
    description:
      "Customize with Indonesian cultural elements like Batik, Gamelan, and more",
  },
  {
    icon: LucideMapPin,
    title: "Location-Based",
    description: "Check in at event locations to collect rare NFTs",
  },
];

const benefits = [
  "Secure blockchain-based ticketing",
  "Collect and trade unique cultural NFTs",
  "Support local cultural events",
  "Build your digital collection",
  "Connect with community",
];

const items = [
  { image: "/card-1.png", text: "Balinese Woman" },
  { image: "/card-2.png", text: "Candi Borobudur" },
  { image: "/card-3.png", text: "Javanese Woman" },
  { image: "/card-4.png", text: "Wayang" },
  { image: "/card-5.png", text: "Gamelan" },
];
const LandingPage = () => {
  return (
    <div className="relative">
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="min-h-screen relative isolate overflow-x-hidden"
      >
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Logo className="text-3xl" />
            <Button asChild size="sm">
              <Link to="/">
                <Typhography variant="t1">Launch App</Typhography>
                <LucideChevronRight size={16} />
              </Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32 relative isolate">
          <div className="absolute inset-0 -z-1">
            <Galaxy />
          </div>
          <div className="max-w-4xl mx-auto text-center space-y-8 rounded-2xl py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col gap-4 items-center">
                <Logo variant="hero" />
                <Badge variant="secondary">
                  <Typhography variant="t2">
                    Powered by Flow Blockchain
                  </Typhography>
                </Badge>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typhography
                variant="3xl"
                className="font-bold mb-6 bg-gradient-to-r from-primary via-purple-400 to-white bg-clip-text text-transparent"
              >
                Capture Your Cultural NFT Moments Today!
              </Typhography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typhography
                variant="2xl"
                className="text-primary max-w-2xl mx-auto mb-8"
              >
                Join cultural events, collect unique NFT tickets, and preserve
                moments with Indonesian cultural elements on Flow blockchain.
              </Typhography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-lg">
                <Link to="/">
                  <LucideSparkles size={20} />
                  <Typhography variant="lg">Explore Events</Typhography>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <a
                  href="https://github.com/onflow/flow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typhography variant="lg">Learn More</Typhography>
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        <div className="w-full flex justify-center overflow-hidden -mt-30">
          <div className="h-[600px] min-w-[800px] w-full shrink-0">
            <CircularGallery
              bend={2}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollEase={0.02}
              items={items}
            />
          </div>
        </div>
        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Typhography variant="3xl" className="font-bold mb-4">
                How It Works
              </Typhography>
              <Typhography variant="lg" className="text-muted-foreground">
                Simple steps to start collecting cultural NFT moments
              </Typhography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 h-full hover:bg-background/20 transition-all hover:scale-105">
                    <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm w-fit mb-4">
                      <feature.icon className="text-primary" size={24} />
                    </div>
                    <Typhography variant="lg" className="font-semibold mb-2">
                      {feature.title}
                    </Typhography>
                    <Typhography variant="t1" className="text-muted-foreground">
                      {feature.description}
                    </Typhography>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Typhography variant="3xl" className="font-bold mb-4">
                    Why Choose Capt.today?
                  </Typhography>
                  <Typhography
                    variant="lg"
                    className="text-muted-foreground mb-6"
                  >
                    Experience the future of event ticketing and cultural
                    preservation
                  </Typhography>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="p-1 rounded-full bg-primary/20">
                          <LucideCheck className="text-primary" size={16} />
                        </div>
                        <Typhography variant="t1">{benefit}</Typhography>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="relative p-1 rounded-2xl bg-gradient-to-br from-primary/50 via-purple-500/50 to-pink-500/50">
                    <div className="bg-background/10 backdrop-blur-lg rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                      <div className="text-center space-y-4">
                        <LucideSparkles
                          className="text-primary mx-auto"
                          size={64}
                        />
                        <Typhography variant="2xl" className="font-bold">
                          Join the Movement
                        </Typhography>
                        <Typhography
                          variant="t1"
                          className="text-muted-foreground"
                        >
                          Be part of the cultural NFT revolution
                        </Typhography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-2xl p-12">
              <Typhography variant="3xl" className="font-bold mb-4">
                Ready to Get Started?
              </Typhography>
              <Typhography variant="lg" className="text-muted-foreground mb-8">
                Connect your Flow wallet and start exploring cultural events
                today
              </Typhography>
              <Button asChild size="lg" className="text-lg">
                <Link to="/">
                  <Typhography variant="lg">Launch App</Typhography>
                  <LucideChevronRight size={20} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background/50 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <Logo />
              <Typhography variant="t2" className="text-muted-foreground">
                © 2024 Capt.today. Powered by Flow Blockchain.
              </Typhography>
              <div className="flex gap-4">
                <a
                  href="https://github.com/onflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Typhography variant="t2">GitHub</Typhography>
                </a>
                <a
                  href="https://flow.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Typhography variant="t2">Flow</Typhography>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default LandingPage;
