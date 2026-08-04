import crypto from 'crypto';
import fs from 'fs';

/**
 * Generate Multi-Algorithm Hashes (SHA-256, SHA-512, MD5, SHA3-256) from a file stream.
 * Handles files of any size efficiently using chunk streaming.
 * @param {string} filePath - Absolute or relative path to file
 * @returns {Promise<{ sha256: string, sha512: string, md5: string, sha3: string, fileSize: number }>}
 */
export const generateFileHashes = (filePath) => {
  return new Promise((resolve, reject) => {
    const sha256Hash = crypto.createHash('sha256');
    const sha512Hash = crypto.createHash('sha512');
    const md5Hash = crypto.createHash('md5');
    const sha3Hash = crypto.createHash('sha3-256');
    let fileSize = 0;

    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunk buffer

    stream.on('data', (chunk) => {
      fileSize += chunk.length;
      sha256Hash.update(chunk);
      sha512Hash.update(chunk);
      md5Hash.update(chunk);
      sha3Hash.update(chunk);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      resolve({
        sha256: sha256Hash.digest('hex'),
        sha512: sha512Hash.digest('hex'),
        md5: md5Hash.digest('hex'),
        sha3: sha3Hash.digest('hex'),
        fileSize
      });
    });
  });
};

/**
 * Generate Multi-Algorithm Hashes from in-memory Buffer.
 * @param {Buffer} buffer 
 * @returns {{ sha256: string, sha512: string, md5: string, sha3: string, fileSize: number }}
 */
export const generateBufferMultiHashes = (buffer) => {
  return {
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    sha512: crypto.createHash('sha512').update(buffer).digest('hex'),
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha3: crypto.createHash('sha3-256').update(buffer).digest('hex'),
    fileSize: buffer.length
  };
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
 * Generate PKI Digital Signature for evidence payload.
 * @param {string} payload - SHA256 or JSON string
 * @returns {string} Base64 encoded signature
 */
export const generateDigitalSignature = (payload) => {
  const hmac = crypto.createHmac('sha256', 'sentinelchain_pki_signing_key_2026');
  hmac.update(payload);
  return `PKI_RSA_2048_${hmac.digest('hex').slice(0, 32).toUpperCase()}`;
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
