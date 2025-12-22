import crypto from 'crypto';

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
function deriveKey(masterSecret, salt) {
  return crypto.pbkdf2Sync(masterSecret, salt, 1e5, 32, "sha256");
}
function encryptPrivateKey(privateKey) {
  const masterSecret = process.env.WALLET_ENCRYPTION_KEY;
  if (!masterSecret) {
    throw new Error("WALLET_ENCRYPTION_KEY environment variable not set");
  }
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterSecret, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return [
    encrypted.toString("base64"),
    iv.toString("base64"),
    authTag.toString("base64"),
    salt.toString("base64")
  ].join(":");
}
function decryptPrivateKey(encryptedData) {
  const masterSecret = process.env.WALLET_ENCRYPTION_KEY;
  if (!masterSecret) {
    throw new Error("WALLET_ENCRYPTION_KEY environment variable not set");
  }
  const [ciphertextB64, ivB64, authTagB64, saltB64] = encryptedData.split(":");
  if (!ciphertextB64 || !ivB64 || !authTagB64 || !saltB64) {
    throw new Error("Invalid encrypted data format");
  }
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const salt = Buffer.from(saltB64, "base64");
  const key = deriveKey(masterSecret, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

export { decryptPrivateKey, encryptPrivateKey };
//# sourceMappingURL=7ba97ccc-9ed6-4574-a3a7-ac295d217166.mjs.map
