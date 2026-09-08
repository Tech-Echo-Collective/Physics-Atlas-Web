import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'
import type { MetricObservation } from '../../atlas/src/domain/models'
import { buildCountryFeatureCollection, buildExplorationCanvasFeatureCollection } from '../../atlas/src/components/atlas/GeographicGeometryLayer'
import { buildSmallCountryLocators } from '../../atlas/src/components/atlas/SmallCountryLocators'
import { buildInstitutionFeatureCollection } from '../../atlas/src/components/atlas/InstitutionLayer'
import { getInstitutionsForGeographicView } from '../../atlas/src/components/atlas/GeographicEntityMapping'

const core = atlasDatasetSchema.parse(JSON.parse(gunzipSync(readFileSync(new URL('../../public/data/arxiv-map-20260908/map.json.gz', import.meta.url))).toString()))
const geography = buildCountryFeatureCollection(core.countries, core.geographicViews, [])

describe('small countries in the published research catalog', () => {
  it('retains a source outline for every research location, including the 11 omitted by 110m geometry', () => {
    const visibleIds = new Set(geography.features.map((item) => item.properties.countryId))
    expect(core.countries.filter((country) => !visibleIds.has(country.id))).toEqual([])
    expect(core.countries).toHaveLength(135)
  })

  it('provides Singapore with a country target, a real outline and its source-located NUS institution node', () => {
    const locators = buildSmallCountryLocators(geography, core.countries)
    expect(locators.find((item) => item.countryId === 'country-sg')?.name).toBe('Singapore')
    const canvas = buildExplorationCanvasFeatureCollection(geography, 'country-sg')
    expect(canvas.features).toHaveLength(1)
    expect(canvas.features[0].properties.sourceIsoNumerics).toEqual(['702'])
    const institutions = getInstitutionsForGeographicView(core.institutions, 'country-sg', core.geographicViews)
    expect(institutions.length).toBeGreaterThan(0)
    const observations = JSON.parse(gunzipSync(readFileSync(new URL('../../public/data/arxiv-map-20260908/2025-overview.json.gz', import.meta.url))).toString()) as MetricObservation[]
    const points = buildInstitutionFeatureCollection(institutions, observations.filter((row) => row.entityType === 'institution' && row.metricId === 'research_activity_score'))
    const nus = points.features.find((item) => item.properties.name === 'National University of Singapore')
    expect(nus).toBeDefined()
    expect(nus!.geometry.coordinates[0]).toBeGreaterThan(103.6)
    expect(nus!.geometry.coordinates[0]).toBeLessThan(104.1)
    expect(nus!.geometry.coordinates[1]).toBeGreaterThan(1.2)
    expect(nus!.geometry.coordinates[1]).toBeLessThan(1.5)
  })
})
