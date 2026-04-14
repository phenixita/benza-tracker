import type { FuelEntry } from '../types'
import { formatPrice, formatDate } from '../utils/formatting'

type ArchiveSectionProps = {
  sortedEntries: FuelEntry[]
  bestEntry: FuelEntry | undefined
  onDelete: (id: string) => void
  onClearAll: () => void
  onOpenPhoto: (entry: FuelEntry) => void
}

export function ArchiveSection({
  sortedEntries,
  bestEntry,
  onDelete,
  onClearAll,
  onOpenPhoto,
}: ArchiveSectionProps) {
  return (
    <section className="panel" aria-labelledby="archive-title">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">Archivio</p>
          <h2 id="archive-title">Rilevazioni salvate</h2>
        </div>
        <p className="panel-note">Ordinate dal prezzo piu basso al piu alto.</p>
      </div>

      {sortedEntries.length > 0 ? (
        <>
          <article className="highlight-banner" aria-label="Migliore rilevazione">
            <div>
              <p className="panel-kicker">In evidenza</p>
              <h3>{bestEntry!.brand}</h3>
              <p className="metric-detail">
                {bestEntry!.country} · rilevato il {formatDate(bestEntry!.createdAt)}
              </p>
            </div>
            <strong className="highlight-price">{formatPrice(bestEntry!.price)}</strong>
          </article>

          <ul className="entry-list" aria-label="Elenco delle rilevazioni salvate">
            {sortedEntries.map((entry, index) => (
              <li key={entry.id} className={`entry-card ${index === 0 ? 'best-entry' : ''}`}>
                <div className="entry-copy">
                  <p className="entry-rank">{index === 0 ? 'Prezzo piu basso' : `Posizione ${index + 1}`}</p>
                  <h3>{entry.brand}</h3>
                  <p className="entry-meta">{entry.country}</p>
                  <p className="entry-date">{formatDate(entry.createdAt)}</p>
                  {entry.photoDataUrl ? <p className="entry-photo-label">Foto colonnina disponibile</p> : null}
                </div>

                <div className="entry-actions">
                  <strong className="entry-price">{formatPrice(entry.price)}</strong>
                  {entry.photoDataUrl ? (
                    <button
                      type="button"
                      className="entry-photo-button"
                      onClick={() => onOpenPhoto(entry)}
                      aria-label={`Apri la foto della rilevazione di ${entry.brand} in ${entry.country}`}
                    >
                      Apri foto
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="entry-remove"
                    onClick={() => onDelete(entry.id)}
                    aria-label={`Rimuovi la rilevazione di ${entry.brand} in ${entry.country}`}
                  >
                    Rimuovi
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="actions-row" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="secondary-button" onClick={onClearAll}>
              Svuota archivio
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state" role="status" aria-live="polite">
          <h3>Nessuna rilevazione salvata</h3>
          <p>Compila il modulo per iniziare a confrontare prezzi, marchi e paesi.</p>
        </div>
      )}
    </section>
  )
}
