export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CHAIN_ID = 80002; // Polygon Amoy Testnet

export const EVIDENCE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FLAGGED: 'flagged',
  REJECTED: 'rejected'
};

export const EVIDENCE_TYPES = {
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  OTHER: 'other'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  EVIDENCE: {
    LIST: '/evidence',
    CREATE: '/evidence',
    GET: (id) => `/evidence/${id}`,
    VERIFY: '/evidence/verify'
  },
  ANALYTICS: '/analytics'
};
