# Capt.today - Cultural NFT Event Ticketing Platform

## 🎯 Project Overview

Capt.today is an NFT-based event ticketing platform built on Flow blockchain that transforms cultural event attendance into collectible digital moments. By combining blockchain technology with Indonesian cultural heritage, we've created a unique gacha-style experience where attendees receive random cultural NFT designs upon checking in to events.

## 💡 Problem Statement

Cultural events create meaningful experiences, but these moments are ephemeral:
- Physical tickets get lost or discarded after events
- No verifiable proof of attendance at cultural moments
- Event organizers lose connection with attendees post-event
- Cultural heritage experiences aren't preserved digitally for future generations

## 🚀 Our Solution

Capt.today leverages Flow blockchain to create permanent, collectible records of cultural event attendance with the following features:

### For Attendees:
1. **Discover Events** - Browse cultural events, festivals, and heritage sites
2. **NFT Tickets** - Register for events and receive blockchain-based tickets
3. **Location-Verified Check-in** - Use geo-fencing to verify physical attendance
4. **Gacha-Style NFT Minting** - Receive random cultural NFT designs with exciting reveal animation
5. **Digital Collection** - Build a permanent portfolio of cultural experiences

### For Event Organizers:
1. **Easy Event Creation** - Set up events with location parameters and capacity limits
2. **Real-time Analytics** - Track registrations and check-ins in real-time
3. **Attendee Engagement** - Reward attendance with collectible NFTs
4. **Cultural Customization** - Choose from authentic Indonesian cultural elements

## 🎨 Unique Features

### Indonesian Cultural Elements
Every NFT features authentic Indonesian heritage:
- **Batik Patterns** - Traditional textile art borders
- **Wayang Icons** - Shadow puppet cultural symbols
- **Gamelan Audio** - Traditional music integration
- **Javanese Script** - Unicode support for cultural text
- 5 unique card designs: Balinese Woman, Candi Borobudur, Javanese Woman, Wayang, Gamelan

### Gacha Mechanics
- Random NFT selection upon check-in (you don't choose, you discover)
- Exciting box-opening animation with 3D effects
- Rarity tiers: Common, Rare, Epic, Legendary
- Collectibility drives engagement and retention

### Location-Based Verification
- Geo-fencing ensures real attendance (not just registration)
- Configurable check-in radius per event
- Prevents fraud and ensures authentic proof of attendance

## 🛠️ Technical Implementation

### Smart Contracts (Cadence)
- **NFTMoment.cdc** - Core NFT minting with rich cultural metadata
- **EventPlatform.cdc** - Event management, registration, and check-in logic
- **MomentUtility.cdc** - Helper functions and utilities
- Deployed on Flow Testnet with mainnet-ready architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React + TypeScript
- **Blockchain Integration**: @onflow/fcl, @onflow/react-sdk
- **State Management**: TanStack Query for caching
- **Animations**: Framer Motion for gacha reveal experience
- **Routing**: TanStack Router for file-based routing
- **Styling**: Tailwind CSS with custom theme

### Key Technical Features
- Real-time transaction status tracking
- Wallet integration (Dapper, Blocto, Lilico)
- Geo-location verification for check-ins
- NFT metadata with location, timestamp, weather, cultural elements
- Partner permission system for authorized event creators
- Error handling with user-friendly messages

## 📊 Current Status

### ✅ Completed Features
- ✅ Smart contracts deployed on Flow Testnet
- ✅ Event creation and management system
- ✅ User registration with wallet integration
- ✅ Location-based check-in verification
- ✅ NFT minting with 5 cultural card designs
- ✅ Gacha-style reveal animation (box opening + card spin)
- ✅ Event discovery and details pages
- ✅ Partner management system
- ✅ Real-time transaction monitoring
- ✅ Interactive pitch deck presentation
- ✅ Landing page with circular gallery

### 🎯 Demo Highlights
1. **Event Discovery** - Browse available cultural events
2. **Registration Flow** - Connect wallet → Register for event → Receive NFT ticket
3. **Check-in Experience** - Location verification → Claim NFT button
4. **Gacha Animation** - 3.6s animated sequence with blur-in, box spinning, lid opening, and card reveal
5. **Collection View** - See all minted NFTs in user's wallet

## 🏗️ Architecture

### Contract Layer
```
EventPlatform (Event Management)
    ↓
NFTMoment (NFT Minting)
    ↓
User Collections (Storage)
```

### Frontend Layer
```
TanStack Router (Navigation)
    ↓
Flow Provider (Blockchain Context)
    ↓
React Components (UI)
    ↓
FCL (Flow Client Library)
```

## 🌟 Innovation & Impact

### Technical Innovation
- **Flow-first approach** - Built specifically for Flow's resource-oriented programming
- **Gacha mechanics on blockchain** - Unique random NFT distribution system
- **Geo-verification** - Combining real-world location with blockchain proof
- **Cultural metadata** - Rich on-chain data preserving heritage

### Social Impact
- **Cultural Preservation** - Digital archival of Indonesian heritage
- **Community Building** - Connecting attendees through shared experiences
- **Tourism Promotion** - Incentivizing visits to cultural sites
- **Next-Gen Engagement** - Making cultural events appealing to younger audiences

## 🎯 Target Market

- **Cultural Events**: Festivals, exhibitions, traditional ceremonies
- **Heritage Sites**: Borobudur, Prambanan, museums, cultural centers
- **Educational Institutions**: University events, workshops, seminars
- **Tourism Industry**: Heritage tourism, cultural tours
- **Event Organizers**: NGOs, cultural organizations, government bodies

## 📈 Business Model

- **Platform Fee**: 5-10% per ticket sale
- **Premium Features**: Custom cultural elements for organizers
- **Marketplace Royalties**: Secondary NFT trading fees (future)
- **Partner Subscriptions**: Monthly plans for event organizers (future)

## 🚀 Roadmap

### Immediate (Hackathon Deliverables)
- ✅ Working MVP on Flow Testnet
- ✅ Event creation, registration, check-in, NFT minting
- ✅ 5 cultural NFT designs
- ✅ Gacha animation experience

### Next 3 Months
- Launch on Flow Mainnet
- Partner with 10 cultural events in Jakarta
- Implement NFT marketplace for secondary trading
- Expand to 50+ cultural design collections
- Mobile-responsive optimizations

### 6-12 Months
- Expand to 5 major Indonesian cities
- 1,000+ events on platform
- 10,000+ NFTs minted
- Partnerships with tourism boards
- Cross-chain bridging to Flow EVM

## 👥 Team

**Raihan Ardianata** - Founder & Blockchain Lead
- Flow & Cadence expert, original idea creator
- [GitHub](https://github.com/u/30310725)

**Adityama Fulvian** - Frontend & Design Lead
- React & UI/UX specialist
- [GitHub](https://github.com/u/59690056)

**Bryan Dewa Wicaksana** - Backend Lead
- EVM & cross-chain expert
- [GitHub](https://github.com/u/51023310)

**Adzikri Fauzi Shiddiq** - Community & Strategy
- Business development & partnerships
- [GitHub](https://github.com/u/39423103)

## 🔗 Links

- **Live Demo**: [Deployed on Testnet]
- **GitHub Repository**: [GitHub Link]
- **Pitch Deck**: `/pitch` route in app
- **Landing Page**: `/landing` route in app
- **Flow Testnet Contracts**: `0x1b7f070ebf7d0431`

## 🏆 Why This Project Stands Out

1. **Real-world utility** - Solves actual problems for event organizers and attendees
2. **Cultural impact** - Preserves and promotes Indonesian heritage digitally
3. **Flow-native** - Built specifically for Flow's strengths (low fees, fast finality, user-friendly wallets)
4. **Gamification** - Gacha mechanics create excitement and collectibility
5. **Location verification** - Ensures authenticity and prevents fraud
6. **Production-ready** - Fully functional MVP with real deployment
7. **Scalable architecture** - Partner system enables rapid event onboarding
8. **Beautiful UX** - Professional animations and design

## 🔧 Technologies Used

**Blockchain**: Flow Blockchain, Cadence Smart Contracts

**Frontend**: React, TypeScript, Vite, TanStack Router, TanStack Query

**Blockchain SDK**: @onflow/fcl, @onflow/react-sdk

**Animation**: Framer Motion

**Styling**: Tailwind CSS

**Geolocation**: Browser Geolocation API

**Deployment**: Flow Testnet

## 📦 Project Structure

```
flow-project/
├── cadence/
│   ├── contracts/
│   │   ├── EventPlatform.cdc
│   │   ├── NFTMoment.cdc
│   │   └── MomentUtility.cdc
│   ├── scripts/
│   │   ├── get_event.cdc
│   │   ├── get_nft_ids.cdc
│   │   └── ...
│   └── transactions/
│       ├── create_event.cdc
│       ├── register_event.cdc
│       ├── checkin_event.cdc
│       └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CircularGallery.tsx
│   │   │   ├── Galaxy.tsx
│   │   │   └── ...
│   │   ├── features/
│   │   │   ├── events/
│   │   │   ├── pitch/
│   │   │   └── landing/
│   │   ├── routes/
│   │   └── main.tsx
│   └── public/
│       ├── card-1.png (Balinese Woman)
│       ├── card-2.png (Candi Borobudur)
│       ├── card-3.png (Javanese Woman)
│       ├── card-4.png (Wayang)
│       └── card-5.png (Gamelan)
├── flow.json
├── PITCH_DECK.md
└── DESCRIPTION.md
```

## 🎮 How to Run

### Prerequisites
- Flow CLI installed
- Bun or Node.js installed
- Flow wallet (for testnet interaction)

### Backend Setup
```bash
# Start Flow emulator
flow emulator --start

# Deploy contracts
flow project deploy --network=emulator

# Or use testnet
flow project deploy --network=testnet
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
bun install

# Set environment variables
# VITE_ACCESS_NODE=https://access.devnet.nodes.onflow.org:9000
# VITE_FLOW_NETWORK=testnet
# VITE_WALLET_DISCOVERY=https://fcl-discovery.onflow.org/testnet/authn

# Start development server
bun dev
```

### Access the App
- Main App: http://localhost:5173
- Landing Page: http://localhost:5173/landing
- Pitch Deck: http://localhost:5173/pitch

## 🎯 User Journey

### As an Attendee:
1. Visit the platform and connect Flow wallet
2. Browse available cultural events
3. Register for an event (receive NFT ticket)
4. Arrive at event location
5. Check in (location verified via GPS)
6. Watch gacha animation
7. Receive random cultural NFT design
8. View NFT in collection

### As an Event Organizer (Partner):
1. Request partner access (admin approval)
2. Create new event with:
   - Event details (name, description, date)
   - Location (lat/lon, place name)
   - Check-in radius (geo-fence)
   - Capacity limit
3. Share event with community
4. Monitor registrations in real-time
5. Track check-ins during event
6. See NFTs minted by attendees

## 💎 Key Smart Contract Functions

### EventPlatform.cdc
- `createEvent()` - Create new cultural event
- `registerForEvent()` - User registration
- `checkInToEvent()` - Location-verified check-in
- `claimEventNFT()` - Mint NFT after check-in
- `getEvent()` - Query event details
- `getEventRegistrants()` - List registered users
- `addPartner()` - Admin function to authorize organizers

### NFTMoment.cdc
- `mintNFT()` - Create new NFT with metadata
- `upgradeNFT()` - Increase rarity tier
- `mergeNFTs()` - Combine two NFTs
- `borrowNFT()` - Read NFT data
- `getIDs()` - Get user's NFT collection

## 🌍 Environmental & Social Impact

### Carbon Footprint
- Flow blockchain is carbon-neutral
- More eco-friendly than proof-of-work chains
- Digital tickets reduce paper waste

### Cultural Preservation
- Digital archival of traditional art forms
- Making heritage accessible to global audience
- Incentivizing cultural tourism
- Revenue for cultural organizations

### Economic Opportunity
- New revenue stream for event organizers
- Digital collectibles market for Indonesian culture
- Tourism promotion through gamification
- Platform economy for cultural workers

## 🔮 Future Vision

Capt.today aims to become the leading platform for cultural event ticketing in Southeast Asia, expanding beyond Indonesia to preserve and promote regional heritage through blockchain technology. Our vision includes:

- **Regional Expansion**: Thailand, Vietnam, Malaysia cultural events
- **Cross-chain Integration**: Flow EVM bridge for wider NFT ecosystem
- **AR/VR Experiences**: Immersive cultural content in NFTs
- **DAO Governance**: Community-driven cultural preservation
- **Mobile Apps**: Native iOS/Android applications
- **Metaverse Integration**: Virtual cultural exhibitions

---

**Capt.today** - *Capture Your Cultural NFT Moments Today!*

Making cultural heritage accessible, collectible, and forever preserved on the blockchain.

**Website**: capt.today
**Email**: team@capt.today
**Built with**: Flow Blockchain ⛓️
