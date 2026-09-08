import type { AtlasDataset, AtlasSearchResult, MetricObservation } from '../atlas/src/domain/models'
import { StaticAtlasRepository } from '../atlas/src/data/StaticAtlasRepository'
import type { AtlasEntityScope, ScopedAtlasRepository } from '../atlas/src/data/ScopedAtlasRepository'
import type { InstitutionProfileData, ResearcherProfileData, ResearchGroupProfileData } from '../atlas/src/profiles/ProfileService'
import { readGzip, type DataReference } from './AttributedDataTransport'
import type { DetailCommand, DetailContext, DetailResponse } from './AttributedWorkerProtocol'

type MapManifest = { version: string; sourceVersion: string; bootstrap: DataReference; years: Record<string, Record<string, DataReference>> }
const releaseUrl = new URL('/data/arxiv-map-20260908/manifest.json', window.location.origin)
let bootstrap: Promise<{ manifest: MapManifest; core: AtlasDataset }> | undefined
const partitions = new Map<string, Promise<MetricObservation[]>>()
let worker: Worker | undefined
let sequence = 0
const pending = new Map<number, { resolve(value: unknown): void; reject(error: unknown): void; cleanup(): void }>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./AttributedAtlas.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<DetailResponse>) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      request.cleanup()
      if (event.data.error) request.reject(new Error(event.data.error))
      else request.resolve(event.data.result)
    }
    worker.onerror = () => {
      for (const request of pending.values()) { request.cleanup(); request.reject(new Error('Research details could not be loaded. Please retry.')) }
      pending.clear()
      worker?.terminate()
      worker = undefined
    }
  }
  return worker
}

function details<T>(year: number, command: DetailCommand, signal?: AbortSignal): Promise<T> {
  signal?.throwIfAborted()
  const target = getWorker()
  return new Promise<T>((resolve, reject) => {
    const id = ++sequence
    const cancel = () => { pending.delete(id); reject(signal?.reason) }
    signal?.addEventListener('abort', cancel, { once: true })
    pending.set(id, { resolve: (value) => resolve(value as T), reject, cleanup: () => signal?.removeEventListener('abort', cancel) })
    target.postMessage({ ...command, id, year })
  })
}

export class AttributedMapRepository extends StaticAtlasRepository implements ScopedAtlasRepository {
  readonly paperAuthorCounts: Record<string, number> = {}
  constructor(dataset: AtlasDataset, private readonly year: number) { super(dataset) }
  async loadEntityContext(scope: AtlasEntityScope, signal?: AbortSignal) {
    const context = await details<DetailContext>(this.year, { method: 'context', scope }, signal)
    for (const id of Object.keys(this.paperAuthorCounts)) delete this.paperAuthorCounts[id]
    Object.assign(this.paperAuthorCounts, context.paperAuthorCounts)
    return context
  }
  override searchEntities(query: string, limit = 8): Promise<AtlasSearchResult[]> { return details(this.year, { method: 'search', query, limit }) }
  override getInstitutionProfile(entityId: string): Promise<InstitutionProfileData | null> { return details(this.year, { method: 'institution', entityId }) }
  override getResearcherProfile(entityId: string): Promise<ResearcherProfileData | null> { return details(this.year, { method: 'researcher', entityId }) }
  override getResearchGroupProfile(entityId: string): Promise<ResearchGroupProfileData | null> { return details(this.year, { method: 'research-group', entityId }) }
}

async function loadBootstrap() {
  if (!bootstrap) {
    bootstrap = (async () => {
      const response = await fetch(releaseUrl)
      if (!response.ok) throw new Error('The map data receipt is unavailable.')
      const manifest = await response.json() as MapManifest
      if (manifest.version !== 'arxiv-map-partitions-v1') throw new Error('Unsupported map dataset version.')
      const core = await readGzip(new URL(manifest.bootstrap.path!, releaseUrl), manifest.bootstrap) as AtlasDataset
      if (core.metadata.provenance.version !== manifest.sourceVersion) throw new Error('Map data has inconsistent release lineage.')
      return { manifest, core }
    })()
    void bootstrap.catch(() => { bootstrap = undefined })
  }
  return bootstrap
}

export async function loadAttributedMap(year: number, fieldId: string | null): Promise<AttributedMapRepository> {
  const { manifest, core } = await loadBootstrap()
  const yearReferences = manifest.years[String(year)]
  if (!yearReferences) throw new Error(`No acquired research data is available for ${year}.`)
  const fieldKey = fieldId && core.fields.some((field) => field.id === fieldId) ? fieldId : 'overview'
  const keys = fieldKey === 'overview' ? ['overview'] : ['overview', fieldKey]
  const groups = await Promise.all(keys.map((key) => {
    const cacheKey = `${year}:${key}`
    const cached = partitions.get(cacheKey)
    if (cached) return cached
    const reference = yearReferences[key]
    if (!reference) return Promise.resolve([])
    const request = readGzip(new URL(reference.path!, releaseUrl), reference) as Promise<MetricObservation[]>
    if (partitions.size >= 6) partitions.delete(partitions.keys().next().value!)
    partitions.set(cacheKey, request)
    void request.catch(() => { if (partitions.get(cacheKey) === request) partitions.delete(cacheKey) })
    return request
  }))
  return new AttributedMapRepository({ ...core, metadata: { ...core.metadata, period: String(year) }, metricObservations: groups.flat() }, year)
}
