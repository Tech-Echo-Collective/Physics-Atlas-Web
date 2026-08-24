import {
  atlasDataSourceOptions,
  buildDataSourceAwareAtlasUrl as buildUpstreamDataSourceAwareAtlasUrl,
  resolveAtlasDataSource,
  type AtlasDataSourceId,
  type AtlasDataSourceOption,
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

export type { AtlasDataSourceId, AtlasDataSourceOption }
export { atlasDataSourceOptions, resolveAtlasDataSource }

export function buildDataSourceAwareAtlasUrl(
  atlasUrl: string,
  sourceId: AtlasDataSourceId,
): string {
  return addDeploymentBase(
    buildUpstreamDataSourceAwareAtlasUrl(atlasUrl, sourceId),
  )
}
