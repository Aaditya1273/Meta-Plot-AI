# MetaArmy 🤖

**Your Autonomous DeFi Co-Pilot**

MetaArmy is a revolutionary dApp that transforms DeFi interaction from manual, friction-heavy processes into seamless, intent-driven automation. Built for the MetaMask Developer Hackathon, it showcases the power of Advanced Permissions (ERC-7715) and real-time blockchain indexing with Envio.

## 🎯 The Problem We Solve

- **UX Friction**: Users abandon DeFi due to endless transaction approvals and gas monitoring
- **Missed Opportunities**: Manual monitoring leads to suboptimal timing and lost yields  
- **Security vs Convenience**: Current solutions force users to choose between security and usability

## Our Solution: MetaArmy

MetaArmy introduces **Verifiable Intent-Driven Automation**:

1. **Natural Language Input**: "Keep $100 USDC liquid, invest the rest in Lido weekly when gas < 30 gwei"
2. **ZK-Verifiable Execution**: Every agent action is backed by a ZK-proof for trustless operations.
3. **Multi-Protocol Orchestrator**: Seamless routes across Aave, Uniswap, Lido, and Compound.
4. **Tokenized Economy**: Stake $MPA for zero-fee execution and access to premium agents.
5. **Real-Time Transparency**: Live dashboard powered by Envio shows all agent activities and ZK proofs.

## 🏗️ Architecture

### Frontend
- **Next.js 14** with TypeScript
- **RainbowKit** for wallet connection
- **Tailwind CSS** + **Framer Motion** for UI
- **Recharts** for data visualization

### Blockchain Integration
- **MetaMask Smart Accounts Kit** for Advanced Permissions (ERC-7715)
- **Wagmi** + **Viem** for Ethereum interactions
- **Sepolia Testnet** deployment

### Real-Time Data
- **Envio HyperSync** for sub-second blockchain indexing
- **GraphQL** API for efficient data queries
- Live activity feeds and portfolio tracking

### AI Engine
- Intent parsing from natural language to structured parameters
- Condition monitoring (gas prices, APY rates, market conditions)
- Agent-to-Agent (A2A) delegation capabilities

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/meta-plot-ai.git
cd meta-plot-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your WalletConnect Project ID and other config

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ENVIO_ENDPOINT=https://indexer.bigdevenergy.link/your-indexer/v1/graphql

# Optional: Enable AI-powered intent parsing
GEMINI_API_KEY=your_gemini_api_key
```

**Get Gemini API Key**: https://makersuite.google.com/app/apikey

## 🎮 Demo Flow

1. **Connect Wallet**: Use RainbowKit to connect MetaMask on Sepolia
2. **Set Intent**: Chat with AI: "Invest my extra USDC in Aave weekly"
3. **Review Permission**: See parsed intent and permission scope
4. **Grant Permission**: Single MetaMask signature
5. **Monitor Dashboard**: Watch your AI agent work autonomously

## 🏆 Hackathon Features

### Most Creative Use of Advanced Permissions ✨
- **Intent-to-Permission Translation**: Natural language → ERC-7715 permissions
- **A2A Delegation**: Master agents delegate to specialized sub-agents
- **Conditional Execution**: Gas-aware, yield-optimized automation
- **Granular Security**: Scoped permissions with automatic expiry

### Best Use of Envio 📊
- **Real-Time Activity Feed**: Sub-second updates on agent actions
- **Portfolio Analytics**: Live yield tracking and performance metrics
- **Condition Monitoring**: Gas prices, APY rates, market data
- **Historical Analysis**: Complete audit trail of all agent activities

### Technical Innovation 🔧
- **Hybrid AI Architecture**: Rule-based + LLM fallback for intent parsing
- **Smart Permission Management**: Hierarchical, revocable, time-bound
- **Gas Optimization**: Intelligent timing for cost-effective execution
- **Extensible Agent Framework**: Plugin architecture for new protocols

## 📱 Key Components

### Chat Interface
- Natural language intent input
- Real-time AI parsing and feedback
- Permission request generation
- Approval workflow integration

### Dashboard
- Portfolio performance visualization
- Active permissions management
- Real-time activity feed
- Agent status monitoring

### Smart Contracts
- `MetaArmy.sol`: Core permission and execution logic
- ERC-7715 integration for advanced permissions
- A2A delegation support
- Emergency controls and safety mechanisms

## 🔐 Security Features

- **Scoped Permissions**: Limited to specific protocols and amounts
- **Time-Bound Access**: Automatic expiry prevents indefinite access
- **Revocable Anytime**: Users maintain full control
- **Condition Validation**: Multi-layer checks before execution
- **Audit Trail**: Complete transparency via Envio indexing

## 🎯 Roadmap

### Phase 1: Core Features ✅
- Basic intent parsing
- ERC-7715 integration
- Aave automation
- Real-time dashboard

### Phase 2: Advanced AI 🚧
- LLM-powered intent understanding
- Multi-protocol optimization
- Risk assessment integration
- Predictive rebalancing

### Phase 3: Agent Economy 🔮
- Community agent marketplace
- Shared strategy templates
- Cross-user agent delegation
- Yield farming optimization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏅 Hackathon Submission

**MetaMask Developer Hackathon 2024**
- **Track**: Most Creative Use of Advanced Permissions
- **Bonus**: Best Use of Envio
- **Demo Video**: [Link to demo video]
- **Live Demo**: [Deployed application URL]

## 🔗 Links

- **Documentation**: [Detailed docs](docs/)
- **Smart Contracts**: [Verified on Sepolia](https://sepolia.etherscan.io)
- **Envio Indexer**: [GraphQL Playground](https://indexer.bigdevenergy.link)
- **Demo Video**: [YouTube/Loom link]

---

**Built with ❤️ for the MetaMask Developer Hackathon**

*Transforming DeFi from reactive to proactive, one intent at a time.*