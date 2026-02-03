/**
 * AES-256-GCM Encryption for API Keys
 *
 * Uses a single master key stored in API_KEYS_ENCRYPTION_KEY env var.
 * All credentials are encrypted at rest in the database.
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits
const KEY_LENGTH = 32 // 256 bits

/**
 * Get the master encryption key from environment
 */
function getMasterKey(): Buffer {
  const key = process.env.API_KEYS_ENCRYPTION_KEY

  if (!key) {
    throw new Error(
      'API_KEYS_ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one with: openssl rand -base64 32'
    )
  }

  // Key should be base64 encoded 32 bytes
  const keyBuffer = Buffer.from(key, 'base64')

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `API_KEYS_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (base64 encoded). ` +
        `Current length: ${keyBuffer.length} bytes. Generate with: openssl rand -base64 32`
    )
  }

  return keyBuffer
}

/**
 * Encrypt plaintext using AES-256-GCM
 *
 * @param plaintext - The string to encrypt
 * @returns Base64-encoded ciphertext (format: iv:authTag:ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Combine IV + authTag + ciphertext and base64 encode
  const combined = Buffer.concat([iv, authTag, encrypted])
  return combined.toString('base64')
}

/**
 * Decrypt ciphertext using AES-256-GCM
 *
 * @param ciphertext - Base64-encoded ciphertext from encrypt()
 * @returns The original plaintext
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) {
    throw new Error('Ciphertext is empty')
  }

  const key = getMasterKey()
  const combined = Buffer.from(ciphertext, 'base64')

  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid ciphertext format')
  }

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH)
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Mask an API key for display (show last 4 characters)
 *
 * @param key - The full API key
 * @returns Masked key like "****abc1"
 */
export function maskKey(key: string): string {
  if (!key || key.length < 4) {
    return '****'
  }
  return '****' + key.slice(-4)
}

/**
 * Check if the encryption key is configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    getMasterKey()
    return true
  } catch {
    return false
  }
}

/**
 * Generate a new encryption key (for initial setup)
 * Returns a base64-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('base64')
}
