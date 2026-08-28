import { beforeEach, describe, expect, it, vi } from 'vitest'
import demoData from '../../atlas/src/data/demo/atlas.json'
import { atlasDatasetSchema } from '../../atlas/src/domain/schemas'
import {
  buildAtlasUrl,
  createDefaultAtlasNavigation,
  resolveAtlasLocation,
} from './AtlasNavigation'
import {
  buildDeploymentDataSourceAwareAtlasUrl,
  getDeploymentDataSourceOptions,
  getInitialSourceFallback,
  resolveDeploymentAtlasDataSource,
} from './AtlasDataSources'

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
      buildDeploymentDataSourceAwareAtlasUrl(
        upstreamUrl,
        'synthetic-framework',
        false,
      ),
    ).toBe('/Physics-Atlas-Web/atlas/physics/gr-qc?year=2026')
  })

  it('keeps data-source switches inside the Pages project path', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics/hep-th?year=2026',
        'inspire-hep-pilot',
        false,
      ),
    ).toBe(
      '/Physics-Atlas-Web/atlas/physics/hep-th?year=2026&source=inspire-hep-pilot',
    )
  })

  it('keeps a configured live API source inside the Pages project path', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics?year=2026',
        'live-api',
        true,
      ),
    ).toBe('/Physics-Atlas-Web/atlas/physics?year=2026')
  })

  it('does not double-prefix an already adapted URL', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/Physics-Atlas-Web/atlas/physics?year=2026',
        'synthetic-framework',
        false,
      ),
    ).toBe('/Physics-Atlas-Web/atlas/physics?year=2026')
  })

  it('uses live data by default and hides fixture sources in public builds', () => {
    expect(
      getDeploymentDataSourceOptions(true).map((source) => source.id),
    ).toEqual(['live-api'])
    expect(resolveDeploymentAtlasDataSource('', true, true)).toBe('live-api')
  })

  it('keeps explicit fixture routes available for reproducibility', () => {
    expect(
      resolveDeploymentAtlasDataSource(
        '?source=synthetic-framework',
        true,
        true,
      ),
    ).toBe('synthetic-framework')
    expect(
      resolveDeploymentAtlasDataSource(
        '?source=inspire-hep-pilot',
        true,
        true,
      ),
    ).toBe('inspire-hep-pilot')
  })

  it('serializes a production fallback so it cannot retry live mode', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics?year=2026',
        getInitialSourceFallback(false, 'live-api'),
        true,
      ),
    ).toBe(
      '/Physics-Atlas-Web/atlas/physics?year=2026&source=synthetic-framework',
    )
  })

  it('retains all internal sources when no public API is configured', () => {
    expect(
      getDeploymentDataSourceOptions(false).map((source) => source.id),
    ).toEqual(['synthetic-framework', 'inspire-hep-pilot', 'live-api'])
    expect(resolveDeploymentAtlasDataSource('', false, false)).toBe(
      'synthetic-framework',
    )
  })
})
