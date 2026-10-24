export const ADMIN_COOKIE_NAME = 'admin_token'
export const ADMIN_SESSION_MAX_AGE_SECONDS = 6 * 60 * 60

const encoder = new TextEncoder()

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

async function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  )
}

/** The cookie is a scoped, expiring bearer token; it never contains the password. */
export async function createAdminSession(
  secret: string,
  now = Date.now()
): Promise<string> {
  if (!secret) throw new Error('Admin signing is not configured')
  const expiresAt = Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS
  const nonce = encode(crypto.getRandomValues(new Uint8Array(16)))
  const payload = `v1.${expiresAt}.${nonce}`
  const signature = await crypto.subtle.sign(
    'HMAC', await signingKey(secret), encoder.encode(`admin-session:${payload}`)
  )
  return `${payload}.${encode(new Uint8Array(signature))}`
}

export async function verifyAdminSession(
  value: string | undefined,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret || value.length > 150) return false
  const match = /^v1\.([1-9]\d{0,15})\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/.exec(value)
  if (!match) return false
  const [, expiry, nonce, encodedSignature] = match
  const expiresAt = Number(expiry)
  const currentTime = Math.floor(now / 1000)
  if (
    !Number.isSafeInteger(expiresAt) || expiresAt <= currentTime ||
    expiresAt > currentTime + ADMIN_SESSION_MAX_AGE_SECONDS
  ) return false

  const signature = Uint8Array.from(
    atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/') + '='),
    (character) => character.charCodeAt(0)
  )
  return crypto.subtle.verify(
    'HMAC', await signingKey(secret), signature,
    encoder.encode(`admin-session:v1.${expiry}.${nonce}`)
  )
}
