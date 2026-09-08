import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'

const source = new URL('../../public/data/arxiv-20260908/', import.meta.url)
const map = new URL('../../public/data/arxiv-map-20260908/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('manifest.json', map), 'utf8'))
const coverage = JSON.parse(readFileSync(new URL('coverage.json', source), 'utf8'))
function read(reference: { path: string; sha256: string; decodedSha256: string; bytes: number; decodedBytes: number }) {
  const bytes = readFileSync(new URL(reference.path, map))
  const raw = gunzipSync(bytes)
  expect(bytes.length).toBe(reference.bytes)
  expect(raw.length).toBe(reference.decodedBytes)
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(reference.sha256)
  expect(createHash('sha256').update(raw).digest('hex')).toBe(reference.decodedSha256)
  return JSON.parse(raw.toString())
}

describe('map partitions', () => {
  it('boots all countries/institutions and years without a paper or researcher corpus', () => {
    const core = atlasDatasetSchema.parse(read(manifest.bootstrap))
    expect(core.institutions).toHaveLength(coverage.institutions)
    expect(core.fields).toHaveLength(51)
    expect(core.papers).toEqual([])
    expect(core.researchers).toEqual([])
    expect(core.metadata.availableYears).toEqual([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
    expect(manifest.bootstrap.bytes + manifest.years['2025'].overview.bytes).toBeLessThan(1_000_000)
    expect(manifest.totalMetricRecords).toBe(coverage.metrics)
    for (const [year, refs] of Object.entries(manifest.years)) {
      expect(Object.values(refs as Record<string, { records: number }>).reduce((sum, r) => sum + r.records, 0)).toBe(coverage.metricFiles[year].records)
    }
  })

  it('preserves every raw value, fitted normalization parameter and provenance in the overview and optics partitions', () => {
    const packed = JSON.parse(gunzipSync(readFileSync(new URL('atlas.json.gz', source))).toString())
    const compact = JSON.parse(gunzipSync(readFileSync(new URL(coverage.metricFiles['2025'].path, source))).toString())
    const fields = compact.columns.indexOf('fieldId')
    for (const field of [undefined, 'physics-optics']) {
      const expected = compact.rows.filter((values: unknown[]) => (values[fields] ?? undefined) === field).map((values: unknown[]) => {
        const row: Record<string, unknown> = Object.fromEntries(compact.columns.flatMap((key: string, i: number) => values[i] == null ? [] : [[key, values[i]]]))
        row.provenance = packed.provenance[row.provenance as number]
        row.normalizationParameters = packed.normalizationParameters[row.normalizationParameters as number]
        return row
      })
      expect(read(manifest.years['2025'][field ?? 'overview'])).toEqual(expected)
    }
  }, 30_000)
})
