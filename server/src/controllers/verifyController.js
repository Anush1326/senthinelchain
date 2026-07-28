import { Evidence } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { verifyEvidenceOnChain } from '../utils/blockchain.js';

export const verifyByHash = async (req, res, next) => {
  try {
    const { fileHash } = req.body;
    
    if (!fileHash) {
      return res.status(400).json(formatResponse(false, null, 'File hash is required'));
    }

    const evidence = await Evidence.findOne({ where: { fileHash } });

    if (!evidence) {
      return res.status(404).json(formatResponse(false, null, 'No matching evidence found for this hash'));
    }

    res.json(formatResponse(true, evidence, 'Evidence match found'));
  } catch (error) {
    next(error);
  }
};

export const verifyOnBlockchain = async (req, res, next) => {
  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      return res.status(400).json(formatResponse(false, null, 'File hash is required'));
    }

    const isOnChain = await verifyEvidenceOnChain(fileHash);

    res.json(formatResponse(true, { verified: isOnChain }, isOnChain ? 'Evidence is on blockchain' : 'Evidence not found on blockchain'));
  } catch (error) {
    next(error);
  }
};

export const checkTransactionStatus = async (req, res, next) => {
  try {
    // Implement transaction checking logic with ethers
    res.json(formatResponse(true, { status: 'mock_success' }));
  } catch (error) {
    next(error);
  }
};
