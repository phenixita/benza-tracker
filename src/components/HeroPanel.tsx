import type { FuelEntry } from '../types'
import { formatPrice } from '../utils/formatting'

type HeroPanelProps = {
  bestEntry: FuelEntry | undefined
  averagePrice: number | null
  brandsCount: number
  countriesCount: number
  themePreference: 'light' | 'dark' | 'system'
  themeStatusMessage: string
  onThemeChange: (preference: 'light' | 'dark' | 'system') => void
}

const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
  { value: 'light', label: 'Chiaro' },
  { value: 'dark', label: 'Scuro' },
  { value: 'system', label: 'Automatico' },
]

export function HeroPanel({
  bestEntry,
  averagePrice,
  brandsCount,
  countriesCount,
  themePreference,
  themeStatusMessage,
  onThemeChange,
}: HeroPanelProps) {
  return (
    <header className="hero-panel">
      <div className="hero-head">
        <div className="hero-copy">
          <p className="eyebrow">Fuel price tracker</p>
          <h1>Registra il prezzo del carburante e confronta marchi e paesi in un colpo d occhio.</h1>
          <p className="hero-text">
            Inserisci il prezzo al litro che trovi, il marchio del distributore e il paese della rilevazione.
            L archivio resta nel browser per un confronto rapido e immediato.
          </p>
        </div>

        <div className="theme-selector" aria-label="Impostazioni del tema">
          <p className="theme-selector-label">Tema</p>
          <div className="theme-selector-buttons" role="group" aria-label="Scegli il tema dell applicazione">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-selector-button ${themePreference === option.value ? 'is-active' : ''}`}
                onClick={() => onThemeChange(option.value)}
                aria-pressed={themePreference === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="theme-selector-status">{themeStatusMessage}</p>
        </div>
      </div>

      <div className="metrics-grid" aria-label="Riepilogo rapido delle rilevazioni">
        <article className="metric-card accent-card">
          <span className="metric-label">Miglior prezzo</span>
          <strong className="metric-value">{bestEntry ? formatPrice(bestEntry.price) : '--'}</strong>
          <p className="metric-detail">
            {bestEntry ? `${bestEntry.brand} · ${bestEntry.country}` : 'Aggiungi una rilevazione per iniziare.'}
          </p>
        </article>
        <article className="metric-card">
          <span className="metric-label">Prezzo medio</span>
          <strong className="metric-value">{averagePrice ? formatPrice(averagePrice) : '--'}</strong>
          <p className="metric-detail">Calcolato sulle rilevazioni presenti.</p>
        </article>
        <article className="metric-card">
          <span className="metric-label">Marchi tracciati</span>
          <strong className="metric-value">{brandsCount}</strong>
          <p className="metric-detail">Confronto tra operatori differenti.</p>
        </article>
        <article className="metric-card">
          <span className="metric-label">Paesi coperti</span>
          <strong className="metric-value">{countriesCount}</strong>
          <p className="metric-detail">Per monitorare le differenze geografiche.</p>
        </article>
      </div>
    </header>
  )
}
