const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_key_change_in_prod_32chr';

/**
 * Encrypt a plain-text API key for DB storage
 */
const encryptApiKey = (plainKey) => {
  const encrypted = CryptoJS.AES.encrypt(plainKey, ENCRYPTION_KEY).toString();
  return encrypted;
};

/**
 * Decrypt an encrypted API key from DB
 */
const decryptApiKey = (encryptedKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch {
    return null;
  }
};

/**
 * Mask an API key for display (show only first 4 and last 4 chars)
 */
const maskApiKey = (key) => {
  if (!key || key.length < 10) return '••••••••';
  return `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`;
};

module.exports = { encryptApiKey, decryptApiKey, maskApiKey };
