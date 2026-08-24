import {
  buildAtlasUrl as buildUpstreamAtlasUrl,
  createDefaultAtlasNavigation,
  getExplorationCountryId,
  resolveAtlasLocation as resolveUpstreamAtlasLocation,
  slugifyAtlasLabel,
  type AtlasNavigationState,
} from '../../atlas/src/navigation/AtlasNavigation'
import type { AtlasDataset } from '../../atlas/src/domain/models'

interface LocationLike {
  pathname: string
  search: string
}

function getDeploymentBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '')
}

function stripDeploymentBase(pathname: string): string {
  const deploymentBasePath = getDeploymentBasePath()
  if (!deploymentBasePath || deploymentBasePath === '/') {
    return pathname
  }

  if (pathname === deploymentBasePath) {
    return '/'
  }

  return pathname.startsWith(`${deploymentBasePath}/`)
    ? pathname.slice(deploymentBasePath.length)
    : pathname
}

export type { AtlasNavigationState }
export {
  createDefaultAtlasNavigation,
  getExplorationCountryId,
  slugifyAtlasLabel,
}

export function resolveAtlasLocation(
  location: LocationLike,
  dataset: AtlasDataset,
): AtlasNavigationState {
  return resolveUpstreamAtlasLocation(
    {
      pathname: stripDeploymentBase(location.pathname),
      search: location.search,
    },
    dataset,
  )
}

export function buildAtlasUrl(
  state: AtlasNavigationState,
  dataset: AtlasDataset,
): string {
  return buildUpstreamAtlasUrl(state, dataset)
}
