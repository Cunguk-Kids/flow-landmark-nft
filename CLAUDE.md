# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Flow blockchain decentralized application (dApp) consisting of:
- **Backend**: Cadence smart contracts deployed on Flow blockchain
- **Frontend**: React + TypeScript web application using Flow Client Library (FCL)

The project is configured to work with the Flow emulator for local development and can deploy to Flow Testnet and Mainnet.

## Architecture

**Flow Configuration (`flow.json`):**
- Defines contract deployments, network configurations, and account management
- The `Counter` contract is configured to deploy to the `test-account` on the emulator
- Emulator account: `f8d6e0586b0a20c7` (key stored in `emulator-account.pkey`)
- Test account: `179b6b1cb6755e31`

**Cadence Code Organization:**
- `/cadence/contracts/` - Smart contracts that get deployed to the blockchain
- `/cadence/scripts/` - Read-only operations that query blockchain state without modifying it
- `/cadence/transactions/` - State-changing operations that must be signed and authorized
- `/cadence/tests/` - Integration tests for contracts (files ending with `_test.cdc`)

**Contract Pattern:**
The Counter contract demonstrates the standard Cadence pattern:
- State variables are stored at contract level
- Events are emitted for important state changes (`CounterIncremented`, `CounterDecremented`)
- Public functions use `access(all)` modifier
- View functions use `view access(all)` for read-only operations

**Import System:**
Scripts and transactions import contracts using simple string syntax: `import "Counter"`
The Flow CLI resolves these imports based on `flow.json` configuration.

**Frontend Architecture (`/frontend`):**
- **Vite + React + TypeScript** - Modern build tooling and UI framework
- **Bun** - Package manager and runtime (faster than npm)
- **@onflow/fcl** - Flow Client Library for blockchain interaction
- **@onflow/react-sdk** - Official React SDK with hooks and UI components
  - Built on TanStack Query for caching and background updates
  - Tailwind CSS for styling with full theming support
  - TypeScript-native with full type safety

**Frontend Code Organization:**
- `/frontend/src/components/` - React components (Auth, Counter, etc.)
- `/frontend/src/flow/config.ts` - FCL configuration for different networks
- `/frontend/src/flow/scripts.ts` - Cadence script code strings (used with hooks)
- `/frontend/src/flow/transactions.ts` - Cadence transaction code strings (used with hooks)
- `/frontend/src/main.tsx` - App entry point with FlowProvider wrapper
- `/frontend/src/docs/@onflow/react-sdk/` - Official React SDK documentation reference

**Frontend Coding Conventions:**

1. **Typography Component Variants**
   - Always use the correct Typography variant naming (from smallest to largest):
     - `t3` - Extra small (5px → xs) - Use for badges, tiny labels
     - `t2` - Small (10px → sm) - Use for metadata, button text, captions
     - `t1` - Base/Default (xs → base) - Use for body text, default content
     - `lg` - Medium-large (sm → lg) - Use for emphasis text
     - `2xl` - Large (base → 2xl) - Use for section titles
     - `3xl` - Extra large (lg → 3xl) - Use for main headings

   ```tsx
   // ✅ Correct
   <Typhography variant="t2">Small metadata text</Typhography>
   <Typhography variant="t1">Normal body text</Typhography>
   <Typhography variant="2xl">Section Title</Typhography>

   // ❌ Wrong - Don't use sm, base, xs directly
   <Typhography variant="sm">Text</Typhography>
   ```

2. **className with `cn` Utility**
   - ALWAYS use the `cn()` utility function for className instead of template literal concatenation
   - Import from `@/lib/utils`
   - This ensures proper Tailwind class merging and better readability

   ```tsx
   import { cn } from "@/lib/utils";

   // ✅ Correct
   <div className={cn(
     "base-classes here",
     condition && "conditional-classes",
     someVar ? "class-a" : "class-b"
   )} />

   // ❌ Wrong - Don't use template literals
   <div className={`base-classes ${condition ? "class-a" : "class-b"}`} />
   ```

**React SDK Core Concepts:**

**FlowProvider Configuration:**
The app must be wrapped with `<FlowProvider>` which accepts:
- `config` - Network and app configuration object:
  - `accessNodeUrl` - Flow access node URL for the network
  - `flowNetwork` - Network name ('emulator', 'testnet', 'mainnet')
  - `appDetailTitle` - Your dApp name
  - `appDetailIcon` - Icon URL for wallet display
  - `appDetailDescription` - Short description
  - `appDetailUrl` - Your dApp URL
- `flowJson` - Import of flow.json for contract address resolution
- `darkMode` - Boolean to control dark/light theme (parent app manages)
- `theme` - Optional custom theme object for colors and styling

**Available Hooks:**
- **useFlowCurrentUser()** - Current user authentication state
  - Returns: `{ user, authenticate, unauthenticate }`
  - `user` has `addr`, `loggedIn`, etc.
  - Call `authenticate()` to login, `unauthenticate()` to logout
- **useFlowQuery()** - Execute read-only Cadence scripts
  - Returns: `{ data, refetch, isLoading, error }`
  - Requires `cadence` and `args` parameters
  - Args is a function: `args: () => []` or `args: (arg, t) => [arg(value, t.Type)]`
- **useFlowAccount()** - Get account details and balances
- **useFlowBlock()** - Query block information
- **useFlowEvents()** - Subscribe to real-time events
- **useDarkMode()** - Access current theme state (read-only)

**For Transactions:**
- Use `fcl.mutate()` for executing transactions programmatically
- Or use `<TransactionButton />` component for built-in UI
- `useFlowMutate` exists but has a different API - prefer direct FCL or components

**Built-in UI Components:**
- **`<Connect />`** - Drop-in wallet connection with balance display
  - Props: `variant`, `onConnect`, `onDisconnect`, `balanceType`
  - Shows Cadence, EVM, or combined FLOW balance
- **`<TransactionButton />`** - Execute transactions with loading states
  - Props: `transaction`, `label`, `mutation`, `variant`
  - Integrates with global transaction management
- **`<TransactionDialog />`** - Real-time transaction status tracking
  - Props: `open`, `onOpenChange`, `txId`, `onSuccess`, `closeOnSuccess`
  - Shows pending, success, and error states
- **`<TransactionLink />`** - Network-aware block explorer links
  - Props: `txId`, `variant`
  - Automatically uses correct explorer for current network

**Production-Ready Pattern: Read, Mutate, Wait**

```tsx
import { useEffect } from 'react';
import {
  useFlowCurrentUser,
  useFlowQuery,
  useFlowMutate,
  useFlowTransactionStatus
} from '@onflow/react-sdk';

function MyComponent() {
  const { user } = useFlowCurrentUser();

  // 1. READ from smart contract
  const { data: count, refetch, isLoading } = useFlowQuery<number>({
    cadence: `
      import "Counter"
      access(all) fun main(): Int {
        return Counter.getCount()
      }
    `,
    query: { enabled: true },
  });

  // 2. MUTATE smart contract
  const { mutateAsync, isPending, data: txId } = useFlowMutate();

  // 3. WAIT for transaction completion
  const { transactionStatus } = useFlowTransactionStatus({ id: txId || '' });

  // Auto-refetch when transaction is sealed (status 3 = completed)
  useEffect(() => {
    if (txId && transactionStatus?.status === 3) {
      refetch();
    }
  }, [transactionStatus, txId]);

  const handleMutate = async (value: boolean) => {
    await mutateAsync({
      cadence: `
        import "Counter"
        transaction(inc: Bool) {
          prepare(acct: &Account) {}
          execute {
            if inc {
              Counter.increment()
            } else {
              Counter.decrement()
            }
          }
        }
      `,
      args: (arg, t) => [arg(value, t.Bool)],
    });
    refetch(); // Optional: refetch immediately
  };

  return (
    <div>
      <p>Count: {isLoading ? 'Loading...' : count}</p>
      <button onClick={() => handleMutate(true)} disabled={isPending}>
        {isPending ? 'Processing...' : 'Increment'}
      </button>
    </div>
  );
}
```

**Key Points:**
- Use `import "ContractName"` syntax (no `from 0x...` needed with flowJson)
- Transaction parameters go in `transaction(param: Type)` signature, NOT in `execute()`
- Arguments must use FCL format: `args: (arg, t) => [arg(value, t.Type)]`
- Transaction status 3 = sealed (completed)
- Auto-refetch pattern keeps UI in sync with blockchain state

**Benefits of React SDK:**
- Declarative React hooks instead of imperative FCL calls
- Automatic caching, retries, and background updates via TanStack Query
- Built-in loading, error, and success state management
- Production-ready UI components styled with Tailwind
- Full theming system with dark mode support
- TypeScript-native with excellent type inference
- Cross-VM support for Cadence ↔ Flow EVM bridging

## Common Commands

**Development Workflow:**
```shell
# Start the emulator (must be running for local development)
flow emulator --start

# Deploy contracts to emulator
flow project deploy --network=emulator

# Execute a script (read-only, no gas cost)
flow scripts execute cadence/scripts/GetCounter.cdc

# Send a transaction (modifies state, requires account authorization)
flow transactions send cadence/transactions/IncrementCounter.cdc

# Run all tests
flow test

# Run a specific test file
flow test cadence/tests/Counter_test.cdc
```

**Generating New Files:**
```shell
# Generate new contract (creates file and updates flow.json)
flow generate contract

# Generate new script
flow generate script

# Generate new transaction
flow generate transaction

# Generate new test
flow generate test
```

**Dependency Management:**
```shell
# Install external contract dependencies (e.g., NFT standards)
flow deps add mainnet://[address].[ContractName]

# Example: Install NonFungibleToken standard
flow deps add mainnet://1d7e57aa55817448.NonFungibleToken
```

**Deployment to Networks:**
```shell
# Deploy to testnet
flow project deploy --network=testnet

# Deploy to mainnet
flow project deploy --network=mainnet
```

**Frontend Development:**
```shell
# Install frontend dependencies
cd frontend
bun install

# Start development server (http://localhost:5173)
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Start Flow dev wallet (required for emulator authentication)
flow dev-wallet
```

**Full Stack Development Setup:**
```shell
# Terminal 1: Start Flow emulator
flow emulator --start

# Terminal 2: Start dev wallet
flow dev-wallet

# Terminal 3: Deploy contracts (only needed once or after contract changes)
flow project deploy --network=emulator

# Terminal 4: Start frontend
cd frontend && bun dev
```

## Development Notes

**Full Stack Workflow:**
1. Smart contract changes require redeploying: `flow project deploy --network=emulator`
2. Frontend automatically hot-reloads on code changes
3. After deploying new contracts, refresh the frontend to pick up changes
4. Check browser console for FCL transaction logs and errors

**Transaction Structure:**
Transactions have two phases:
1. `prepare(acct: &Account)` - Authorization phase with account access
2. `execute` - Execution phase where contract functions are called

**Testing:**
The Cadence Test Framework uses the `Test` import which provides:
- `Test.createAccount()` - Create test accounts
- `Test.deployContract()` - Deploy contracts in test environment
- `Test.expect()` - Assertion utilities

**Event Listening:**
When contracts emit events, they can be captured and monitored. The Counter contract emits events on increment/decrement which is best practice for state changes.

**Account Key Management:**
- The emulator account key is stored in `emulator-account.pkey`
- Never commit real account keys for testnet/mainnet to version control
- Use environment variables or secure key management for production deployments

**Frontend-Backend Integration:**
- Keep Cadence code in `frontend/src/flow/` synchronized with deployed contracts
- Contract address aliases (like `0xCounter`) are resolved by FCL config
- When switching networks (emulator → testnet → mainnet):
  1. Update `frontend/src/flow/config.ts` with new access node and discovery wallet URLs
  2. Update contract addresses to match deployment on target network
  3. Ensure contracts are deployed to the target network first

**React SDK Authentication Flow:**
1. App is wrapped with `<FlowProvider>` in `main.tsx` with `discoveryWallet` configured
2. Components use `const { user, authenticate, unauthenticate } = useFlowCurrentUser()`
3. User clicks "Connect Wallet" → `authenticate()` is called
4. FCL opens discovery service (dev wallet for emulator, wallet providers for testnet/mainnet)
5. User approves connection
6. `user` object automatically updates with user address and `loggedIn: true`
7. All components using `useFlowCurrentUser()` re-render with new user state
8. To logout, call `unauthenticate()`

**Adding New Contract Interactions:**

When adding new contracts or functions:

1. **Write/Update Cadence Contract** in `/cadence/contracts/`
2. **Deploy Contract**: `flow project deploy --network=emulator`
3. **Export Cadence Code Strings**:

   In `frontend/src/flow/scripts.ts`:
   ```tsx
   export const GET_USER_BALANCE = `
     import MyContract from 0xMyContract

     access(all) fun main(address: Address): UFix64 {
       return MyContract.getBalance(address)
     }
   `;
   ```

   In `frontend/src/flow/transactions.ts`:
   ```tsx
   export const TRANSFER_TOKENS = `
     import MyContract from 0xMyContract

     transaction(amount: UFix64, recipient: Address) {
       prepare(acct: &Account) {
         // Authorization
       }
       execute {
         MyContract.transfer(amount: amount, to: recipient)
       }
     }
   `;
   ```

4. **Build UI Components** - You have two approaches:

   **Approach A: Using Hooks (More Control)**
   ```tsx
   import { useState } from 'react';
   import { useFlowCurrentUser, useFlowQuery } from '@onflow/react-sdk';
   import * as fcl from '@onflow/fcl';
   import { GET_USER_BALANCE, TRANSFER_TOKENS } from '../flow/scripts';

   function BalanceComponent() {
     const { user } = useFlowCurrentUser();
     const [isProcessing, setIsProcessing] = useState(false);

     // Query with arguments
     const { data: balance, refetch } = useFlowQuery({
       cadence: GET_USER_BALANCE,
       args: (arg, t) => [arg(user?.addr, t.Address)],
       enabled: !!user?.addr, // Only fetch when user is logged in
     });

     // Execute transaction with fcl.mutate
     const handleTransfer = async () => {
       if (!user?.loggedIn) {
         alert("Please connect your wallet first!");
         return;
       }

       setIsProcessing(true);
       try {
         const txId = await fcl.mutate({
           cadence: TRANSFER_TOKENS,
           args: (arg, t) => [
             arg("10.0", t.UFix64),
             arg("0x1234...", t.Address)
           ],
           limit: 100,
         });

         await fcl.tx(txId).onceSealed();
         console.log("Transfer successful!");
         refetch(); // Refresh balance after transfer
       } catch (error) {
         console.error("Transfer failed:", error);
       } finally {
         setIsProcessing(false);
       }
     };

     return (
       <div>
         <p>Balance: {balance}</p>
         <button onClick={handleTransfer} disabled={isProcessing}>
           {isProcessing ? "Processing..." : "Transfer"}
         </button>
         <button onClick={() => fcl.authenticate()}>Login</button>
         <button onClick={() => fcl.unauthenticate()}>Logout</button>
       </div>
     );
   }
   ```

   **Approach B: Using Built-in Components (Less Code)**
   ```tsx
   import { Connect, TransactionButton } from '@onflow/react-sdk';
   import { TRANSFER_TOKENS } from '../flow/transactions';

   function TransferComponent() {
     return (
       <div>
         <Connect />
         <TransactionButton
           transaction={{
             cadence: TRANSFER_TOKENS,
             args: (arg, t) => [
               arg("10.0", t.UFix64),
               arg("0x1234...", t.Address)
             ],
             limit: 100,
           }}
           label="Transfer 10 FLOW"
           mutation={{
             onSuccess: (txId) => console.log("Success:", txId),
             onError: (error) => console.error("Failed:", error),
           }}
         />
       </div>
     );
   }
   ```

5. **Using Built-in UI Components**:
   - `<Connect />` - Ready-to-use wallet connection button
   - `<TransactionButton />` - Pre-built transaction execution button
   - `<TransactionDialog />` - Transaction status modal
   - `<TransactionLink />` - Link to block explorer

**FlowProvider Best Practices:**

The `FlowProvider` should be configured with both `config` and `flowJson`:

```tsx
import { FlowProvider } from '@onflow/react-sdk';
import flowJSON from '../flow.json'; // Import your flow.json

function Root() {
  return (
    <FlowProvider
      config={{
        accessNodeUrl: 'http://localhost:8888', // Emulator access node
        flowNetwork: 'emulator',
        appDetailTitle: 'My Flow DApp',
        appDetailIcon: 'https://example.com/icon.png',
        appDetailDescription: 'A decentralized app on Flow',
        appDetailUrl: 'https://myapp.com',
        discoveryWallet: 'http://localhost:8701/fcl/authn', // REQUIRED for wallet auth
      }}
      flowJson={flowJSON} // Provides contract address resolution
      darkMode={false} // Parent app controls theme
    >
      <App />
    </FlowProvider>
  );
}
```

**Important Configuration Notes:**
- **`discoveryWallet`** - REQUIRED for authentication to work
  - Emulator: `http://localhost:8701/fcl/authn`
  - Testnet: `https://fcl-discovery.onflow.org/testnet/authn`
  - Mainnet: `https://fcl-discovery.onflow.org/authn`
- **`flowJson`** - Automatically resolves contract addresses from `flow.json` aliases
  - No need to hardcode addresses in config
  - Cadence imports like `from 0xCounter` work automatically

**Theming and Dark Mode:**
- React SDK uses Tailwind CSS for all styling
- Dark mode is controlled by parent app via `darkMode` prop
- Custom themes can be passed via `theme` prop:
  ```tsx
  theme={{
    colors: {
      primary: {
        background: "bg-blue-600 dark:bg-blue-400",
        text: "text-white dark:text-blue-900",
        hover: "hover:bg-blue-700 dark:hover:bg-blue-300",
      }
    }
  }}
  ```
- Use `useDarkMode()` hook to read current theme in components

**React SDK Documentation:**
Complete documentation is available in `frontend/src/docs/@onflow/react-sdk/`:
- `README.mdx` - Overview and quick start guide
- `components.md` - All UI components, props, and examples
- `configuration.md` - Detailed flow.json configuration guide
- Official playground: https://react.flow.com/

## NFTMoment Contract

### Overview

The **NFTMoment** contract is the core smart contract for the culturally-rich NFT moment platform. It implements a standalone NFT system (without external dependencies) designed to capture and preserve cultural moments with rich metadata, location data, and Indonesian cultural elements.

**Contract Address (Emulator):** `0x179b6b1cb6755e31`

### Key Features

1. **Cultural NFTs** - Capture moments with:
   - Location data (latitude, longitude, place names)
   - Weather and environmental metadata (temperature, altitude, wind speed)
   - Timestamps for when the moment was captured
   - Rich categorization (Landscape, Cultural, Event, Historical, Nature, Urban, Food, Art)

2. **Indonesian Cultural Elements**:
   - **Border Styles**: Batik, Wayang, Songket, Tenun
   - **Stickers**: Javanese Script, Traditional Patterns, Cultural Icons
   - **Filters**: Vintage, Cultural, Vibrant
   - **Audio**: Gamelan, Angklung, Kendang
   - **Javanese Text**: Unicode support for Javanese script

3. **Rarity System**:
   - Common (0)
   - Rare (1)
   - Epic (2)
   - Legendary (3)

4. **NFT Operations**:
   - **Minting** - Create new NFTs with full metadata
   - **Upgrading** - Increase rarity tier
   - **Merging** - Combine two NFTs into a more rare one
   - **Transferring** - Standard NFT transfer capabilities

5. **Partner System**:
   - Partners can mint NFTs with restrictions
   - Location-based minting (geo-fencing with radius)
   - QR code support for physical locations
   - Event-based NFT creation (time-limited drops)
   - Category restrictions per partner

### Contract Structure

**Enums:**
- `Rarity` - Common, Rare, Epic, Legendary
- `Category` - Landscape, Cultural, Event, Historical, Nature, Urban, Food, Art
- `BorderStyle` - None, Batik, Wayang, Songket, Tenun
- `StickerStyle` - None, JavaneseScript, TraditionalPattern, CulturalIcon
- `FilterStyle` - None, Vintage, Cultural, Vibrant
- `AudioStyle` - None, Gamelan, Angklung, Kendang

**Resources:**
- `NFT` - Individual NFT with metadata, rarity, creator, and merge history
- `Collection` - User's NFT storage with query capabilities
- `Admin` - Contract admin functions for adding/removing partners
- `Partner` - Restricted minting capabilities for partners

**Structs:**
- `MomentMetadata` - Comprehensive metadata for each NFT moment
- `Location` - Geographic location data
- `PartnerInfo` - Partner configuration and restrictions

### Common Operations

**Initialize User Collection:**
```shell
flow transactions send cadence/transactions/setup_collection.cdc --network emulator --signer test-account
```

**Mint NFT:**
```shell
# Use the parameterized transaction
flow transactions send cadence/transactions/mint_nft.cdc \
  "Title" "Description" 0 "imageURL" "thumbURL" \
  "Sunny" "25°C" "lat" "lon" "Place" "City" "Country" \
  "100m" "10km/h" 0 0 0 0 "text" ["tag1","tag2"] 0 \
  --network emulator --signer test-account

# Or use the simple test transaction
flow transactions send cadence/transactions/mint_test_nft.cdc --network emulator --signer test-account
```

**Query NFTs:**
```shell
# Get all NFT IDs for an address
flow scripts execute cadence/scripts/get_nft_ids.cdc 0x179b6b1cb6755e31 --network emulator

# Get simple NFT info
flow scripts execute cadence/scripts/get_nft_simple.cdc 0x179b6b1cb6755e31 0 --network emulator

# Get collection statistics
flow scripts execute cadence/scripts/get_collection_stats.cdc 0x179b6b1cb6755e31 --network emulator
```

**Upgrade NFT:**
```shell
flow transactions send cadence/transactions/upgrade_nft.cdc 0 2 --network emulator --signer test-account
# Args: nftId (UInt64), newRarityRaw (UInt8)
```

**Merge NFTs:**
```shell
flow transactions send cadence/transactions/merge_nfts.cdc \
  0 1 "Merged Title" "Description" 0 "imageURL" "thumbURL" 2 \
  0 0 0 0 "text" ["tag1"] \
  --network emulator --signer test-account
# Merges NFT #0 and #1 into a new Epic NFT
```

**Admin: Add Partner:**
```shell
flow transactions send cadence/transactions/add_partner.cdc \
  0xPARTNER_ADDRESS "Partner Name" "Description" \
  [0,1,2] "lat" "lon" "Place" "City" "Country" \
  500.0 true false nil nil \
  --network emulator --signer test-account
# Args: address, name, desc, allowed categories, location, radius, qrEnabled, eventBased, startTime, endTime
```

**Query Partners:**
```shell
# Get all partners
flow scripts execute cadence/scripts/get_all_partners.cdc --network emulator

# Get specific partner info
flow scripts execute cadence/scripts/get_partner_info.cdc 0xPARTNER_ADDRESS --network emulator
```

### Storage Paths

- **Collection**: `/storage/NFTMomentCollection` (storage), `/public/NFTMomentCollection` (public)
- **Admin**: `/storage/NFTMomentAdmin`
- **Partner**: `/storage/NFTMomentPartner`

### Events

The contract emits the following events:
- `ContractInitialized()` - When contract is deployed
- `MomentMinted(id, owner, category, rarity)` - When NFT is minted
- `MomentUpgraded(id, newRarity)` - When NFT is upgraded
- `MomentsMerged(id1, id2, newId)` - When NFTs are merged
- `PartnerAdded(address, name)` - When partner is added
- `Deposit(id, to)` - When NFT is deposited to collection
- `Withdraw(id, from)` - When NFT is withdrawn from collection
- `AchievementUnlocked(address, achievement)` - For future achievement system

### Frontend Integration

To integrate NFTMoment with React frontend:

1. **Query User's NFTs:**
```tsx
import { useFlowQuery } from '@onflow/react-sdk';

const { data: nftIds } = useFlowQuery<number[]>({
  cadence: `
    import "NFTMoment"
    access(all) fun main(address: Address): [UInt64] {
      let account = getAccount(address)
      let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
        NFTMoment.CollectionPublicPath
      ) ?? panic("Collection not found")
      return collectionRef.getIDs()
    }
  `,
  args: (arg, t) => [arg(userAddress, t.Address)],
  query: { enabled: !!userAddress },
});
```

2. **Mint NFT:**
```tsx
import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';

const { mutateAsync, isPending, data: txId } = useFlowMutate();
const { transactionStatus } = useFlowTransactionStatus({ id: txId || '' });

const mintNFT = async (metadata) => {
  await mutateAsync({
    cadence: `
      import "NFTMoment"
      transaction(title: String, description: String, categoryRaw: UInt8) {
        prepare(acct: auth(Storage) &Account) {
          let recipient = acct.storage.borrow<&NFTMoment.Collection>(
            from: NFTMoment.CollectionStoragePath
          ) ?? panic("Collection not found")

          let metadata = NFTMoment.MomentMetadata(
            title: title,
            description: description,
            category: NFTMoment.Category(rawValue: categoryRaw)!,
            // ... other fields
          )

          NFTMoment.mintNFT(recipient: recipient, metadata: metadata, rarity: NFTMoment.Rarity.Common)
        }
      }
    `,
    args: (arg, t) => [
      arg(metadata.title, t.String),
      arg(metadata.description, t.String),
      arg(metadata.category, t.UInt8),
    ],
  });
};
```

### Testing

The contract has been tested and deployed on the emulator. Sample test case:

```shell
# Deploy
flow project deploy --network emulator

# Setup collection
flow transactions send cadence/transactions/setup_collection.cdc --network emulator --signer test-account

# Mint test NFT (Borobudur Temple example)
flow transactions send cadence/transactions/mint_test_nft.cdc --network emulator --signer test-account

# Verify (should return [0])
flow scripts execute cadence/scripts/get_nft_ids.cdc 0x179b6b1cb6755e31 --network emulator

# Get NFT details
flow scripts execute cadence/scripts/get_nft_simple.cdc 0x179b6b1cb6755e31 0 --network emulator
# Returns: "NFT #0: Borobudur Temple - A beautiful cultural moment at Borobudur, the largest Buddhist temple in the world (3, Rarity: 1)"
```

### Category and Rarity Raw Values

**Categories (UInt8):**
- 0: Landscape
- 1: Cultural
- 2: Event
- 3: Historical
- 4: Nature
- 5: Urban
- 6: Food
- 7: Art

**Rarity (UInt8):**
- 0: Common
- 1: Rare
- 2: Epic
- 3: Legendary

**Border/Sticker/Filter/Audio Styles:**
- Check contract enums for specific raw values (0 = None, then specific styles)

### Next Steps

The contract is ready for:
1. Frontend integration with React components
2. Location-based minting UI with geo-fencing
3. Cultural customization interface (borders, stickers, filters, audio)
4. Partner management dashboard
5. Achievement system implementation
6. Merge and upgrade UI
7. Collection gallery and display

### PRD Reference

Full product requirements are available in `/prd/Product Requirements Doc (DPR).html` including:
- Detailed user flows
- Location-based features
- Cultural elements (Javanese, batik, gamelan)
- Partner system specifications
- Achievement and reward mechanisms
