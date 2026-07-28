export const PERIOP_COOKIE_NAME = 'periop_access'
export const PERIOP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
export const PERIOP_QR_GRANT_MAX_AGE_SECONDS = 10 * 60

const encoder = new TextEncoder()

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
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
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
 * Cookie 格式：到期時間（Unix seconds）.HMAC-SHA256 簽章
 * 更換 PERIOP_ACCESS_TOKEN 會讓既有 Cookie 自動失效。
 */
export async function createPeriopAccessCookie(
  secret: string,
  now = Date.now()
): Promise<string> {
  const expiresAt =
    Math.floor(now / 1000) + PERIOP_COOKIE_MAX_AGE_SECONDS
  const payload = String(expiresAt)
  return `${payload}.${await signPayload(payload, secret)}`
}

export async function verifyPeriopAccessCookie(
  value: string | undefined,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret) return false

  const [payload, encodedSignature, ...extraParts] = value.split('.')
  if (!payload || !encodedSignature || extraParts.length > 0) return false

  const expiresAt = Number(payload)
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(now / 1000)
  ) {
    return false
  }

  return verifyPayload(payload, encodedSignature, secret)
}

/**
 * 管理員產生的病患 QR 授權僅短暫有效，且簽章內容加入 qr: 前綴，
 * 避免與 30 天存取 Cookie 互相替換使用。
 */
export async function createPeriopQrGrant(
  secret: string,
  now = Date.now()
): Promise<{ grant: string; expiresAt: number }> {
  const expiresAt =
    Math.floor(now / 1000) + PERIOP_QR_GRANT_MAX_AGE_SECONDS
  const payload = `qr:${expiresAt}`
  const signature = await signPayload(payload, secret)
  return {
    grant: `${expiresAt}.${signature}`,
    expiresAt,
  }
}

export async function verifyPeriopQrGrant(
  value: string | null,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret) return false

  const [expiresAtValue, encodedSignature, ...extraParts] = value.split('.')
  if (!expiresAtValue || !encodedSignature || extraParts.length > 0) {
    return false
  }

  const expiresAt = Number(expiresAtValue)
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(now / 1000)
  ) {
    return false
  }

  return verifyPayload(`qr:${expiresAt}`, encodedSignature, secret)
}
