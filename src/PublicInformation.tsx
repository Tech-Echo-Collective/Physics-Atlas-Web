import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

const MAIN_REPOSITORY = 'https://github.com/Tech-Echo-Collective/atlas-physicus'
const WEB_REPOSITORY = 'https://github.com/Tech-Echo-Collective/Physics-Atlas-Web'

const projectLinks = [
  {
    label: 'About Atlas Physicus',
    detail: 'Purpose, scope, and current alpha status',
    href: `${MAIN_REPOSITORY}#atlas-physicus`,
  },
  {
    label: 'Architecture',
    detail: 'System layers and repository boundaries',
    href: `${MAIN_REPOSITORY}/blob/main/docs/architecture.md`,
  },
  {
    label: 'Methodology',
    detail: 'Metric vocabulary, interpretation, and limits',
    href: `${MAIN_REPOSITORY}/blob/main/docs/metric-methodology-v1.md`,
  },
  {
    label: 'Roadmap',
    detail: 'Released foundations and planned next stage',
    href: `${WEB_REPOSITORY}/blob/main/docs/roadmap.md`,
  },
  {
    label: 'GitHub Repository',
    detail: 'Source, documentation, issues, and license',
    href: MAIN_REPOSITORY,
  },
] as const

function subscribeToAtlasShell(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

function getAtlasShell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.atlas-shell')
}

export function PublicInformation() {
  const portalTarget = useSyncExternalStore(
    subscribeToAtlasShell,
    getAtlasShell,
    () => null,
  )
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div className="public-information" data-open={isOpen}>
      <button
        className="public-information-trigger"
        type="button"
        aria-label="Project information and documentation"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">i</span>
      </button>

      {isOpen && (
        <section
          className="public-information-panel"
          id={panelId}
          aria-label="Atlas Physicus project information"
        >
          <header>
            <div>
              <p>Public Atlas · v3.0.5-alpha</p>
              <h2>Project information</h2>
            </div>
            <button
              type="button"
              aria-label="Close project information"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          <p className="public-information-summary">
            Atlas Physicus explores scientific ecosystems through geography,
            canonical entities, and provenance-aware relationships. It is not
            a scientific ranking system.
          </p>

          <nav aria-label="Project documentation">
            {projectLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <strong>{link.label}</strong>
                  <small>{link.detail}</small>
                </span>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </nav>

          <p className="public-information-footnote">
            Part of Tech Echo Physica, a Tech Echo Collective project family for exploring physics through research mapping, knowledge structures, and interactive physical systems.
            {' '}Documentation opens separately so the current Atlas position stays
            intact.
          </p>
        </section>
      )}
    </div>,
    portalTarget,
  )
}
