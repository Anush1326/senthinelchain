import axios from 'axios';

// Placeholder Pinata/IPFS integration
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (file) => {
  try {
    // Placeholder mockup
    console.log("Uploading to IPFS...", file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          pinataURL: "ipfs://QmPlaceholderHashForDevelopment",
          ipfsHash: "QmPlaceholderHashForDevelopment"
        });
      }, 1500);
    });
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};

export const uploadJSONToIPFS = async (jsonData) => {
  try {
    console.log("Uploading metadata to IPFS...", jsonData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          pinataURL: "ipfs://QmPlaceholderMetaHashForDevelopment",
        });
      }, 1000);
    });
  } catch (error) {
    console.error("Error uploading metadata:", error);
    throw error;
  }
};

export const getFromIPFS = (hash) => {
  // Replace ipfs:// protocol with gateway URL
  if (hash.startsWith('ipfs://')) {
    return hash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
