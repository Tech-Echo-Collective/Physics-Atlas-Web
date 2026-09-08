import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'
import type { MetricObservation } from '../../atlas/src/domain/models'
import { applyInstitutionMetadataCorrections, ntuMetadataCorrection } from '../../atlas/src/data/InstitutionMetadataCorrections'
import { StaticAtlasRepository } from '../../atlas/src/data/StaticAtlasRepository'
import { selectMajorInstitutionsForMap, buildInstitutionFeatureCollection } from '../../atlas/src/components/atlas/InstitutionLayer'

const root = new URL('../../public/data/arxiv-map-20260908/', import.meta.url)
const core = atlasDatasetSchema.parse(JSON.parse(gunzipSync(readFileSync(new URL('map.json.gz', root))).toString()))
const observations = JSON.parse(gunzipSync(readFileSync(new URL('2025-overview.json.gz', root))).toString()) as MetricObservation[]
const corrected = applyInstitutionMetadataCorrections(core.institutions, core.metadata.provenance.version)

describe('NTU authority metadata repair on the published catalog', () => {
  it('restores NTU at its campus using the existing attributed identity and unchanged activity value', () => {
    const activity = observations.filter((row) => row.entityType === 'institution' && row.metricId === 'research_activity_score')
    const singapore = corrected.filter((institution) => institution.countryId === 'country-sg')
    const points = buildInstitutionFeatureCollection(selectMajorInstitutionsForMap(singapore, activity), activity)
    const ntu = points.features.find((point) => point.properties.institutionId === ntuMetadataCorrection.institutionId)
    expect(ntu?.properties.name).toBe('Nanyang Technological University')
    expect(ntu?.properties.metricValue).toBe(18.553189)
    expect(ntu?.geometry.coordinates).toEqual([ntuMetadataCorrection.location.longitude, ntuMetadataCorrection.location.latitude])
    expect(points.features.some((point) => point.properties.name === 'National University of Singapore')).toBe(true)
    expect(corrected.filter((row) => row.id !== ntuMetadataCorrection.institutionId)).toEqual(core.institutions.filter((row) => row.id !== ntuMetadataCorrection.institutionId))
    expect(core.institutions.find((row) => row.id === ntuMetadataCorrection.institutionId)?.name).toBe('INSPIRE institution 911953')
    expect(applyInstitutionMetadataCorrections(corrected, core.metadata.provenance.version)).toEqual(corrected)
    expect(applyInstitutionMetadataCorrections(core.institutions, 'another-release')).toBe(core.institutions)
  })

  it('finds the same NTU institution by full name, acronym and Chinese name', async () => {
    const repo = new StaticAtlasRepository({ ...core, institutions: corrected, metricObservations: observations })
    for (const query of ['Nanyang Technological University', 'NTU', '南洋理工大学']) {
      const results = await repo.searchEntities(query)
      expect(results.some((result) => result.entityId === ntuMetadataCorrection.institutionId)).toBe(true)
    }
  })
})
