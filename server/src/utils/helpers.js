import crypto from 'crypto';
import fs from 'fs';

export const generateHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

export const formatResponse = (success, data = null, message = '') => {
  return {
    success,
    data,
    message
  };
};

export const paginate = (query, defaultPage = 1, defaultLimit = 10) => {
  const page = parseInt(query.page, 10) || defaultPage;
  const limit = parseInt(query.limit, 10) || defaultLimit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
