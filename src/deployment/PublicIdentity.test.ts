import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('Atlas Physicus public deployment identity', () => {
  it('uses the current product name and documentation anchor in the wrapper', () => {
    const information = readProjectFile('src/PublicInformation.tsx')
    const html = readProjectFile('index.html')

    expect(information).toContain('About Atlas Physicus')
    expect(information).toContain('#atlas-physicus')
    expect(information).toContain(
      'Part of Tech Echo Physica, a Tech Echo Collective project family for exploring physics through research mapping, knowledge structures, and interactive physical systems.',
    )
    expect(html).toContain('<title>Atlas Physicus — Interactive Global Atlas</title>')
    expect(html).toContain('property="og:title" content="Atlas Physicus"')
    expect(html).toContain('name="twitter:title" content="Atlas Physicus"')
    expect(html).not.toContain('og.png')
  })

  it('pins an upstream Atlas with the same visible product identity', () => {
    const explorer = readProjectFile('atlas/src/components/atlas/AtlasExplorer.tsx')

    expect(explorer.match(/<h1>([^<]+)<\/h1>/)?.[1]).toBe('Atlas Physicus')
  })

  it('uses the canonical source and preserves the separate deployment identity', () => {
    expect(JSON.parse(readProjectFile('package.json')).name).toBe('physics-atlas-web')
    expect(readProjectFile('src/PublicInformation.tsx')).toContain(
      'https://github.com/Tech-Echo-Collective/atlas-physicus',
    )
    expect(readProjectFile('.gitmodules')).toContain(
      'https://github.com/Tech-Echo-Collective/atlas-physicus.git',
    )
    expect(readProjectFile('src/PublicInformation.tsx')).toContain(
      'https://github.com/Tech-Echo-Collective/Physics-Atlas-Web',
    )
    expect(readProjectFile('NOTICE')).toContain(
      'Copyright (c) 2026 Tech Echo Collective',
    )
  })
})
