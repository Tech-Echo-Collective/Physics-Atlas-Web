import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'

const root = new URL('../../public/data/arxiv-20260908/', import.meta.url)
const receipt = JSON.parse(readFileSync(new URL('coverage.json', root), 'utf8'))
const packed = JSON.parse(gunzipSync(readFileSync(new URL('atlas.json.gz', root))).toString())
for (const rows of Object.values(packed.dataset)) {
  if (Array.isArray(rows)) for (const row of rows) row.provenance = packed.provenance[row.provenance]
}

describe('published attributed arXiv data', () => {
  it('covers all 51 native categories and all 459 acquisition partitions without invented author shares', () => {
    expect(new Set(packed.dataset.fields.map((field: { aliases: string[] }) => field.aliases[0])).size).toBe(51)
    expect(receipt.partitions).toHaveLength(459)
    expect(receipt.partitions.every((p: { error: unknown; received: number; total: number }) => !p.error && p.received <= p.total)).toBe(true)
    expect(receipt.counts.verifiedAuthors).toBeLessThanOrEqual(receipt.counts.sourceAuthors)
    expect(receipt.counts.attributedFractionalMass).toBeLessThanOrEqual(receipt.papers)
  })
  it('loads the actual published default year with valid institution references and five normalized dimensions', () => {
    const reference = receipt.metricFiles['2025']
    const bytes = readFileSync(new URL(reference.path, root))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(reference.sha256)
    const compressed = JSON.parse(gunzipSync(bytes).toString())
    const metricObservations = compressed.rows.map((values: unknown[]) => {
      const row: Record<string, unknown> = Object.fromEntries(compressed.columns.flatMap((key: string, i: number) => values[i] == null ? [] : [[key, values[i]]]))
      row.provenance = packed.provenance[row.provenance as number]
      row.normalizationParameters = packed.normalizationParameters[row.normalizationParameters as number]
      return row
    })
    const dataset = atlasDatasetSchema.parse({ ...packed.dataset, metricObservations })
    expect(dataset.papers).toHaveLength(receipt.papers)
    expect(new Set(dataset.metricObservations.map((row) => row.metricId)).size).toBe(5)
    expect(new Set(dataset.metricObservations.filter((row) => row.entityType === 'country' && row.metricId === 'research_activity_score' && row.fieldId).map((row) => row.fieldId)).size).toBe(51)
    expect(dataset.metricObservations.every((row) => row.rawValue !== undefined && row.normalizationMethod && Number.isFinite(row.value) && row.value >= 0 && row.value <= 100)).toBe(true)
  })
})
