import { AtlasExplorer } from '../atlas/src/components/atlas/AtlasExplorer'
import { PublicInformation } from './PublicInformation'
import { ObservedHeatmap } from './ObservedHeatmap'

export default function App() {
  if (new URLSearchParams(window.location.search).get('view') !== 'full-atlas' && window.location.pathname === '/') {
    return <ObservedHeatmap />
  }
  return (
    <>
      <AtlasExplorer />
      <PublicInformation />
    </>
  )
}
