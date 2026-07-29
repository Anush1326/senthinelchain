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
