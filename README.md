# SentinelChain – AI Powered Blockchain Evidence Chain

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Solidity Version](https://img.shields.io/badge/solidity-%5E0.8.20-lightgrey.svg)

## Overview
SentinelChain is an AI-powered blockchain evidence chain platform designed to securely store, verify, and analyze digital evidence. By leveraging blockchain technology (Polygon) for immutability and AI for intelligent analysis, SentinelChain provides a tamper-proof and robust system for legal, investigative, and compliance use cases.

## Architecture
```text
[ Client (React/Vite) ] <---> [ Server (Node.js/Express) ] <---> [ AI Service (Python/FastAPI) ]
                                      |
                                      +---> [ Database (PostgreSQL) ]
                                      |
                                      +---> [ IPFS (Pinata) ]
                                      |
                                      +---> [ Blockchain (Polygon Smart Contracts) ]
```

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Ethers.js/Web3.js
- **Backend**: Node.js, Express, PostgreSQL, Prisma/TypeORM
- **AI Service**: Python, FastAPI, OpenAI
- **Blockchain**: Solidity, Hardhat, Polygon
- **Storage**: IPFS (Pinata)

## Folder Structure
```text
sentinelchain/
├── client/          # React frontend application
├── server/          # Node.js backend API
├── contracts/       # Solidity smart contracts & Hardhat setup
├── .env.example     # Environment variables template
├── package.json     # Root package and workspaces setup
└── README.md        # Project documentation
```

## Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL
- MetaMask (or another Web3 wallet)
- Pinata account

## Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd sentinelchain
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` in the root (and subdirectories if needed) and configure the variables.
   ```bash
   cp .env.example .env
   ```

## Environment Variables
See `.env.example` for a complete list of required environment variables for the Server, Blockchain, IPFS/Pinata, AI Service, and Client.

## Running the Application

### Development Mode
Run both the client and server concurrently from the root directory:
```bash
npm run dev
```

### Production
Build the applications:
```bash
npm run build
```

## Smart Contract Deployment
1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Deploy to the network (e.g., Polygon Amoy):
   ```bash
   npx hardhat run scripts/deploy.js --network polygonAmoy
   ```

## API Endpoints Overview
- `POST /api/auth/*` - Authentication endpoints
- `GET /api/evidence` - Retrieve evidence records
- `POST /api/evidence` - Submit new evidence (triggers IPFS upload and blockchain transaction)
- `POST /api/evidence/analyze` - Trigger AI analysis on evidence

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License.
