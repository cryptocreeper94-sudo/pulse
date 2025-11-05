import crypto from 'crypto';

/**
 * Wallet Encryption Utilities
 * 
 * Uses AES-256-GCM encryption to securely store Solana private keys in PostgreSQL.
 * The encryption key is stored as an environment variable (WALLET_ENCRYPTION_KEY).
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Derives a 32-byte encryption key from the master secret using PBKDF2
 */
function deriveKey(masterSecret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, 'sha256');
}

/**
 * Encrypts a private key using AES-256-GCM
 * Returns: {ciphertext}:{iv}:{authTag}:{salt} (all base64-encoded)
 */
export function encryptPrivateKey(privateKey: string): string {
  const masterSecret = process.env.WALLET_ENCRYPTION_KEY;
  
  if (!masterSecret) {
    throw new Error('WALLET_ENCRYPTION_KEY environment variable not set');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterSecret, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return [
    encrypted.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    salt.toString('base64')
  ].join(':');
}

/**
 * Decrypts a private key using AES-256-GCM
 * Input format: {ciphertext}:{iv}:{authTag}:{salt} (all base64-encoded)
 */
export function decryptPrivateKey(encryptedData: string): string {
  const masterSecret = process.env.WALLET_ENCRYPTION_KEY;
  
  if (!masterSecret) {
    throw new Error('WALLET_ENCRYPTION_KEY environment variable not set');
  }

  const [ciphertextB64, ivB64, authTagB64, saltB64] = encryptedData.split(':');
  
  if (!ciphertextB64 || !ivB64 || !authTagB64 || !saltB64) {
    throw new Error('Invalid encrypted data format');
  }

  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const salt = Buffer.from(saltB64, 'base64');
  
  const key = deriveKey(masterSecret, salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}
