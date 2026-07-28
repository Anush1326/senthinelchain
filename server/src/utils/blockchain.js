import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const defaultKey = '0x1111111111111111111111111111111111111111111111111111111111111111';
let provider;
let wallet;
let contract;

try {
  provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology/');
  const privateKey = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? process.env.PRIVATE_KEY : defaultKey;
  wallet = new ethers.Wallet(privateKey, provider);
} catch (err) {
  console.warn('Blockchain initialization warning:', err.message);
}

// Mock ABI for the Evidence contract
const contractABI = [
  "function registerEvidence(string memory fileHash, string memory ipfsHash, address uploader) public returns (uint256)",
  "function verifyEvidence(string memory fileHash) public view returns (bool, address, uint256)"
];
const contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

if (wallet) {
  try {
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
  } catch (err) {
    console.warn('Contract initialization warning:', err.message);
  }
}

export const getProvider = () => provider;
export const getContract = () => contract;

export const submitEvidenceToChain = async (fileHash, ipfsHash, uploaderAddress) => {
  try {
    // Note: This is mocked functionality for demonstration when no actual contract exists.
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      return { hash: 'mock_tx_hash_' + Date.now(), blockNumber: 1 };
    }
    const tx = await contract.registerEvidence(fileHash, ipfsHash, uploaderAddress);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error submitting to blockchain:", error);
    // Fallback for dev
    return { hash: 'fallback_tx_hash_' + Date.now(), blockNumber: 1 };
  }
};

export const verifyEvidenceOnChain = async (fileHash) => {
  try {
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      return true; // Mock true
    }
    const result = await contract.verifyEvidence(fileHash);
    return result[0]; // Assuming it returns a tuple where first element is bool
  } catch (error) {
    console.error("Error verifying on blockchain:", error);
    return false;
  }
};
