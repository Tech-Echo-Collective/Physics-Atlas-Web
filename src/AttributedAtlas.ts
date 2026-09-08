import type { AtlasDataset, DataProvenance, MetricObservation } from '../atlas/src/domain/models'
import { atlasDatasetSchema } from '../atlas/src/domain/schemas'
import { ShardedAtlasRepository, uiShardsSchema } from '../atlas/src/data/ShardedAtlasRepository'

const releaseUrl = new URL('/data/arxiv-20260908/coverage.json', self.location.origin)
import { readGzip, type DataReference as Reference } from './AttributedDataTransport'
type Coverage = { coreBytes: number; coreDecodedBytes: number; coreSha256: string; coreDecodedSha256: string; metricFiles: Record<string, Reference> }
type Packed = { version: string; provenance: DataProvenance[]; normalizationParameters: MetricObservation['normalizationParameters'][]; dataset: Record<string, unknown> }
const base = (async () => {
  const response = await fetch(releaseUrl)
  if (!response.ok) throw new Error('The research coverage receipt is unavailable.')
  const coverage = await response.json() as Coverage
  const [packed, relations, institutionNames] = await Promise.all([
    readGzip(new URL('atlas.json.gz', releaseUrl), { bytes: coverage.coreBytes, decodedBytes: coverage.coreDecodedBytes, sha256: coverage.coreSha256, decodedSha256: coverage.coreDecodedSha256 }) as Promise<Packed>,
    fetch(new URL('relationships.json', releaseUrl)).then((r) => { if (!r.ok) throw new Error('Paper relationship index is unavailable.'); return r.json() as Promise<unknown> }),
    fetch(new URL('canonical-names.json', releaseUrl)).then((r) => { if (!r.ok) throw new Error('Institution names are unavailable.'); return r.json() as Promise<Record<string, string>> }),
  ])
  if (packed.version !== 'arxiv-atlas-packed-v1') throw new Error('Unsupported research dataset version.')
  for (const rows of Object.values(packed.dataset)) {
    if (!Array.isArray(rows)) continue
    for (const row of rows as Record<string, unknown>[]) {
      if (typeof row.provenance === 'number') row.provenance = packed.provenance[row.provenance]
    }
  }
  for (const institution of packed.dataset.institutions as { id: string; name: string; canonicalName: string; aliases: string[] }[]) {
    const name = institutionNames[institution.id]
    if (name && institution.aliases.includes(name)) {
      institution.aliases = [...new Set([...institution.aliases, institution.name])].filter((alias) => alias !== name)
      institution.name = name
      institution.canonicalName = name
    }
  }
  return { coverage, packed, relations: uiShardsSchema.parse(relations) }
})()

export async function loadAttributedAtlas(year: number): Promise<ShardedAtlasRepository> {
  const { coverage, packed, relations } = await base
  const reference = coverage.metricFiles[String(year)]
  if (!reference) throw new Error(`No acquired research data is available for ${year}.`)
  const compact = await readGzip(new URL(reference.path!, releaseUrl), reference) as { columns: string[]; rows: unknown[][] }
  const metricObservations = compact.rows.map((values) => {
    const row: Record<string, unknown> = Object.fromEntries(compact.columns.flatMap((key, i) => values[i] == null ? [] : [[key, values[i]]]))
    row.provenance = packed.provenance[row.provenance as number]
    row.normalizationParameters = packed.normalizationParameters[row.normalizationParameters as number]
    return row
  })
  const dataset = atlasDatasetSchema.parse({ ...packed.dataset, metadata: { ...(packed.dataset.metadata as AtlasDataset['metadata']), period: String(year) }, metricObservations })
  return ShardedAtlasRepository.create(dataset, relations, new URL('relationships.json', releaseUrl))
}

export async function loadAttributedCatalog(): Promise<AtlasDataset> {
  return (await base).packed.dataset as unknown as AtlasDataset
}
