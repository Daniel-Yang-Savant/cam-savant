export const PERIOP_COOKIE_NAME = 'periop_access'
export const PERIOP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
export const PERIOP_QR_GRANT_MAX_AGE_SECONDS = 10 * 60

const encoder = new TextEncoder()

/** The legacy access code is public to patients and must never be a signing key. */
export function getPeriopSigningSecret(): string | undefined {
  const secret = process.env.PERIOP_SIGNING_SECRET || process.env.ADMIN_SECRET
  // Also reject accidental reuse of the patient-visible code in deployment.
  return secret && secret !== process.env.PERIOP_ACCESS_TOKEN ? secret : undefined
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string): ArrayBuffer | null {
  try {
    const base64 = value
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(value.length / 4) * 4, '=')
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    return buffer
  } catch {
    return null
  }
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  if (!secret) throw new Error('Postoperative signing is not configured')
  const rootKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  // A dedicated derived key separates patient tokens from admin sessions even
  // when both use ADMIN_SECRET as their private root key.
  const derivedKey = await crypto.subtle.sign(
    'HMAC', rootKey, encoder.encode('cam-savant:periop-signing:v2')
  )
  return crypto.subtle.importKey(
    'raw', derivedKey, { name: 'HMAC', hash: 'SHA-256' }, false,
    ['sign', 'verify']
  )
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret)
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  return toBase64Url(new Uint8Array(signature))
}

async function verifyPayload(
  payload: string,
  encodedSignature: string,
  secret: string
): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(encodedSignature)) return false
  const signature = fromBase64Url(encodedSignature)
  if (!signature) return false

  const key = await getSigningKey(secret)
  return crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(payload)
  )
}

/**
 * Cookie 格式：v2.到期時間（Unix seconds）.HMAC-SHA256 簽章。
 * 金鑰只取自私有 PERIOP_SIGNING_SECRET 或 ADMIN_SECRET；舊版簽章不再有效。
 */
export async function createPeriopAccessCookie(
  secret: string,
  now = Date.now()
): Promise<string> {
  const expiresAt =
    Math.floor(now / 1000) + PERIOP_COOKIE_MAX_AGE_SECONDS
  const payload = `v2.${expiresAt}`
  return `${payload}.${await signPayload(`periop-cookie:${payload}`, secret)}`
}

export async function verifyPeriopAccessCookie(
  value: string | undefined,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret || value.length > 100) return false
  const match = /^v2\.([1-9]\d{0,15})\.([A-Za-z0-9_-]{43})$/.exec(value)
  if (!match) return false
  const [, expiry, encodedSignature] = match

  const expiresAt = Number(expiry)
  const currentTime = Math.floor(now / 1000)
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= currentTime ||
    expiresAt > currentTime + PERIOP_COOKIE_MAX_AGE_SECONDS
  ) {
    return false
  }

  return verifyPayload(`periop-cookie:v2.${expiry}`, encodedSignature, secret)
}

/**
 * 管理員產生的病患 QR 授權僅短暫有效，且簽章內容加入專用前綴，
 * 避免與 30 天存取 Cookie 互相替換使用。
 */
export async function createPeriopQrGrant(
  secret: string,
  now = Date.now()
): Promise<{ grant: string; expiresAt: number }> {
  const expiresAt =
    Math.floor(now / 1000) + PERIOP_QR_GRANT_MAX_AGE_SECONDS
  const payload = `periop-qr:v2.${expiresAt}`
  const signature = await signPayload(payload, secret)
  return {
    grant: `v2.${expiresAt}.${signature}`,
    expiresAt,
  }
}

export async function verifyPeriopQrGrant(
  value: string | null,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret || value.length > 100) return false
  const match = /^v2\.([1-9]\d{0,15})\.([A-Za-z0-9_-]{43})$/.exec(value)
  if (!match) return false
  const [, expiresAtValue, encodedSignature] = match

  const expiresAt = Number(expiresAtValue)
  const currentTime = Math.floor(now / 1000)
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= currentTime ||
    expiresAt > currentTime + PERIOP_QR_GRANT_MAX_AGE_SECONDS
  ) {
    return false
  }

  return verifyPayload(`periop-qr:v2.${expiresAtValue}`, encodedSignature, secret)
}
