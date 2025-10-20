# Flow Counter DApp Frontend

A React + TypeScript frontend for interacting with the Flow Counter smart contract.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI framework
- **TypeScript** - Type safety
- **@onflow/fcl** - Flow Client Library for blockchain interaction
- **@onflow/react-sdk** - React hooks for Flow (useAuth, useScript, useMutation)
- **Bun** - Package manager and runtime

## Getting Started

### Install Dependencies

```bash
bun install
```

### Start Development Server

```bash
bun dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth.tsx                  # Custom wallet connection component
│   │   ├── AuthWithConnect.tsx       # Example using built-in <Connect />
│   │   ├── Counter.tsx               # Counter with custom hooks
│   │   └── CounterWithButtons.tsx    # Counter using <TransactionButton />
│   ├── flow/
│   │   ├── scripts.ts                # Cadence scripts (read operations)
│   │   └── transactions.ts           # Cadence transactions (write operations)
│   ├── docs/@onflow/react-sdk/       # Official React SDK documentation
│   │   ├── README.mdx
│   │   ├── components.md
│   │   └── configuration.md
│   ├── App.tsx                       # Main app component
│   └── main.tsx                      # Entry point with FlowProvider
├── .env.example                      # Environment variables template
├── flow.json (in parent dir)         # Imported by FlowProvider for addresses
└── package.json
```

## Prerequisites

Before running the frontend, ensure:

1. **Flow Emulator is running**
   ```bash
   flow emulator --start
   ```

2. **Dev Wallet is running**
   ```bash
   flow dev-wallet
   ```

3. **Counter contract is deployed**
   ```bash
   flow project deploy --network=emulator
   ```

## How It Works

### React SDK Architecture
The app uses `@onflow/react-sdk` which provides React hooks for Flow blockchain interaction.

### Authentication
- The `Auth` component uses the `useAuth()` hook for wallet connection
- `logIn()` opens the Flow Dev Wallet (emulator) or supported wallets (testnet/mainnet)
- `currentUser` object provides user address and authentication state
- All components using `useAuth()` automatically re-render on auth state changes

### Reading Data (Scripts)
- Scripts are read-only operations that don't require authentication
- The `Counter` component uses `useScript()` hook with the `GET_COUNTER` Cadence code
- Scripts automatically fetch on mount and provide `refetch()` function
- Returns `data`, `isLoading`, and `error` states

### Writing Data (Transactions)
- Transactions modify blockchain state and require wallet authentication
- The `Counter` component uses `useMutation()` hook with Cadence transaction code
- Call `mutation.mutate()` to execute the transaction
- Provides `isLoading`, `onSuccess`, and `onError` callbacks
- Example pattern:
  ```tsx
  const mutation = useMutation({
    cadence: INCREMENT_COUNTER,
    limit: 50,
    onSuccess: () => refetch(),
    onError: (error) => console.error(error)
  });
  ```

## Network Configuration

The app is configured for the Flow emulator by default. To switch networks:

1. Update `src/flow/config.ts` with the appropriate network settings
2. Ensure your contract is deployed to the target network
3. Update the contract address in the FCL config

## Development Notes

### React SDK Hooks

**useFlowCurrentUser()**
- Access current user authentication state
- Returns: `{ user, authenticate, unauthenticate }`
- `user` object has `addr`, `loggedIn`, etc.
- Call `authenticate()` to login, `unauthenticate()` to logout
- Automatically re-renders components on auth state changes

**useFlowQuery<T>(options)**
- Execute read-only Cadence scripts
- Options: `{ cadence: string, args: (arg, t) => [...] }`
- Returns: `{ data: T, isLoading, error, refetch }`
- Automatically fetches on mount

**For Transactions:**
- Use `fcl.mutate()` directly for programmatic transactions
- Or use `<TransactionButton />` component for built-in UI
- Pattern: `await fcl.mutate({ cadence, args, limit })`
- Wait for sealing: `await fcl.tx(txId).onceSealed()`

### Best Practices

- Always wrap app with `<FlowProvider>` in main.tsx
- Pass both `config` and `flowJson` to FlowProvider for automatic address resolution
- Use TypeScript generics with hooks for type safety: `useScript<number>(...)`
- Handle loading states to improve UX
- Use `onSuccess` callbacks to refetch data after mutations
- All transaction results are logged to the console
- The UI updates automatically after successful transactions using refetch

### Two Approaches for Building UI

**Approach 1: Custom Components with Hooks** (More Control)
- Use `useFlowCurrentUser()`, `useFlowQuery()` hooks + `fcl.mutate()` for transactions
- Build your own UI components
- Full control over styling and behavior
- Example: `Auth.tsx`, `Counter.tsx`

**Approach 2: Built-in Components** (Less Code)
- Use `<Connect />`, `<TransactionButton />`, `<TransactionDialog />`
- Pre-built, production-ready components
- Automatic loading states and error handling
- Customizable via props and theming
- Example: `AuthWithConnect.tsx`, `CounterWithButtons.tsx`

**Which to choose?**
- Use built-in components for rapid prototyping and standard UI patterns
- Use custom hooks when you need full control over UI/UX
- Mix both approaches in the same app as needed

### FlowProvider Configuration

The `FlowProvider` in `main.tsx` is configured with:

```tsx
<FlowProvider
  config={{
    accessNodeUrl: 'http://localhost:8888',              // Emulator access node
    flowNetwork: 'emulator',                              // Network: emulator, testnet, mainnet
    appDetailTitle: 'Flow Counter DApp',                  // Your dApp name
    appDetailIcon: '...',                                 // Icon for wallet display
    appDetailDescription: '...',                          // Short description
    appDetailUrl: 'http://localhost:5173',                // Your app URL
    discoveryWallet: 'http://localhost:8701/fcl/authn',   // REQUIRED for authentication
  }}
  flowJson={flowJSON}  // Imports ../flow.json for contract addresses
  darkMode={false}     // Control theme (parent app manages)
>
```

**Benefits of passing `flowJson`:**
- Contract addresses automatically resolved from flow.json
- No need to hardcode `0xCounter` addresses in config
- Cadence imports like `from 0xCounter` work automatically
- Single source of truth for contract addresses across CLI and frontend
