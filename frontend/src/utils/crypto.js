import CryptoJS from 'crypto-js';

// Fallback key if not provided, though typically we'd derive this from a user password or store it securely
const DEFAULT_KEY = 'PJ_APP_CLIENT_SECRET_KEY_V1';

export const encryptContent = (content, key = DEFAULT_KEY) => {
  if (!content) return content;
  try {
    return CryptoJS.AES.encrypt(content, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt content');
  }
};

export const decryptContent = (ciphertext, key = DEFAULT_KEY) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    // If decryption fails (e.g. wrong key), we might return the ciphertext or a placeholder
    return '[Encrypted Content - Decryption Failed]';
  }
};
