import crypto from 'crypto';
import fs from 'fs';

/**
 * Generate SHA-256 hash from a file stream.
 * Handles files of any size efficiently without memory overflow using chunk streaming.
 * @param {string} filePath - Absolute or relative path to file
 * @returns {Promise<{ sha256: string, md5: string, fileSize: number }>}
 */
export const generateFileHashes = (filePath) => {
  return new Promise((resolve, reject) => {
    const sha256Hash = crypto.createHash('sha256');
    const md5Hash = crypto.createHash('md5');
    let fileSize = 0;

    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunk buffer

    stream.on('data', (chunk) => {
      fileSize += chunk.length;
      sha256Hash.update(chunk);
      md5Hash.update(chunk);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      resolve({
        sha256: sha256Hash.digest('hex'),
        md5: md5Hash.digest('hex'),
        fileSize
      });
    });
  });
};

/**
 * Generate SHA-256 from in-memory Buffer.
 * @param {Buffer} buffer 
 * @returns {string} SHA-256 hex string
 */
export const generateBufferSHA256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Base58 BTC string encoder for IPFS multihash compatibility.
 * @param {Buffer} buffer 
 * @returns {string} Base58 encoded string
 */
export const encodeBase58 = (buffer) => {
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let string = '';
  for (let k = 0; k < buffer.length && buffer[k] === 0; k++) {
    string += '1';
  }
  for (let q = digits.length - 1; q >= 0; q--) {
    string += BASE58_ALPHABET[digits[q]];
  }
  return string;
};

/**
 * Generate standard IPFS CID v0 (Qm...) from SHA-256 hex string.
 * Uses 0x1220 multihash prefix + Base58 encoding.
 * @param {string} sha256Hex 
 * @returns {string} IPFS CID v0 (e.g. Qm...)
 */
export const generateIpfsCidV0 = (sha256Hex) => {
  const hashBytes = Buffer.from(sha256Hex, 'hex');
  const multihash = Buffer.concat([Buffer.from([0x12, 0x20]), hashBytes]);
  return encodeBase58(multihash);
};

/**
 * Compare file SHA-256 with expected hash string.
 * @param {string} filePath 
 * @param {string} expectedHash 
 * @returns {Promise<{ matches: boolean, computedHash: string }>}
 */
export const verifySHA256 = async (filePath, expectedHash) => {
  const { sha256 } = await generateFileHashes(filePath);
  const matches = sha256.toLowerCase() === expectedHash.toLowerCase();
  return { matches, computedHash: sha256 };
};
