import { useState, useCallback } from 'react';
import { connectWallet as ethConnect, submitEvidence as ethSubmit, verifyEvidence as ethVerify } from '../services/blockchain';

export const useBlockchain = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await ethConnect();
      setAccount(address);
      return address;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const submitToChain = useCallback(async (hash, metadataUrl) => {
    try {
      const txHash = await ethSubmit(hash, metadataUrl);
      return { success: true, txHash };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const verifyOnChain = useCallback(async (hash) => {
    try {
      const result = await ethVerify(hash);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    account,
    isConnecting,
    error,
    connectWallet,
    submitToChain,
    verifyOnChain
  };
};
