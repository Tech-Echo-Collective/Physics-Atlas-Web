import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('Atlas Physica public deployment identity', () => {
  it('uses the current product name and documentation anchor in the wrapper', () => {
    const information = readProjectFile('src/PublicInformation.tsx')
    const html = readProjectFile('index.html')

    expect(information).toContain('About Atlas Physica')
    expect(information).toContain('#atlas-physica')
    expect(information).toContain(
      'Atlas Physica is developed and maintained by Tech Echo Collective.',
    )
    expect(html).toContain('<title>Atlas Physica — Interactive Global Atlas</title>')
    expect(html).toContain('property="og:title" content="Atlas Physica"')
    expect(html).toContain('name="twitter:title" content="Atlas Physica"')
    expect(html).not.toContain('og.png')
  })

  it('pins an upstream Atlas with the same visible product identity', () => {
    const explorer = readProjectFile('atlas/src/components/atlas/AtlasExplorer.tsx')

    expect(explorer.match(/<h1>([^<]+)<\/h1>/)?.[1]).toBe('Atlas Physica')
  })

  it('preserves technical repository and package identities', () => {
    expect(JSON.parse(readProjectFile('package.json')).name).toBe('physics-atlas-web')
    expect(readProjectFile('src/PublicInformation.tsx')).toContain(
      'https://github.com/Tech-Echo-Collective/Physics-Atlas',
    )
    expect(readProjectFile('NOTICE')).toContain(
      'Copyright (c) 2026 Tech Echo Collective',
    )
  })
})
