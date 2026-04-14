import { useEffect, useState } from 'react'
import './App.css'
import type { FuelEntry, ThemePreference } from './types'
import { TrackerForm } from './components/TrackerForm'
import { HeroPanel } from './components/HeroPanel'
import { ArchiveSection } from './components/ArchiveSection'
import { PhotoDialog } from './components/PhotoDialog'
import {
  readStoredEntries,
  persistEntries,
  getStorageErrorMessage,
} from './utils/storage'
import { sortEntries } from './utils/validation'
import {
  applyResolvedTheme,
  getSystemTheme,
  readStoredThemePreference,
  systemThemeMediaQuery,
  themeStorageKey,
  type ResolvedTheme,
} from './theme'

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(readStoredEntries)
  const [statusMessage, setStatusMessage] = useState('')
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false)
  const [activePhotoEntry, setActivePhotoEntry] = useState<FuelEntry | null>(null)
  const [themePreference, setThemePreference] = useState<ThemePreference>(readStoredThemePreference)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    applyResolvedTheme(themePreference === 'system' ? systemTheme : themePreference)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(themeStorageKey, themePreference)
    } catch {
      // Il cambio tema resta attivo anche senza persistenza disponibile.
    }
  }, [systemTheme, themePreference])

  useEffect(() => {
    if (themePreference !== 'system' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia(systemThemeMediaQuery)

    const syncWithSystemTheme = (event?: MediaQueryListEvent) => {
      setSystemTheme((event?.matches ?? mediaQueryList.matches) ? 'dark' : 'light')
    }

    syncWithSystemTheme()

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', syncWithSystemTheme)

      return () => {
        mediaQueryList.removeEventListener('change', syncWithSystemTheme)
      }
    }

    mediaQueryList.addListener(syncWithSystemTheme)

    return () => {
      mediaQueryList.removeListener(syncWithSystemTheme)
    }
  }, [themePreference])

  const sortedEntries = sortEntries(entries)
  const bestEntry = sortedEntries[0]
  const averagePrice = entries.length > 0 ? entries.reduce((total, entry) => total + entry.price, 0) / entries.length : null
  const countriesCount = new Set(entries.map((entry) => entry.country.toLowerCase())).size
  const brandsCount = new Set(entries.map((entry) => entry.brand.toLowerCase())).size
  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference
  const themeStatusMessage = getThemeStatusMessage(themePreference, resolvedTheme)

  function handleFormSubmit(newEntry: FuelEntry) {
    const nextEntries = [newEntry, ...entries]

    try {
      if (!persistEntries(nextEntries)) {
        setStatusMessage(getStorageErrorMessage(new Error('persistenza fallita')))
        return
      }

      setEntries(nextEntries)
    } catch (error) {
      setStatusMessage(getStorageErrorMessage(error))
    }
  }

  function handleDelete(id: string) {
    const nextEntries = entries.filter((entry) => entry.id !== id)

    if (nextEntries.length === entries.length) {
      return
    }

    try {
      if (!persistEntries(nextEntries)) {
        setStatusMessage(getStorageErrorMessage(new Error('persistenza fallita')))
        return
      }

      setEntries(nextEntries)

      if (activePhotoEntry?.id === id) {
        setActivePhotoEntry(null)
      }

      setStatusMessage('Rilevazione rimossa dall archivio locale.')
    } catch (error) {
      setStatusMessage(getStorageErrorMessage(error))
    }
  }

  function handleClearAll() {
    if (!entries.length) {
      return
    }

    const confirmed = window.confirm('Vuoi cancellare tutte le rilevazioni salvate in questo browser?')

    if (!confirmed) {
      return
    }

    try {
      if (!persistEntries([])) {
        setStatusMessage(getStorageErrorMessage(new Error('persistenza fallita')))
        return
      }

      setEntries([])
      setActivePhotoEntry(null)
      setStatusMessage('Archivio locale cancellato.')
    } catch (error) {
      setStatusMessage(getStorageErrorMessage(error))
    }
  }

  return (
    <div className="app-shell">
      <HeroPanel
        bestEntry={bestEntry}
        averagePrice={averagePrice}
        brandsCount={brandsCount}
        countriesCount={countriesCount}
        themePreference={themePreference}
        themeStatusMessage={themeStatusMessage}
        onThemeChange={setThemePreference}
      />

      <main className="content-grid">
        <section className="panel" aria-labelledby="tracker-title">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Nuova rilevazione</p>
              <h2 id="tracker-title">Salva un nuovo prezzo</h2>
            </div>
            <p className="panel-note">Prezzo, marchio e paese sono obbligatori. La foto e facoltativa.</p>
          </div>

          <TrackerForm
            onSubmit={handleFormSubmit}
            onPhotoProcessingChange={setIsPhotoProcessing}
            onStatusMessageChange={setStatusMessage}
            isPhotoProcessing={isPhotoProcessing}
          />

          <p className="status-message" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </section>

        <ArchiveSection
          sortedEntries={sortedEntries}
          bestEntry={bestEntry}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onOpenPhoto={setActivePhotoEntry}
        />
      </main>

      <PhotoDialog entry={activePhotoEntry} onClose={() => setActivePhotoEntry(null)} />
    </div>
  )
}

function getThemeStatusMessage(preference: ThemePreference, resolvedTheme: ResolvedTheme) {
  if (preference === 'system') {
    return `Automatico attivo: segue il tema ${resolvedTheme === 'dark' ? 'scuro' : 'chiaro'} del sistema.`
  }

  return preference === 'dark' ? 'Tema scuro attivo.' : 'Tema chiaro attivo.'
}

export default App
