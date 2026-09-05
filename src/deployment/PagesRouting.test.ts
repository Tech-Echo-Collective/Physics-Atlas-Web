import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  getDeploymentInitialSourceFallback,
  resolveDeploymentAtlasDataSource,
} from './AtlasDataSources'

const dataset = atlasDatasetSchema.parse(demoData)

describe('GitHub Pages Atlas routing', () => {
  beforeEach(() => {
    vi.stubEnv('BASE_URL', '/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opens a direct field route at the custom-domain root', () => {
    const navigation = resolveAtlasLocation(
      {
        pathname: '/atlas/physics/hep-th',
        search: '?year=2026',
      },
      dataset,
    )

    expect(navigation.selectedDomainId).toBe('physics')
    expect(navigation.selectedFieldId).toBe('hep-th')
    expect(navigation.selectedYear).toBe(2026)
  })

  it('keeps generated navigation at the custom-domain root', () => {
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
    ).toBe('/atlas/physics/gr-qc?year=2026')
  })

  it('keeps data-source switches at the custom-domain root', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics/hep-th?year=2026',
        'inspire-hep-pilot',
        false,
      ),
    ).toBe('/atlas/physics/hep-th?year=2026&source=inspire-hep-pilot')
  })

  it('keeps a configured live API source at the custom-domain root', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics?year=2026',
        'live-api',
        true,
      ),
    ).toBe('/atlas/physics?year=2026')
  })

  it('does not double-prefix an already adapted URL', () => {
    expect(
      buildDeploymentDataSourceAwareAtlasUrl(
        '/atlas/physics?year=2026',
        'synthetic-framework',
        false,
      ),
    ).toBe('/atlas/physics?year=2026')
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

  it('keeps unavailable public live data unavailable instead of selecting a fixture', () => {
    expect(resolveDeploymentAtlasDataSource('', false, true)).toBe('live-api')
    expect(
      getDeploymentInitialSourceFallback(false, 'live-api', true),
    ).toBeNull()
    expect(
      getDeploymentInitialSourceFallback(true, 'live-api', true),
    ).toBeNull()
    expect(
      getDeploymentInitialSourceFallback(false, 'inspire-hep-pilot', true),
    ).toBeNull()
  })

  it('retains isolated development fallback behavior outside public deployments', () => {
    expect(
      getDeploymentInitialSourceFallback(false, 'live-api', false),
    ).toBe('synthetic-framework')
    expect(
      getDeploymentInitialSourceFallback(true, 'live-api', false),
    ).toBeNull()
  })

  it.each(['', 'not-an-api-url'])(
    'fails closed in production with unavailable API configuration %j',
    async (apiUrl) => {
      vi.resetModules()
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_ATLAS_API_URL', apiUrl)
      const deployment = await import('./AtlasDataSources')

      expect(deployment.atlasDataSourceOptions.map((source) => source.id)).toEqual([
        'live-api',
      ])
      expect(deployment.resolveAtlasDataSource('', false)).toBe('live-api')
      expect(deployment.getInitialSourceFallback(false, 'live-api')).toBeNull()
      expect(
        deployment.resolveAtlasDataSource('?source=synthetic-framework', false),
      ).toBe('synthetic-framework')
    },
  )

  it('preserves explicitly selected fixture routes when the public API is unavailable', () => {
    expect(
      resolveDeploymentAtlasDataSource('?source=inspire-hep-pilot', false, true),
    ).toBe('inspire-hep-pilot')
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
