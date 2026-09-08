import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { WorldMap } from '../atlas/src/components/atlas/WorldMap'
import { countrySchema, geographicViewSchema, institutionSchema } from '../atlas/src/domain/schemas'
import type { MetricObservation } from '../atlas/src/domain/models'
import './observed-heatmap.css'

const dataUrl = '/data/observed-activity-20260908.json'
const quantities = z.record(z.string(), z.number().finite().nonnegative())
const previewSchema = z.object({
  version: z.string(), generatedAt: z.string(), status: z.literal('preview'),
  scope: z.string(), method: z.string(), unit: z.string(),
  countries: z.array(countrySchema), geographicViews: z.array(geographicViewSchema),
  institutions: z.array(institutionSchema),
  years: z.array(z.object({ year: z.number().int(), sourceRecords: z.number().int(),
    allocatedMass: z.number().nonnegative(), unknownMass: z.number().nonnegative(),
    coverage: z.number().min(0).max(1), countries: quantities, institutions: quantities,
  })).min(1),
})
type Preview = z.infer<typeof previewSchema>
const number = (value: number) => value > 0 && value < 0.01 ? '<0.01' : value.toLocaleString('en', { maximumFractionDigits: 2 })

function displayCountryValues(data: Preview, values: Record<string, number>) {
  const grouped = { ...values }
  for (const view of data.geographicViews) {
    const available = view.locationCountryIds.filter(id => values[id] !== undefined)
    if (available.length) grouped[view.countryId] = available.reduce((sum, id) => sum + values[id], 0)
    for (const id of view.locationCountryIds) if (id !== view.countryId) delete grouped[id]
  }
  return grouped
}

export function ObservedHeatmap() {
  const [data, setData] = useState<Preview | null>(null)
  const [error, setError] = useState('')
  const [year, setYear] = useState(() => Number(new URLSearchParams(location.search).get('year')) || 2023)
  const [countryId, setCountryId] = useState<string | null>(() => new URLSearchParams(location.search).get('country'))
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [resetToken, setResetToken] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch(dataUrl, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('The observed dataset could not be loaded.')
      return response.json()
    }).then(value => {
      const parsed = previewSchema.parse(value)
      setData(parsed)
      setYear(current => parsed.years.some(item => item.year === current) ? current : parsed.years.at(-1)!.year)
      setCountryId(current => parsed.countries.some(item => item.id === current) ? current : null)
    }).catch(reason => { if (!controller.signal.aborted) setError(String(reason)) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (!data) return
    const url = new URL(location.href)
    url.searchParams.set('year', String(year))
    if (countryId) url.searchParams.set('country', countryId)
    else url.searchParams.delete('country')
    history.replaceState(null, '', url)
  }, [data, year, countryId])

  const view = useMemo(() => {
    if (!data) return null
    const current = data.years.find(item => item.year === year) ?? data.years.at(-1)!
    const countries = displayCountryValues(data, current.countries)
    const countryMaximum = Math.max(...data.years.flatMap(item => Object.values(displayCountryValues(data, item.countries))))
    const institutionMaximum = Math.max(...data.years.flatMap(item => Object.values(item.institutions)))
    const observations = (values: Record<string, number>, entityType: 'country' | 'institution', maximum: number): MetricObservation[] =>
      Object.entries(values).filter(([, value]) => value > 0).map(([entityId, value]) => ({
        id: `preview-${year}-${entityId}`, entityId, entityType, metricId: 'observed_recorded_activity',
        period: String(year), value: 100 * Math.log1p(value) / Math.log1p(maximum),
        rawValue: value, rawUnit: data.unit, source: 'INSPIRE observed records',
        algorithmVersion: 'observed-fractional-records-v1', calculationVersion: data.version,
        provenance: { source: data.scope, sourceType: 'derived', status: 'unverified', version: data.version },
      }))
    const countryIds = data.geographicViews.find(item => item.countryId === countryId)?.locationCountryIds ?? [countryId]
    const institutions = data.institutions.filter(item => current.institutions[item.id] > 0 && (!countryId || countryIds.includes(item.countryId)))
    return { current, countries, institutions,
      countryObservations: observations(countries, 'country', countryMaximum),
      institutionObservations: observations(current.institutions, 'institution', institutionMaximum),
      country: data.countries.find(item => item.id === countryId),
      institution: data.institutions.find(item => item.id === institutionId),
    }
  }, [data, year, countryId, institutionId])
  const reset = () => { setCountryId(null); setInstitutionId(null); setSearch(''); setResetToken(value => value + 1) }
  const selectCountry = (id: string) => { setCountryId(id); setInstitutionId(null); setSearch('') }
  const selectInstitution = (id: string) => {
    const institution = data?.institutions.find(item => item.id === id)
    if (!institution) return
    const country = data?.geographicViews.find(item => item.locationCountryIds.includes(institution.countryId))?.countryId ?? institution.countryId
    setCountryId(country); setInstitutionId(id)
  }
  if (!data || !view) return <main className="preview-loading"><h1>Atlas Physicus</h1><p>{error || 'Loading the observed research heatmap…'}</p>{error && <button onClick={() => location.reload()}>Retry</button>}</main>
  const matchingInstitutions = view.institutions.filter(item => `${item.name} ${item.city}`.toLowerCase().includes(search.toLowerCase()))
  const matchingCountries = data.countries.filter(item => view.countries[item.id] !== undefined && item.name.toLowerCase().includes(search.toLowerCase()))
  return <main className="atlas-shell observed-preview" data-view={countryId ? 'country' : 'world'}>
    <WorldMap countries={data.countries} geographicViews={data.geographicViews}
      countryObservations={view.countryObservations} institutions={view.institutions}
      institutionObservations={view.institutionObservations} metricLabel="Relative colour intensity (0–100)"
      datasetKind="live-api" selectedCountryId={countryId} selectedInstitutionId={institutionId}
      globalResetToken={resetToken} onGlobalReset={reset} onCountrySelect={selectCountry} onInstitutionSelect={selectInstitution} />
    <header className="preview-header">
      <div><p className="preview-eyebrow">TECH ECHO PHYSICA <span>PUBLIC PREVIEW</span></p><h1>Atlas Physicus</h1><p>Nuclear physics · Recorded research activity</p></div>
      <a href="/?view=full-atlas">Full Atlas explorer ↗</a>
    </header>
    <aside className="preview-panel">
      <div className="preview-panel-heading"><span>{countryId ? 'COUNTRY VIEW' : 'GLOBAL VIEW'}</span>{countryId && <button onClick={reset}>← World</button>}</div>
      <h2>{view.country?.name ?? 'Explore the research map'}</h2>
      <p className="preview-muted">{countryId ? (view.countries[countryId] === undefined ? `No mapped records · ${year}` : `${number(view.countries[countryId])} recorded paper-equivalents · ${year}`) : 'Select a country, explore institutions, or move through six years of real source records.'}</p>
      {view.institution && <section className="preview-detail"><h3>{view.institution.name}</h3><p>{view.institution.city}</p><strong>{number(view.current.institutions[view.institution.id] ?? 0)}</strong><p>recorded paper-equivalents · {year}</p><a href={`https://ror.org/${view.institution.id.replace('institution-ror-', '')}`} target="_blank" rel="noreferrer">Institution record ↗</a></section>}
      <label className="preview-search"><span>{countryId ? 'Find an institution' : 'Find a country'}</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={countryId ? 'Institution or city…' : 'Country name…'} /></label>
      <div className="preview-results">{countryId ? matchingInstitutions.map(item => <button key={item.id} onClick={() => selectInstitution(item.id)} aria-pressed={item.id === institutionId}><span>{item.name}<small>{item.city}</small></span><b>{number(view.current.institutions[item.id])}</b></button>) : matchingCountries.map(item => <button key={item.id} onClick={() => selectCountry(item.id)}><span>{item.name}</span><b>{number(view.countries[item.id])}</b></button>)}
        {(countryId ? matchingInstitutions.length : matchingCountries.length) === 0 && <p>No mapped records in this view.</p>}
      </div>
      <p className="preview-footnote">Values are fractional source-record equivalents. Unresolved affiliations remain unassigned.</p>
    </aside>
    <section className="preview-timeline" aria-label="Historical year selection">
      <div className="preview-statline"><strong>{year}</strong><span>{number(view.current.sourceRecords)} source records</span><span>{(view.current.coverage * 100).toFixed(1)}% affiliation mass mapped</span></div>
      <div className="preview-years">{data.years.map(item => <button key={item.year} aria-pressed={item.year === year} onClick={() => { setYear(item.year); setInstitutionId(null) }}>{item.year}</button>)}</div>
      <div className="preview-scale"><span>Less recorded activity</span><i /><span>More</span><small>Fixed log colour scale · dark = no mapped data</small></div>
    </section>
    <details className="preview-method"><summary>Preview · sources & method</summary><p>{data.method}</p><p>This activity preview uses {number(data.years.reduce((sum, item) => sum + item.sourceRecords, 0))} records in the declared nuclear-physics scope. Coverage varies by year. It is not the certified five-metric release.</p><p>{number(view.current.unknownMass)} record-equivalents remain unassigned in {year}. Dataset captured September 8, 2026.</p><a href={dataUrl} download>Download data and provenance</a></details>
  </main>
}
