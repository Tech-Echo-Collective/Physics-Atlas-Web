import { useCallback, useEffect, useRef, useState } from 'react'
import { AtlasExplorer } from '../atlas/src/components/atlas/AtlasExplorer'
import type { ShardedAtlasRepository } from '../atlas/src/data/ShardedAtlasRepository'
import { PublicInformation } from './PublicInformation'
import { loadAttributedAtlas } from './AttributedAtlas'

export default function App() {
  const [repository, setRepository] = useState<ShardedAtlasRepository>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [displayYear, setDisplayYear] = useState(2025)
  const requestedYear = useRef<number>(0)
  const requestSequence = useRef(0)
  const changeYear = useCallback((year: number) => {
    if (requestedYear.current === year) return
    requestedYear.current = year
    setDisplayYear(year)
    const sequence = ++requestSequence.current
    setLoading(true)
    setError(undefined)
    void loadAttributedAtlas(year).then((next) => {
      if (sequence !== requestSequence.current) return
      setRepository(next)
      setLoading(false)
    }).catch((cause: unknown) => {
      if (sequence !== requestSequence.current) return
      setError(cause instanceof Error ? cause.message : 'Research data could not be loaded.')
      setLoading(false)
      requestedYear.current = 0
    })
  }, [])
  useEffect(() => {
    const year = Number(new URLSearchParams(window.location.search).get('year') || 2025)
    changeYear(year >= 2018 && year <= 2026 ? year : 2025)
  }, [changeYear])
  return <>
    {repository && <AtlasExplorer repositoryOverride={repository} onYearChange={changeYear} />}
    {loading && <div role="status" style={{ position: 'fixed', zIndex: 50, top: 16, left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', color: '#d9e8f5', background: '#17232e', borderRadius: 8 }}>Loading verified arXiv research · {displayYear}…</div>}
    {error && <div role="alert" style={{ position: 'fixed', zIndex: 60, top: 16, left: 24, right: 24, padding: 20, background: '#341c23', color: 'white' }}>{error} <button onClick={() => changeYear(Number(new URLSearchParams(window.location.search).get('year') || 2025))}>Retry</button></div>}
    <PublicInformation />
  </>
}
