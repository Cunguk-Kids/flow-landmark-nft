import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Typhography } from "@/components/ui/typhography";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Logo } from "@/components/Logo";
import Galaxy from "@/components/Galaxy";
import CircularGallery from "@/components/CircularGallery";

const items = [
  { image: "/card-1.png", text: "Balinese Woman" },
  { image: "/card-2.png", text: "Candi Borobudur" },
  { image: "/card-3.png", text: "Javanese Woman" },
  { image: "/card-4.png", text: "Wayang" },
  { image: "/card-5.png", text: "Gamelan" },
];

const slides = [
  // Slide 1: Title
  {
    title: "Capt.today",
    subtitle: "Capture Your Cultural NFT Moments Today",
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <Logo variant="hero" />
        <Typhography variant="3xl" className="text-center text-muted-foreground">
          NFT-Based Event Ticketing with Cultural Elements
        </Typhography>
        <div className="flex gap-4 mt-8">
          <div className="px-4 py-2 bg-primary/20 rounded-lg">
            <Typhography variant="lg">Powered by Flow Blockchain</Typhography>
          </div>
        </div>
        <div className="w-full flex justify-center overflow-hidden mt-12">
          <div className="h-[400px] min-w-[600px] w-full shrink-0">
            <CircularGallery
              bend={2}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollEase={0.02}
              items={items}
            />
          </div>
        </div>
      </div>
    ),
  },

  // Slide 2: The Problem
  {
    title: "🎯 The Problem",
    subtitle: "Cultural events are temporary, memories fade",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: "🎫", text: "Event tickets get lost or thrown away" },
            { icon: "❌", text: "No proof of attendance at cultural moments" },
            { icon: "🔌", text: "Limited connection between attendees and organizers" },
            { icon: "📉", text: "Cultural heritage experiences aren't preserved digitally" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-3"
            >
              <div className="text-5xl">{item.icon}</div>
              <Typhography variant="lg" className="text-muted-foreground">
                {item.text}
              </Typhography>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  // Slide 3: The Solution
  {
    title: "💡 The Solution",
    subtitle: "Capt.today: NFT-Based Event Ticketing with Cultural Elements",
    content: (
      <div className="space-y-6">
        <Typhography variant="2xl" className="text-center mb-8">
          Transform event attendance into collectible digital moments on Flow blockchain.
        </Typhography>
        <div className="grid grid-cols-2 gap-6">
          {[
            { num: "1", title: "Event Discovery", desc: "Browse cultural events in your area" },
            { num: "2", title: "NFT Tickets", desc: "Register and receive unique blockchain tickets" },
            { num: "3", title: "Check-in Rewards", desc: "Get random cultural NFT designs when you attend" },
            { num: "4", title: "Digital Collection", desc: "Build your portfolio of cultural moments" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-xl p-6 space-y-3"
            >
              <div className="text-4xl font-bold text-primary">{item.num}</div>
              <Typhography variant="xl" className="font-semibold">
                {item.title}
              </Typhography>
              <Typhography variant="t1" className="text-muted-foreground">
                {item.desc}
              </Typhography>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  // Slide 4: Unique Value Proposition
  {
    title: "🎨 Unique Value Proposition",
    subtitle: "Not just tickets - Cultural Digital Collectibles",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: "🎭", title: "Indonesian Cultural Elements", desc: "Batik borders, Gamelan audio, Javanese script" },
            { icon: "🎲", title: "Gacha-Style Excitement", desc: "Random NFT designs (5 unique cultural cards)" },
            { icon: "📍", title: "Location-Based", desc: "Geo-fenced check-ins ensure real attendance" },
            { icon: "⛓️", title: "Flow Blockchain", desc: "Fast, eco-friendly, wallet-friendly" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="bg-background/10 backdrop-blur-lg border border-primary/50 rounded-xl p-6 space-y-3 hover:scale-105 transition-transform"
            >
              <div className="text-5xl">{item.icon}</div>
              <Typhography variant="xl" className="font-semibold">
                {item.title}
              </Typhography>
              <Typhography variant="t1" className="text-muted-foreground">
                {item.desc}
              </Typhography>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },

  // Slide 5: User Experience
  {
    title: "🎮 User Experience",
    subtitle: "Simple journey for attendees and organizers",
    content: (
      <div className="space-y-8">
        <div className="space-y-6">
          <Typhography variant="2xl" className="font-semibold text-primary">
            For Attendees:
          </Typhography>
          <div className="flex items-center gap-4">
            {["Discover event", "Register", "Check-in", "Mint NFT"].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex-1"
              >
                <div className="bg-primary/10 backdrop-blur-lg border border-primary/50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{i + 1}</div>
                  <Typhography variant="lg">{step}</Typhography>
                </div>
                {i < 3 && <div className="text-center text-4xl text-primary mt-2">→</div>}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6 mt-12">
          <Typhography variant="2xl" className="font-semibold text-purple-400">
            For Event Organizers:
          </Typhography>
          <div className="grid grid-cols-4 gap-4">
            {[
              "Create event with location",
              "Set check-in radius",
              "Track attendance",
              "Engage attendees",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="bg-purple-500/10 backdrop-blur-lg border border-purple-500/50 rounded-xl p-4"
              >
                <Typhography variant="t1" className="text-muted-foreground text-center">
                  {step}
                </Typhography>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // Slide 6: Technology Stack
  {
    title: "🛠️ Technology Stack",
    subtitle: "Built on cutting-edge blockchain and web technologies",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary/10 backdrop-blur-lg border border-primary/50 rounded-xl p-6 space-y-4"
          >
            <Typhography variant="2xl" className="font-bold text-primary">
              Blockchain
            </Typhography>
            <ul className="space-y-2">
              <li>✅ Flow Blockchain</li>
              <li>✅ Cadence smart contracts</li>
              <li>✅ NFT standards compliant</li>
              <li>✅ Wallet integration</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-500/10 backdrop-blur-lg border border-purple-500/50 rounded-xl p-6 space-y-4"
          >
            <Typhography variant="2xl" className="font-bold text-purple-400">
              Frontend
            </Typhography>
            <ul className="space-y-2">
              <li>✅ React + TypeScript</li>
              <li>✅ Motion animations</li>
              <li>✅ Real-time tracking</li>
              <li>✅ Mobile responsive</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-pink-500/10 backdrop-blur-lg border border-pink-500/50 rounded-xl p-6 space-y-4"
          >
            <Typhography variant="2xl" className="font-bold text-pink-400">
              Smart Features
            </Typhography>
            <ul className="space-y-2">
              <li>✅ Geo-fencing</li>
              <li>✅ Partner system</li>
              <li>✅ Rarity tiers</li>
              <li>✅ Cultural metadata</li>
            </ul>
          </motion.div>
        </div>
      </div>
    ),
  },

  // Slide 7: Market Opportunity
  {
    title: "📊 Market Opportunity",
    subtitle: "Large and growing market for digital collectibles",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              Target Market
            </Typhography>
            {[
              "Cultural Events: Festivals, exhibitions, heritage sites",
              "Concerts & Performances: Music, theater, traditional arts",
              "Educational Institutions: Campus events, workshops",
              "Tourism: Heritage sites, museums, cultural centers",
            ].map((market, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-background/10 backdrop-blur-lg border border-border rounded-lg p-4"
              >
                <Typhography variant="t1" className="text-muted-foreground">
                  • {market}
                </Typhography>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              Market Size
            </Typhography>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-xl p-8 text-center space-y-4"
            >
              <Typhography variant="3xl" className="font-bold text-primary">
                $11B+
              </Typhography>
              <Typhography variant="lg" className="text-muted-foreground">
                Global NFT Market 2024
              </Typhography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-border rounded-xl p-6 text-center"
            >
              <Typhography variant="lg" className="text-muted-foreground">
                Indonesia event ticketing: <span className="text-primary font-bold">Growing digital adoption</span>
              </Typhography>
            </motion.div>
          </div>
        </div>
      </div>
    ),
  },

  // Slide 8: Business Model
  {
    title: "💰 Business Model",
    subtitle: "Multiple revenue streams for sustainable growth",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              Revenue Streams
            </Typhography>
            {[
              { title: "Platform Fee", desc: "5-10% per ticket sale", value: "Primary" },
              { title: "Premium Features", desc: "Custom cultural elements", value: "Add-on" },
              { title: "Marketplace", desc: "Secondary NFT trading royalties", value: "Passive" },
              { title: "Partner Subscriptions", desc: "Event organizer plans", value: "Recurring" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-primary/10 backdrop-blur-lg border border-primary/50 rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Typhography variant="lg" className="font-semibold">
                      {item.title}
                    </Typhography>
                    <Typhography variant="t2" className="text-muted-foreground">
                      {item.desc}
                    </Typhography>
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-lg">
                    <Typhography variant="t2">{item.value}</Typhography>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              Cost Structure
            </Typhography>
            <div className="space-y-4">
              {[
                { label: "Blockchain Gas Fees", percent: 10, color: "bg-purple-500" },
                { label: "Development & Maintenance", percent: 40, color: "bg-primary" },
                { label: "Marketing & Partnerships", percent: 30, color: "bg-pink-500" },
                { label: "Operations", percent: 20, color: "bg-blue-500" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between">
                    <Typhography variant="t1">{item.label}</Typhography>
                    <Typhography variant="t1" className="text-primary font-semibold">
                      {item.percent}%
                    </Typhography>
                  </div>
                  <div className="w-full bg-background/20 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Slide 9: Traction & Roadmap
  {
    title: "🎯 Traction & Roadmap",
    subtitle: "From MVP to market leader",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 backdrop-blur-lg border border-primary/50 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="text-3xl">✅</div>
              <Typhography variant="xl" className="font-bold text-primary">
                Current Status
              </Typhography>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Smart contracts on Testnet</li>
              <li>• Event registration system</li>
              <li>• NFT minting (5 designs)</li>
              <li>• Gacha animation</li>
              <li>• Wallet integration</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-500/10 backdrop-blur-lg border border-purple-500/50 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="text-3xl">🚀</div>
              <Typhography variant="xl" className="font-bold text-purple-400">
                Next 3 Months
              </Typhography>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Launch on Mainnet</li>
              <li>• 10 Jakarta events</li>
              <li>• NFT marketplace</li>
              <li>• 50+ design collections</li>
              <li>• Mobile app beta</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-pink-500/10 backdrop-blur-lg border border-pink-500/50 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="text-3xl">📈</div>
              <Typhography variant="xl" className="font-bold text-pink-400">
                6-12 Months
              </Typhography>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• 5 Indonesian cities</li>
              <li>• 1,000+ events</li>
              <li>• 10,000+ NFTs minted</li>
              <li>• Tourism partnerships</li>
              <li>• International expansion</li>
            </ul>
          </motion.div>
        </div>
      </div>
    ),
  },

  // Slide 10: Funding Ask
  {
    title: "💰 Funding Ask",
    subtitle: "Seeking $50K - $100K Seed Round",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-xl p-8 text-center space-y-6"
          >
            <Typhography variant="3xl" className="font-bold text-primary">
              $50K - $100K
            </Typhography>
            <Typhography variant="xl" className="text-muted-foreground">
              Seed Round Investment
            </Typhography>
            <div className="pt-4 border-t border-border">
              <Typhography variant="lg" className="text-primary font-semibold">
                6-month runway to mainnet launch
              </Typhography>
            </div>
          </motion.div>

          <div className="space-y-4">
            <Typhography variant="xl" className="font-semibold mb-4">
              Use of Funds
            </Typhography>
            {[
              { label: "Product Development", percent: 40, color: "bg-primary" },
              { label: "Marketing & Partnerships", percent: 30, color: "bg-purple-500" },
              { label: "Team Expansion", percent: 20, color: "bg-pink-500" },
              { label: "Operations", percent: 10, color: "bg-blue-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="space-y-2"
              >
                <div className="flex justify-between">
                  <Typhography variant="lg">{item.label}</Typhography>
                  <Typhography variant="lg" className="text-primary font-bold">
                    {item.percent}%
                  </Typhography>
                </div>
                <div className="w-full bg-background/20 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                    className={`${item.color} h-4 rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // Slide 11: The Ask
  {
    title: "🎯 The Ask",
    subtitle: "Join us in preserving cultural moments on the blockchain",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              What We Need
            </Typhography>
            {[
              { icon: "💰", text: "Seed funding ($50K-$100K)" },
              { icon: "🤝", text: "Strategic partnerships (cultural organizations)" },
              { icon: "🌐", text: "Network introductions (Flow ecosystem)" },
              { icon: "📢", text: "Marketing support (crypto communities)" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="text-4xl">{item.icon}</div>
                <Typhography variant="lg">{item.text}</Typhography>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <Typhography variant="2xl" className="font-semibold text-primary">
              What You Get
            </Typhography>
            {[
              { icon: "📊", text: "Equity/Token allocation" },
              { icon: "⚡", text: "Early access to platform features" },
              { icon: "🗳️", text: "Community governance role" },
              { icon: "🎨", text: "Cultural impact + ROI" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-primary/10 backdrop-blur-lg border border-primary/50 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="text-4xl">{item.icon}</div>
                <Typhography variant="lg">{item.text}</Typhography>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // Slide 12: Team
  {
    title: "👥 Our Team",
    subtitle: "Passionate builders committed to preserving cultural heritage",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              avatar: "https://avatars.githubusercontent.com/u/30310725?s=400&v=4",
              name: "Raihan Ardianata",
              role: "Founder & Blockchain Lead",
              expertise: "Flow & Cadence Expert",
            },
            {
              avatar: "https://avatars.githubusercontent.com/u/59690056?s=400&v=4",
              name: "Adityama Fulvian",
              role: "Frontend & Design Lead",
              expertise: "React & UI/UX Expert",
            },
            {
              avatar: "https://avatars.githubusercontent.com/u/51023310?s=500&v=4",
              name: "Bryan Dewa Wicaksana",
              role: "Backend Lead",
              expertise: "EVM & Cross-chain Expert",
            },
            {
              avatar: "https://avatars.githubusercontent.com/u/39423103?s=400&v=4",
              name: "Adzikri Fauzi Shiddiq",
              role: "Community & Strategy",
              expertise: "BD & Partnerships",
            },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 text-center space-y-4 hover:scale-105 transition-transform"
            >
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary/50">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Typhography variant="lg" className="font-semibold">
                  {member.name}
                </Typhography>
                <Typhography variant="t1" className="text-primary">
                  {member.role}
                </Typhography>
                <Typhography variant="t2" className="text-muted-foreground mt-2">
                  {member.expertise}
                </Typhography>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-xl p-8 text-center"
        >
          <Typhography variant="xl" className="text-muted-foreground">
            Backed by advisors from cultural heritage organizations, Flow blockchain community, and event industry professionals
          </Typhography>
        </motion.div>
      </div>
    ),
  },

  // Slide 13: Vision & Thank You
  {
    title: "🌟 Vision",
    subtitle: '"Every cultural moment deserves to be captured forever"',
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <Typhography variant="3xl" className="font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            From traditional festivals to modern concerts
          </Typhography>
          <Typhography variant="2xl" className="text-muted-foreground">
            From heritage sites to campus events
          </Typhography>
          <Typhography variant="xl" className="text-primary">
            We're building the future of cultural event attendance.
          </Typhography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-lg border border-border rounded-2xl p-8 text-center space-y-4"
        >
          <Typhography variant="2xl" className="font-bold">
            Blockchain-verified.
          </Typhography>
          <Typhography variant="2xl" className="font-bold">
            Culturally rich.
          </Typhography>
          <Typhography variant="2xl" className="font-bold">
            Forever collectible.
          </Typhography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-4 pt-8"
        >
          <Typhography variant="3xl" className="font-bold text-primary">
            Thank You!
          </Typhography>
          <Typhography variant="xl" className="text-muted-foreground">
            Let's capture cultural moments together.
          </Typhography>
          <Button asChild size="lg" className="mt-6">
            <a href="/landing">
              <Typhography variant="lg">Explore Platform</Typhography>
            </a>
          </Button>
        </motion.div>
      </div>
    ),
  },
];

const MemoGalaxy = memo(Galaxy);
export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  // Add keyboard navigation
  useState(() => {
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  });

  return (
    <div className="min-h-screen bg-background relative isolate">
      {/* Background */}
      <div className="fixed inset-0 -z-1">
        <MemoGalaxy />
      </div>

      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Typhography variant="t1" className="text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </Typhography>
            <Button asChild variant="outline" size="sm">
              <a href="/">
                <Home size={16} />
                <Typhography variant="t1">Home</Typhography>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="container mx-auto px-8 pt-24 pb-32 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Slide Header */}
            <div className="mb-8 space-y-2">
              <Typhography variant="4xl" className="font-bold">
                {slides[currentSlide].title}
              </Typhography>
              <Typhography variant="xl" className="text-primary">
                {slides[currentSlide].subtitle}
              </Typhography>
            </div>

            {/* Slide Content */}
            <div className="flex-1">{slides[currentSlide].content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-0 right-0 z-40">
        <div className="container mx-auto px-8 flex justify-between items-center">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            size="lg"
            variant="outline"
          >
            <ChevronLeft size={20} />
            <Typhography variant="lg">Previous</Typhography>
          </Button>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            size="lg"
          >
            <Typhography variant="lg">Next</Typhography>
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
