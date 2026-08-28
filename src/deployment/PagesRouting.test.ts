import { beforeEach, describe, expect, it, vi } from 'vitest'
import demoData from '../../atlas/src/data/demo/atlas.json'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'
import {
  buildAtlasUrl,
  createDefaultAtlasNavigation,
  resolveAtlasLocation,
} from './AtlasNavigation'
import { buildDataSourceAwareAtlasUrl } from './AtlasDataSources'

const dataset = atlasDatasetSchema.parse(demoData)

describe('GitHub Pages Atlas routing', () => {
  beforeEach(() => {
    vi.stubEnv('BASE_URL', '/Physics-Atlas-Web/')
  })

  it('opens a direct field route beneath the repository base path', () => {
    const navigation = resolveAtlasLocation(
      {
        pathname: '/Physics-Atlas-Web/atlas/physics/hep-th',
        search: '?year=2026',
      },
      dataset,
    )

    expect(navigation.selectedDomainId).toBe('physics')
    expect(navigation.selectedFieldId).toBe('hep-th')
    expect(navigation.selectedYear).toBe(2026)
  })

  it('keeps generated navigation inside the Pages project path', () => {
    const navigation = {
      ...createDefaultAtlasNavigation(dataset),
      selectedFieldId: 'gr-qc',
    }
    const upstreamUrl = buildAtlasUrl(navigation, dataset)

    expect(
      buildDataSourceAwareAtlasUrl(upstreamUrl, 'synthetic-framework'),
    ).toBe('/Physics-Atlas-Web/atlas/physics/gr-qc?year=2026')
  })

  it('keeps data-source switches inside the Pages project path', () => {
    expect(
      buildDataSourceAwareAtlasUrl(
        '/atlas/physics/hep-th?year=2026',
        'inspire-hep-pilot',
      ),
    ).toBe(
      '/Physics-Atlas-Web/atlas/physics/hep-th?year=2026&source=inspire-hep-pilot',
    )
  })

  it('keeps a configured live API source inside the Pages project path', () => {
    expect(
      buildDataSourceAwareAtlasUrl(
        '/atlas/physics?year=2026',
        'live-api',
      ),
    ).toBe('/Physics-Atlas-Web/atlas/physics?year=2026&source=live-api')
  })

  it('does not double-prefix an already adapted URL', () => {
    expect(
      buildDataSourceAwareAtlasUrl(
        '/Physics-Atlas-Web/atlas/physics?year=2026',
        'synthetic-framework',
      ),
    ).toBe('/Physics-Atlas-Web/atlas/physics?year=2026')
  })
})
