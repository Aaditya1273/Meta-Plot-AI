🚀 Meta-Pilot AI: 5-Hour Sprint Plan
⏰ Time Breakdown (5 Hours Total)
Hour 1: Foundation & Setup (60 min)
0-15 min: Project scaffolding with MetaMask Smart Accounts Kit
15-30 min: Core dependencies & environment setup
30-45 min: Basic UI structure with modern design system
45-60 min: MetaMask connection & permission flow skeleton



Hour 2: Core Permissions Logic (60 min)
0-20 min: ERC-7715 permission creation & granting
20-40 min: Intent parser (rule-based, 5 common patterns)
40-60 min: Basic agent execution framework



Hour 3: Automation Engine (60 min)
0-25 min: Aave integration for yield farming
25-45 min: Gas price monitoring & conditional execution
45-60 min: Transaction batching with EIP-7702


Hour 4: Real-time Dashboard (60 min)
0-20 min: Envio setup & basic indexing
20-40 min: Live activity feed with GraphQL
40-60 min: Portfolio metrics & yield tracking


Hour 5: Polish & Demo (60 min)
0-20 min: A2A delegation (simplified version)
20-40 min: Demo video recording
40-60 min: Deployment & final testing


🛠 Tech Stack (Latest & Greatest)
Frontend Stack
{
  "framework": "Next.js 16 (App Router)",
  "styling": "Tailwind CSS + shadcn/ui + lenis",
  "animations": "Framer Motion + threeJS",
  "charts": "Recharts",
  "ai": "Vercel AI SDK",
  "wallet": "@metamask/smart-accounts-kit"
}
Backend & Blockchain
{
  "permissions": "ERC-7715 via Smart Accounts Kit",
  "indexing": "Envio HyperSync",
  "rpc": "Alchemy SDK",
  "defi": "Aave V3 SDK",
  "deployment": "Vercel + Sepolia"
}
📁 Project Structure
meta-pilot-ai/
├── app/
│   ├── page.tsx              # Landing + chat interface
│   ├── dashboard/page.tsx    # Live portfolio dashboard
│   └── layout.tsx           # Root layout with providers
├── components/
│   ├── ui/                  # shadcn components
│   ├── ChatInterface.tsx    # Intent input
│   ├── PermissionFlow.tsx   # ERC-7715 granting
│   ├── AgentStatus.tsx      # Live agent activity
│   └── YieldChart.tsx       # Portfolio visualization
├── lib/
│   ├── permissions.ts       # ERC-7715 logic
│   ├── intent-parser.ts     # Natural language → params
│   ├── agents/              # Automation engines
│   └── envio.ts            # GraphQL queries
├── envio/                   # Indexer configuration
└── public/                  # Assets & demo video
🎯 MVP Feature Set (5-Hour Scope)
Core Features (Must-Have)
Intent Input: Chat-style interface for natural language
Permission Granting: One-click ERC-7715 approval
Aave Integration: Auto-invest in highest yield pool
Gas Monitoring: Execute only when gas < 30 gwei
Live Dashboard: Real-time portfolio via Envio
Revoke Button: Instant permission cancellation
Advanced Features (If Time Permits)
A2A Delegation: Master → Sub-agent flow
Multiple Strategies: DCA + Yield + Stop-loss
Mobile Responsive: Perfect on all devices
🚀 Hour-by-Hour Implementation
Hour 1: Lightning Setup
# 1. Bootstrap with MetaMask CLI (5 min)
npx @metamask/smart-accounts-kit create meta-pilot-ai
cd meta-pilot-ai

# 2. Add modern dependencies (10 min)
npm install @shadcn/ui framer-motion recharts @vercel/ai
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card chart

# 3. Create core components (45 min)
# - Landing page with hero section
# - Chat interface mockup
# - MetaMask connect button
Hour 2: Permission Magic
// Key implementation: Intent → Permission
const parseIntent = (input: string) => {
  // Rule-based patterns for demo
  const patterns = {
    'invest.*aave': { action: 'yield', protocol: 'aave' },
    'gas.*under.*(\d+)': { gasLimit: '$1' },
    'keep.*(\d+).*liquid': { reserve: '$1' }
  }
  // Return structured permission params
}

const createPermission = async (params) => {
  return smartAccountsKit.createPermission({
    target: AAVE_V3_POOL,
    value: ethers.parseEther(params.amount),
    expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  })
}
Hour 3: Automation Core
// Agent execution engine
const executeStrategy = async (permission) => {
  // 1. Check gas price via Alchemy
  const gasPrice = await alchemy.core.getGasPrice()
  if (gasPrice > ethers.parseUnits('30', 'gwei')) return
  
  // 2. Query best Aave pool via SDK
  const pools = await aaveV3.getReservesList()
  const bestPool = pools.sort((a, b) => b.liquidityRate - a.liquidityRate)[0]
  
  // 3. Execute with EIP-7702 batching
  await smartAccount.executeBatch([
    { to: bestPool.aToken, data: depositCalldata }
  ])
}
Hour 4: Real-time Intelligence
# envio.yaml - Indexer config
name: meta-pilot-indexer
networks:
  - id: 11155111 # Sepolia
    start_block: latest
contracts:
  - name: AavePool
    events:
      - Deposit
      - Withdraw
// GraphQL queries for dashboard
const GET_USER_ACTIVITY = gql`
  query GetActivity($user: String!) {
    deposits(where: { user: $user }) {
      amount
      timestamp
      apy
    }
  }
`
Hour 5: Demo Polish
A2A Simplified: Master agent delegates 10% to "Gas Optimizer"
Video Recording: 3-minute screen capture with voiceover
Deployment: Vercel deploy + Sepolia contracts
🎨 Brand-Level Design System
Visual Identity
/* Brand colors */
:root {
  --primary: #6366f1;      /* Indigo - trust & innovation */
  --secondary: #10b981;    /* Emerald - growth & yield */
  --accent: #f59e0b;       /* Amber - alerts & actions */
  --dark: #0f172a;         /* Slate - premium feel */
}

/* Typography */
font-family: 'Inter', system-ui; /* Modern, readable */
Component Library
Glassmorphism cards for dashboard metrics
Animated progress bars for agent status
Gradient backgrounds for hero sections
Micro-interactions on all buttons/inputs
📊 Success Metrics & Demo Script
Demo Flow (3 minutes)
Problem Setup (30s): "DeFi is powerful but painful - watch this popup hell"
Solution Demo (90s):
Type: "Keep $100 USDC safe, invest extra in best Aave yield weekly"
One MetaMask signature
Agent starts working immediately
Innovation Showcase (60s):
Live Envio dashboard updates
A2A delegation in action
Gas optimization working
Key Metrics to Highlight
1 signature → unlimited automation
Sub-second dashboard updates via Envio
50-70% gas savings through batching
Revocable anytime for security
🏆 Competitive Edge
What Makes This Win
Product Vision: Solves MetaMask's retention crisis
Technical Depth: A2A + Envio + EIP-7702 integration
User Experience: Natural language → autonomous execution
Market Ready: Brand-level polish, not hackathon prototype
Scalable: Modular architecture for future expansion
Submission Strategy
GitHub: Clean README with architecture diagrams
Video: Professional editing with background music
Social: Daily progress threads tagging @MetaMaskDev
Feedback: Detailed PDF on Smart Accounts Kit improvements
⚡ Execution Commands


# Hour 1: Setup
git clone <template> && cd meta-pilot-ai
npm install && npm run dev

# Hour 2-4: Development sprints
# (Follow hourly breakdown above)

# Hour 5: Deploy
npm run build
vercel deploy --prod
envio deploy