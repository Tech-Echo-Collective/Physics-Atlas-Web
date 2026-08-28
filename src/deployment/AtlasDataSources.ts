import {
  AtlasDataSourceRequestGate,
  assessDataSourceObservations,
  atlasDataSourceOptions as upstreamAtlasDataSourceOptions,
  buildDataSourceAwareAtlasUrl as buildUpstreamDataSourceAwareAtlasUrl,
  getInitialSourceFallback,
  hasRenderableCountryObservations,
  mergeMetricObservationsById,
  neutralLiveMapNotice,
  reconcileNavigationForDataSource,
  resolveAtlasDataSource as resolveUpstreamAtlasDataSource,
  resolveMetricForDataSource,
  type AtlasDataSourceId,
  type AtlasDataSourceObservationAssessment,
  type AtlasDataSourceOption,
  type AtlasNavigationReconciliationOptions,
} from '../../atlas/src/data/AtlasDataSources'
import { normalizeAtlasApiBaseUrl } from '../../atlas/src/data/APIRepository'

const isConfiguredPublicLiveDeployment =
  normalizeAtlasApiBaseUrl(import.meta.env.VITE_ATLAS_API_URL) !== null

function getDeploymentBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '')
}

function addDeploymentBase(url: string): string {
  const deploymentBasePath = getDeploymentBasePath()
  if (!deploymentBasePath || deploymentBasePath === '/') {
    return url
  }

  if (url === deploymentBasePath || url.startsWith(`${deploymentBasePath}/`)) {
    return url
  }

  return `${deploymentBasePath}${url.startsWith('/') ? url : `/${url}`}`
}

export type {
  AtlasDataSourceId,
  AtlasDataSourceObservationAssessment,
  AtlasDataSourceOption,
  AtlasNavigationReconciliationOptions,
}
export {
  AtlasDataSourceRequestGate,
  assessDataSourceObservations,
  getInitialSourceFallback,
  hasRenderableCountryObservations,
  mergeMetricObservationsById,
  neutralLiveMapNotice,
  reconcileNavigationForDataSource,
  resolveMetricForDataSource,
}

export function getDeploymentDataSourceOptions(
  publicLiveDeployment: boolean,
): AtlasDataSourceOption[] {
  return publicLiveDeployment
    ? upstreamAtlasDataSourceOptions.filter((source) => source.id === 'live-api')
    : [...upstreamAtlasDataSourceOptions]
}

export const atlasDataSourceOptions = getDeploymentDataSourceOptions(
  isConfiguredPublicLiveDeployment,
)

export function resolveDeploymentAtlasDataSource(
  search: string,
  liveApiAvailable: boolean,
  publicLiveDeployment: boolean,
): AtlasDataSourceId {
  if (!publicLiveDeployment) {
    return resolveUpstreamAtlasDataSource(search, liveApiAvailable)
  }

  const requestedSource = new URLSearchParams(search).get('source')
  if (
    requestedSource === 'synthetic-framework' ||
    requestedSource === 'inspire-hep-pilot'
  ) {
    return requestedSource
  }

  return liveApiAvailable ? 'live-api' : 'synthetic-framework'
}

export function resolveAtlasDataSource(
  search: string,
  liveApiAvailable = false,
): AtlasDataSourceId {
  return resolveDeploymentAtlasDataSource(
    search,
    liveApiAvailable,
    isConfiguredPublicLiveDeployment,
  )
}

function replaceSourceParameter(
  atlasUrl: string,
  sourceId: AtlasDataSourceId | null,
): string {
  const [pathname, query = ''] = atlasUrl.split('?')
  const parameters = new URLSearchParams(query)
  if (sourceId) {
    parameters.set('source', sourceId)
  } else {
    parameters.delete('source')
  }
  const serialized = parameters.toString()
  return serialized ? `${pathname}?${serialized}` : pathname
}

export function buildDeploymentDataSourceAwareAtlasUrl(
  atlasUrl: string,
  sourceId: AtlasDataSourceId,
  publicLiveDeployment: boolean,
): string {
  if (!publicLiveDeployment) {
    return addDeploymentBase(
      buildUpstreamDataSourceAwareAtlasUrl(atlasUrl, sourceId),
    )
  }

  return addDeploymentBase(
    replaceSourceParameter(
      atlasUrl,
      sourceId === 'live-api' ? null : sourceId,
    ),
  )
}

export function buildDataSourceAwareAtlasUrl(
  atlasUrl: string,
  sourceId: AtlasDataSourceId,
): string {
  return buildDeploymentDataSourceAwareAtlasUrl(
    atlasUrl,
    sourceId,
    isConfiguredPublicLiveDeployment,
  )
}
