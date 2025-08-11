# 🚢 Battleship Game

A decentralized battleship game built with Next.js and Ethereum smart contracts, featuring on-chain coordination and off-chain gameplay.

## 🌐 Live Demo

**Play the game:** [https://somnia-battleship-on-chain.vercel.app/](https://somnia-battleship-on-chain.vercel.app/)

## 📋 Overview

BattleshipGame is a Web3-enabled battleship game that combines traditional gameplay with blockchain technology. Players join matches by paying an entry fee, play the game off-chain, and then confirm results on-chain for automatic prize distribution.

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Player A      │    │   Web App        │    │   Player B      │
│   (Browser)     │◄──►│   (Next.js)      │◄──►│   (Browser)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐            │
         │              │   Game Logic     │            │
         │              │   (Off-Chain)    │            │
         │              └──────────────────┘            │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────────┐
                    │     Somnia Testnet         │
                    │   Smart Contract           │
                    │  (0xaf14a7F58f9d85e8...) │
                    └─────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │   Automatic Payout         │
                    │   (Winner gets 2× fee)     │
                    └─────────────────────────────┘
```

### Smart Contract
- **Contract Address:** `0xaf14a7F58f9d85e81010A4C3ae4F8EA16847C259`
- **Network:** Somnia Testnet
- **Entry Fee:** 0.001 testnet tokens per player

### Key Features
- **Match Coordination:** Players join matches using unique match IDs
- **Result Verification:** Both players must confirm identical results for payout
- **Automatic Payouts:** Smart contract automatically distributes winnings
- **Gas Efficient:** Minimal on-chain operations
- **Ultra-Fast:** Sub-second transaction finality for seamless gameplay

### Data Flow
```
1. Players Join Match
   Player A ──[0.001 tokens]──► Smart Contract
   Player B ──[0.001 tokens]──► Smart Contract

2. Game Play (Off-Chain)
   Player A ◄──[Game State]──► Player B
   (via Web App)

3. Result Confirmation
   Player A ──[Winner + Scores]──► Smart Contract
   Player B ──[Winner + Scores]──► Smart Contract

4. Automatic Payout
   Smart Contract ──[2×0.001 tokens]──► Winner
```

## 🎮 How It Works

1. **Create/Join Match:** Players create or join a match by paying the entry fee
2. **Off-Chain Gameplay:** Play the traditional battleship game in the web interface
3. **Result Confirmation:** Both players submit identical game results
4. **Automatic Payout:** Smart contract verifies and pays the winner

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet
- Some testnet tokens for gas fees and entry fees

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd battleship-game
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Ethers.js** - Ethereum library for Web3 integration

### Smart Contract
- **Solidity 0.8.24** - Ethereum smart contract language
- **MIT License** - Open source

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## 📁 Project Structure

```
battleship-game/
├── app/                    # Next.js app directory
│   ├── components/        # Game-specific components
│   ├── hooks/            # Custom React hooks
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🎯 Core Components

- **Game Board** - Interactive battleship game interface
- **Match Creator** - Create new game matches
- **Match Joiner** - Join existing matches
- **Match Status** - View current match information
- **Wallet Connect** - Web3 wallet integration

## 🔒 Smart Contract Functions

### `joinMatch(bytes32 matchId)`
- Join a match by paying the entry fee
- First player becomes playerA, second becomes playerB

### `confirmResult(bytes32 matchId, address winner, uint8 scoreA, uint8 scoreB)`
- Submit game results for verification
- Both players must submit identical data for payout

### `getMatch(bytes32 matchId)`
- View match information and status

## 🎮 Game Rules

- Each match requires exactly 2 players
- Entry fee: 0.001 testnet tokens per player
- Both players must confirm identical results
- Winner receives the entire pot (2 × entry fee)
- Game is played off-chain for better UX
- **Ultra-fast gameplay** with sub-second transaction finality on Somnia

## 🚀 Deployment

The web application is deployed on Vercel and the smart contract is deployed on the **Somnia Testnet**. 

### About Somnia Network
Somnia is a high-performance, cost-efficient EVM-compatible Layer 1 blockchain capable of processing over **1,000,000 transactions per second (TPS)** with **sub-second finality**. This makes it ideal for real-time applications like games, providing:

- **Ultra-fast transactions** - Sub-second finality for seamless gameplay
- **High throughput** - Over 1M TPS for scalable gaming experiences  
- **Cost efficiency** - Lower gas fees compared to other networks
- **EVM compatibility** - Easy integration with existing Ethereum tooling

[Learn more about Somnia](https://docs.somnia.network/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Built with Next.js and Somnia blockchain
- UI components from Radix UI
- Styling with Tailwind CSS
- Web3 integration with Ethers.js
- Powered by Somnia's ultra-fast Layer 1 blockchain

---

**Ready to play?** Visit [https://somnia-battleship-on-chain.vercel.app/](https://somnia-battleship-on-chain.vercel.app/) and start your battleship adventure! 🚢⚓
