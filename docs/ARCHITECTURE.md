# System Architecture

## High-Level Architecture Overview
SentinelChain is composed of a frontend application (React/Next.js), a backend API (Node.js/Express), a PostgreSQL database for structured data, IPFS for decentralized file storage, and Smart Contracts deployed on the Polygon network for immutable evidence anchoring. AI services are integrated for content analysis.

## Component Diagram

```
[ Frontend (React/Next.js) ]
          |
    REST API / WebSockets
          |
[ Backend API (Node.js) ]
   /      |      \
  /       |       \
[PostgreSQL] [IPFS node] [AI Analysis Service]
                  |
         [Polygon Blockchain]
```

## Data Flow Diagrams

1.  **Evidence Upload:**
    User -> Frontend -> Backend API -> Save to IPFS -> Get IPFS Hash -> Save Metadata to PostgreSQL -> Trigger AI Analysis -> Return Success to User.
2.  **Blockchain Anchoring:**
    User (Wallet) -> Sign Transaction -> Polygon Network -> Transaction Hash -> Backend API -> Update PostgreSQL Record.

## Technology Justification
*   **Node.js/Express:** Fast, asynchronous, excellent for I/O bound tasks like file uploads.
*   **PostgreSQL:** Reliable relational database with JSONB support for flexible metadata storage.
*   **IPFS:** Decentralized storage ensures evidence files cannot be tampered with or deleted from a central server.
*   **Polygon Amoy (Testnet) / Mainnet:** Fast, low-cost Ethereum scaling solution perfect for high-frequency evidence anchoring.
*   **React/Next.js:** Robust frontend framework for dynamic user interfaces.

## Security Architecture
*   JWT-based authentication.
*   Role-Based Access Control (RBAC) enforced at the API level.
*   Files are hashed (SHA-256) client-side before upload to verify integrity.
*   All sensitive database fields (like passwords) are hashed using bcrypt.

## Deployment Architecture
*   **Frontend:** Vercel or AWS Amplify.
*   **Backend API:** Docker container deployed on AWS ECS or DigitalOcean App Platform.
*   **Database:** Managed PostgreSQL (e.g., AWS RDS).
*   **IPFS:** Pinata or Infura IPFS gateway.
