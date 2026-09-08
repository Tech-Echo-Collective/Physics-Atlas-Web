import type { AtlasDataset } from '../atlas/src/domain/models'
import type { AtlasEntityScope } from '../atlas/src/data/ScopedAtlasRepository'
import { ProfileService } from '../atlas/src/profiles/ProfileService'
import { EntitySearchIndex } from '../atlas/src/search/EntitySearchIndex'
import { loadAttributedAtlas, loadAttributedCatalog } from './AttributedAtlas'
import type { DetailRequest, DetailContext, DetailResponse } from './AttributedWorkerProtocol'

let currentYear = 0
let repository: ReturnType<typeof loadAttributedAtlas> | undefined
let searchIndex: Promise<EntitySearchIndex> | undefined
const contexts = new Map<string, Promise<DetailContext>>()

function getRepository(year: number) {
  if (!repository || year !== currentYear) {
    currentYear = year
    repository = loadAttributedAtlas(year)
    void repository.catch(() => { if (year === currentYear) repository = undefined })
  }
  return repository
}

async function contextFor(year: number, scope: AtlasEntityScope): Promise<DetailContext> {
  const key = `${scope.entityType}:${scope.id}`
  const cached = contexts.get(key)
  if (cached) return cached
  const pending = (async () => {
    const repo = await getRepository(year)
    const context = await repo.loadEntityContext(scope)
    const core = await repo.loadDataset()
    const paperIds = new Set(context.authorships.map((row) => row.paperId))
    if (scope.entityType === 'paper') paperIds.add(scope.id)
    const researcherIds = new Set([
      ...context.authorships.map((row) => row.researcherId),
      ...context.affiliations.map((row) => row.researcherId),
      ...(scope.entityType === 'researcher' ? [scope.id] : []),
    ])
    return { ...context,
      papers: core.papers.filter((row) => paperIds.has(row.id)),
      researchers: core.researchers.filter((row) => researcherIds.has(row.id)),
      paperAuthorCounts: Object.fromEntries([...paperIds].map((id) => [id, repo.paperAuthorCounts[id]])),
    }
  })()
  if (contexts.size >= 2) contexts.delete(contexts.keys().next().value!)
  contexts.set(key, pending)
  void pending.catch(() => { if (contexts.get(key) === pending) contexts.delete(key) })
  return pending
}

async function dispatch(request: DetailRequest): Promise<unknown> {
  if (request.method === 'search') {
    searchIndex ??= loadAttributedCatalog().then((dataset) => new EntitySearchIndex(dataset, { includePapers: true }))
    return (await searchIndex).search(request.query, request.limit)
  }
  if (request.method === 'context') return contextFor(request.year, request.scope)
  const repo = await getRepository(request.year)
  const core = await repo.loadDataset()
  const rows = request.method === 'institution' ? core.institutions : request.method === 'researcher' ? core.researchers : core.researchGroups
  if (!rows.some((row) => row.id === request.entityId)) return null
  const context = await contextFor(request.year, { entityType: request.method, id: request.entityId })
  const service = new ProfileService({ ...core, ...context } as AtlasDataset)
  return request.method === 'institution' ? service.getInstitutionProfile(request.entityId)
    : request.method === 'researcher' ? service.getResearcherProfile(request.entityId)
      : service.getResearchGroupProfile(request.entityId)
}

self.onmessage = (event: MessageEvent<DetailRequest>) => {
  void dispatch(event.data).then((result) => self.postMessage({ id: event.data.id, result } satisfies DetailResponse),
    (error: unknown) => self.postMessage({ id: event.data.id, error: error instanceof Error ? error.message : String(error) } satisfies DetailResponse))
}
