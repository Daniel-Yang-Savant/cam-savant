import { Resolver } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import { BlockList, isIP, type TcpNetConnectOpts } from 'node:net'

const ipv4Blocked = new BlockList()
const ipv6Global = new BlockList()
const ipv6Blocked = new BlockList()

// IANA special-purpose address ranges and non-unicast destinations.
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) ipv4Blocked.addSubnet(address, prefix)

// Azure's virtual platform IP is routed internally despite its public address.
ipv4Blocked.addAddress('168.63.129.16')
ipv6Global.addSubnet('2000::', 3, 'ipv6')
for (const [address, prefix] of [
  ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20],
] as const) ipv6Blocked.addSubnet(address, prefix, 'ipv6')

function isPublicAddress(address: string, family: 4 | 6) {
  if (isIP(address) !== family) return false
  return family === 4
    ? !ipv4Blocked.check(address)
    : ipv6Global.check(address, 'ipv6') && !ipv6Blocked.check(address, 'ipv6')
}

async function resolvePublicAddresses(hostname: string, signal: AbortSignal) {
  const resolver = new Resolver()
  const cancel = () => resolver.cancel()
  const noRecord = (error: NodeJS.ErrnoException) => {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') return []
    throw error
  }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    const [ipv4, ipv6] = await Promise.all([
      resolver.resolve4(hostname).catch(noRecord),
      resolver.resolve6(hostname).catch(noRecord),
    ])
    const addresses = [
      ...ipv4.map((address) => ({ address, family: 4 as const })),
      ...ipv6.map((address) => ({ address, family: 6 as const })),
    ]
    if (!addresses.length) throw new Error('找不到外部網站的 DNS 位址。')
    if (addresses.some(({ address, family }) => !isPublicAddress(address, family))) {
      throw new Error('外部連結解析到非公開 IP 位址，未發送 HTTP 請求。')
    }
    return addresses
  } finally {
    signal.removeEventListener('abort', cancel)
    cancel()
    signal.throwIfAborted()
  }
}

/** Send one unauthenticated request to a DNS-validated public address. */
export async function requestPublicUrl(url: URL): Promise<{ response: Response; html?: string }> {
  const target = new URL(url)
  const host = target.hostname.replace(/\.$/u, '')
  if (
    !['http:', 'https:'].includes(target.protocol) || target.port || target.username || target.password ||
    !host.includes('.') || isIP(host) || /(?:^|\.)(?:localhost|local|internal|home\.arpa|onion)$/i.test(host)
  ) throw new Error('外部連結需使用標準 HTTP(S) 連接埠與公開網域。')

  const signal = AbortSignal.timeout(10_000)
  const addresses = await resolvePublicAddresses(host, signal)
  const transport = target.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions & Pick<TcpNetConnectOpts, 'autoSelectFamily'> = {
      signal,
      agent: false,
      rejectUnauthorized: true,
      autoSelectFamily: true,
      headers: { 'User-Agent': 'CAM-Savant-Link-Audit/1.0' },
      // Keep the original hostname for the Host header and TLS. Connect only
      // to the already validated addresses, without a second DNS lookup.
      lookup(_hostname, { all }, callback) {
        if (all) callback(null, addresses)
        else callback(null, addresses[0].address, addresses[0].family)
      },
    }
    const request = transport.get(target, options, (message) => {
      try {
        const headers = new Headers()
        for (let i = 0; i < message.rawHeaders.length; i += 2) {
          headers.append(message.rawHeaders[i], message.rawHeaders[i + 1])
        }
        resolve({ response: new Response(null, { status: message.statusCode, headers }) })
      } catch (error) {
        reject(error)
      } finally {
        message.destroy()
      }
    })
    request.on('error', reject)
    request.on('upgrade', (_message, socket) => {
      socket.destroy()
      reject(new Error('外部網站要求切換 HTTP 協定。'))
    })
  })
}
