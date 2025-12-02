# TrustRouter.AI - Frontend

Next.js 14 application with real-time trust scores, USDC payments, and agent analytics.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **State**: Apollo Client (GraphQL)
- **Wallet**: RainbowKit + Wagmi
- **Blockchain**: Ethers.js v6

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Landing page with leaderboard
│   ├── history/                    # Task history
│   ├── dashboard/
│   │   └── analytics/              # Agent analytics dashboard
│   └── reputation/                 # Reputation management
├── components/
│   ├── PayButton.tsx               # Real USDC payment button
│   ├── TrustLeaderboard.tsx        # Live agent rankings
│   ├── StakeBadge.tsx              # Agent stake display
│   ├── DisputeModal.tsx            # Dispute submission
│   ├── ReviewModal.tsx             # Review submission
│   └── ui/                         # Shadcn UI components
├── lib/
│   ├── payments.ts                 # USDC payment utilities
│   ├── usdc.ts                     # USDC contract config
│   └── apollo-client.ts            # GraphQL client
└── hooks/
    └── useAuth.ts                  # Wallet authentication
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65
NEXT_PUBLIC_CHAIN_ID=43113
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 💰 Payment Integration

### Real USDC Transfers

The `PayButton` component handles real USDC payments:

```typescript
// Check balance
const balance = await usdcContract.balanceOf(address);

// Transfer USDC
const tx = await usdcContract.transfer(payeeAddress, "1000000"); // 1 USDC

// Wait for confirmation
const receipt = await tx.wait();
```

### Requirements

- MetaMask installed
- Testnet USDC in wallet
- Connected to Avalanche Fuji (Chain ID: 43113)

### Get Testnet USDC

https://faucet.circle.com/

## 🎨 Key Components

### TrustLeaderboard

Live rankings of top agents:
- Auto-refreshes every 10 seconds
- Medal emojis for top 3
- Displays reputation scores

```tsx
<TrustLeaderboard />
```

### PayButton

Real USDC payment button:
- Checks balance
- Initiates transfer
- Waits for confirmation
- Returns transaction hash

```tsx
<PayButton 
  agentId="agent-id"
  amount="1000000"
  endpoint="https://agent.example.com"
  onPaymentSuccess={(txHash) => console.log(txHash)}
/>
```

### StakeBadge

Displays agent stake amount:
- Color-coded by stake level
- Shows effective stake (after slashing)
- Shield icon

```tsx
<StakeBadge 
  stakedAmount="5000000000000000000"  // 5 AVAX
  slashedAmount="500000000000000000"   // 0.5 AVAX
  size="md"
/>
```

### DisputeModal

Dispute submission interface:
- Reason input
- Validator voting explanation
- Submission to backend

```tsx
<DisputeModal
  isOpen={true}
  onClose={() => {}}
  taskId="task-id"
  userAddress="0x..."
/>
```

## 🔌 GraphQL Queries

### Get Top Agents

```graphql
query GetTopAgents($limit: Int!) {
  getTopAgents(limit: $limit) {
    id
    serviceType
    reputationScore
    stakedAmount
    slashedAmount
  }
}
```

### Submit Review

```graphql
mutation SubmitFeedback(
  $agentId: String!
  $score: Int!
  $comment: String
  $paymentProof: String!
) {
  submitFeedback(
    agentId: $agentId
    score: $score
    comment: $comment
    paymentProof: $paymentProof
  ) {
    id
    score
  }
}
```

## 🎨 Styling

### TailwindCSS Configuration

Custom colors and utilities in `tailwind.config.ts`:

```typescript
colors: {
  teal: {
    500: '#14b8a6',
    600: '#0d9488'
  }
}
```

### Shadcn UI Components

Pre-built components in `components/ui/`:
- Button
- Card
- Dialog
- Badge
- Input
- Textarea

## 🔐 Authentication

### Wallet Connection

Using RainbowKit:

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

<ConnectButton />
```

### Auth Hook

```typescript
const { isAuthenticated, address } = useAuth();
```

## 📱 Responsive Design

All components are mobile-responsive:
- Breakpoints: sm, md, lg, xl
- Mobile-first approach
- Touch-friendly interactions

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🏗️ Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s

## 🐛 Common Issues

### "Insufficient USDC"

Get testnet USDC: https://faucet.circle.com/

### "Please install MetaMask"

Install MetaMask browser extension

### "Wrong network"

Switch to Avalanche Fuji in MetaMask

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [RainbowKit](https://www.rainbowkit.com/docs)
- [Ethers.js](https://docs.ethers.org/v6/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

---

Built with ❤️ for Avalanche Hackathon 2024
# tink
