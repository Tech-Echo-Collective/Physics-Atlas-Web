import {
  AtlasDataSourceRequestGate,
  assessDataSourceObservations,
  atlasDataSourceOptions,
  buildDataSourceAwareAtlasUrl as buildUpstreamDataSourceAwareAtlasUrl,
  getInitialSourceFallback,
  hasRenderableCountryObservations,
  mergeMetricObservationsById,
  neutralLiveMapNotice,
  reconcileNavigationForDataSource,
  resolveAtlasDataSource,
  resolveMetricForDataSource,
  type AtlasDataSourceId,
  type AtlasDataSourceObservationAssessment,
  type AtlasDataSourceOption,
  type AtlasNavigationReconciliationOptions,
} from '../../atlas/src/data/AtlasDataSources'

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
  atlasDataSourceOptions,
  getInitialSourceFallback,
  hasRenderableCountryObservations,
  mergeMetricObservationsById,
  neutralLiveMapNotice,
  reconcileNavigationForDataSource,
  resolveAtlasDataSource,
  resolveMetricForDataSource,
}

export function buildDataSourceAwareAtlasUrl(
  atlasUrl: string,
  sourceId: AtlasDataSourceId,
): string {
  return addDeploymentBase(
    buildUpstreamDataSourceAwareAtlasUrl(atlasUrl, sourceId),
  )
}
