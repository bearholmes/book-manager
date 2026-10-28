import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import type { CoverTransfer } from '../../contracts/book-lookup';
import { MAX_COVER_SOURCE_BYTES } from '../../contracts/cover';

export function isPublicAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0)) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  // Only global unicast; excludes mapped IPv4, loopback, link-local and unique-local.
  return (
    isIP(address) === 6 && /^[23][0-9a-f]{3}:/i.test(address) && !/^2001:(db8|0):/i.test(address)
  );
}
export function imageMime(bytes: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return 'image/png';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
    return 'image/webp';
  return null;
}
export async function downloadCover(
  value: string,
  signal: AbortSignal,
): Promise<Extract<CoverTransfer, { state: 'succeeded' }>> {
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(15_000)]);
  let target = value;
  for (let redirects = 0; redirects <= 3; redirects++) {
    bounded.throwIfAborted();
    const url = new URL(target);
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      (url.port && !['80', '443'].includes(url.port))
    )
      throw new Error('지원하지 않는 표지 주소입니다.');
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = await lookup(hostname, { all: true });
    bounded.throwIfAborted();
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address)))
      throw new Error('공개 웹사이트의 표지만 가져올 수 있습니다.');
    const address = addresses[0];
    const result = await new Promise<{ location?: string; bytes?: Buffer }>((resolve, reject) => {
      const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
        url,
        {
          signal: bounded,
          // Passed through to net.connect; Bun HTTP typings omit this socket option.
          ...{ autoSelectFamily: false },
          headers: { Accept: 'image/jpeg,image/png,image/webp', 'User-Agent': 'ReadingDesk/3' },
          // Pin the vetted DNS result; the socket must not resolve the host a second time.
          lookup: (_host, _options, callback) => callback(null, address.address, address.family),
        },
        (response) => {
          const code = response.statusCode ?? 0;
          if ([301, 302, 303, 307, 308].includes(code) && response.headers.location) {
            response.destroy();
            resolve({ location: new URL(response.headers.location, url).href });
            return;
          }
          if (code !== 200) {
            response.destroy();
            reject(new Error('표지를 가져오지 못했습니다. 다른 후보나 파일 첨부를 사용해주세요.'));
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          response.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_COVER_SOURCE_BYTES)
              response.destroy(new Error('표지가 20MB를 초과합니다.'));
            else chunks.push(chunk);
          });
          response.on('error', reject);
          response.on('end', () => resolve({ bytes: Buffer.concat(chunks) }));
        },
      );
      req.on('error', reject);
      req.end();
    });
    if (result.location) {
      target = result.location;
      continue;
    }
    const bytes = result.bytes ?? Buffer.alloc(0);
    const mimeType = imageMime(bytes);
    if (!mimeType) throw new Error('JPG·PNG·WebP 표지 파일이 아닙니다.');
    return { state: 'succeeded', data: bytes.toString('base64'), mimeType };
  }
  throw new Error('표지 주소의 이동 횟수가 너무 많습니다.');
}
