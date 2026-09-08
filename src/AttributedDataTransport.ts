export type DataReference = { path?: string; bytes: number; decodedBytes: number; sha256: string; decodedSha256: string }

export async function readGzip(url: URL, reference: DataReference): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(90_000) })
  if (!response.ok) throw new Error(`Research data could not be loaded (${response.status}).`)
  const bytes = await response.arrayBuffer()
  const transparentlyDecoded = response.headers.get('content-encoding')?.toLowerCase() === 'gzip'
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, '0')).join('')
  if (bytes.byteLength !== (transparentlyDecoded ? reference.decodedBytes : reference.bytes) || hash !== (transparentlyDecoded ? reference.decodedSha256 : reference.sha256)) throw new Error('Research data checksum differs from its published source receipt.')
  const decoded = transparentlyDecoded ? bytes : await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
  if (decoded.byteLength !== reference.decodedBytes) throw new Error('Research data size differs from its published receipt.')
  return JSON.parse(new TextDecoder().decode(decoded))
}
