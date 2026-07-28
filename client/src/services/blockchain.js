import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../utils/constants';

// Placeholder ABI
const ABI = [
  "function storeEvidence(string memory _hash, string memory _metadataUrl) public",
  "function verifyEvidence(string memory _hash) public view returns (bool, uint256, address)",
  "function getEvidenceCount() public view returns (uint256)"
];

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      return accounts[0];
    } catch (error) {
      console.error("User denied account access", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask");
  }
};

export const getContract = async (withSigner = false) => {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }
  throw new Error("Ethereum object not found");
};

export const submitEvidence = async (hash, metadataUrl) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.storeEvidence(hash, metadataUrl);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error submitting evidence to chain:", error);
    throw error;
  }
};

export const verifyEvidence = async (hash) => {
  try {
    const contract = await getContract();
    const result = await contract.verifyEvidence(hash);
    return result;
  } catch (error) {
    console.error("Error verifying evidence:", error);
    throw error;
  }
};

export const getEvidenceById = async (id) => {
  // Placeholder implementation
  return { id, status: 'mock' };
};
