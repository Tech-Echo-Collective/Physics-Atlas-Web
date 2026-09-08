import { useCallback, useEffect, useRef, useState } from 'react'
import { AtlasExplorer } from '../atlas/src/components/atlas/AtlasExplorer'
import { PublicInformation } from './PublicInformation'
import { loadAttributedMap, type AttributedMapRepository } from './AttributedMap'

function locationScope() {
  const query = new URLSearchParams(window.location.search)
  const year = Number(query.get('year') || 2025)
  const route = window.location.pathname.split('/').filter(Boolean)
  const physicsIndex = route.indexOf('physics')
  return { year: year >= 2018 && year <= 2026 ? year : 2025,
    fieldId: query.get('field') || (physicsIndex >= 0 ? route[physicsIndex + 1] : null) || null }
}

export default function App() {
  const [repository, setRepository] = useState<AttributedMapRepository>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [displayYear, setDisplayYear] = useState(2025)
  const requestedScope = useRef('')
  const requestSequence = useRef(0)
  const changeScope = useCallback((year: number, fieldId: string | null) => {
    const scopeKey = `${year}:${fieldId ?? 'overview'}`
    if (requestedScope.current === scopeKey) return
    requestedScope.current = scopeKey
    setDisplayYear(year)
    const sequence = ++requestSequence.current
    setLoading(true)
    setError(undefined)
    void loadAttributedMap(year, fieldId).then((next) => {
      if (sequence !== requestSequence.current) return
      setRepository(next)
      setLoading(false)
    }).catch((cause: unknown) => {
      if (sequence !== requestSequence.current) return
      setError(cause instanceof Error ? cause.message : 'Research data could not be loaded.')
      setLoading(false)
      requestedScope.current = ''
    })
  }, [])
  useEffect(() => {
    const scope = locationScope()
    changeScope(scope.year, scope.fieldId)
  }, [changeScope])
  return <>
    {repository && <AtlasExplorer repositoryOverride={repository} onObservationScopeChange={changeScope} />}
    {loading && <div role="status" style={{ position: 'fixed', zIndex: 50, top: 16, left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', color: '#d9e8f5', background: '#17232e', borderRadius: 8 }}>Loading verified arXiv research · {displayYear}…</div>}
    {error && <div role="alert" style={{ position: 'fixed', zIndex: 60, top: 16, left: 24, right: 24, padding: 20, background: '#341c23', color: 'white' }}>{error} <button onClick={() => { const scope = locationScope(); changeScope(scope.year, scope.fieldId) }}>Retry</button></div>}
    <PublicInformation />
  </>
}
