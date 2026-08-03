import { PinataSDK } from "pinata-web3";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const pinataJwt = process.env.PINATA_JWT && process.env.PINATA_JWT !== 'your_pinata_jwt' ? process.env.PINATA_JWT : null;
const pinataApiKey = process.env.PINATA_API_KEY && process.env.PINATA_API_KEY !== 'your_pinata_api_key' ? process.env.PINATA_API_KEY : null;
const pinataSecretKey = process.env.PINATA_SECRET_KEY || process.env.PINATA_SECRET_API_KEY;
const pinataGateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

export const isPinataConfigured = () => {
  return !!(pinataJwt || (pinataApiKey && pinataSecretKey));
};

export const pinata = isPinataConfigured() 
  ? new PinataSDK({
      ...(pinataJwt ? { pinataJwt } : { pinataApiKey, pinataSecretApiKey: pinataSecretKey }),
      pinataGateway: pinataGateway.replace(/^https?:\/\//, '').replace(/\/ipfs\/?$/, '')
    })
  : null;

/**
 * Uploads a local file to Pinata IPFS
 * @param {string} filePath - Absolute path to local file
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string|null>} IPFS Hash (CID) or null if failed/not configured
 */
export const uploadFileToPinata = async (filePath, originalName = 'evidence.dat', mimeType = 'application/octet-stream') => {
  if (!pinata) {
    console.log('ℹ️ Pinata IPFS credentials not configured, skipping IPFS upload');
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    const fileObj = new File([blob], originalName, { type: mimeType });
    const response = await pinata.upload.file(fileObj);
    return response?.IpfsHash || response?.cid || null;
  } catch (error) {
    console.error('❌ Pinata IPFS Upload Error:', error.message);
    return null;
  }
};

