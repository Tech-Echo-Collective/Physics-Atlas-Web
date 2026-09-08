import type { AtlasEntityContext, AtlasEntityScope } from '../atlas/src/data/ScopedAtlasRepository'

export type DetailRequest = { id: number; year: number } & (
  { method: 'context'; scope: AtlasEntityScope } |
  { method: 'institution' | 'researcher' | 'research-group'; entityId: string } |
  { method: 'search'; query: string; limit: number }
)
export type DetailCommand = DetailRequest extends infer R ? R extends DetailRequest ? Omit<R, 'id' | 'year'> : never : never
export type DetailContext = AtlasEntityContext & { paperAuthorCounts: Record<string, number> }
export type DetailResponse = { id: number; result?: unknown; error?: string }
