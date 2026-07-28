# Setup Guide

## Prerequisites
*   Node.js (v18.x or higher)
*   npm (v9.x or higher) or yarn
*   PostgreSQL (v13.x or higher)
*   Git

## Step-by-Step Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd sairam
    ```

2.  **Install dependencies:**
    For the backend:
    ```bash
    cd backend
    npm install
    ```
    For the frontend:
    ```bash
    cd ../frontend
    npm install
    ```

## Environment Configuration
Create a `.env` file in the backend directory based on `.env.example`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sentinelchain
JWT_SECRET=your_super_secret_key
IPFS_GATEWAY=https://ipfs.io/ipfs/
AI_SERVICE_API_KEY=your_ai_api_key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

## Database Setup
Follow the instructions in `database/README.md` to create the schema and seed the database.

## Running Each Service

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

## Troubleshooting Common Issues
*   **Database Connection Error:** Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.
*   **IPFS Upload Fails:** Check your IPFS provider API keys or ensure your local IPFS node is running.
