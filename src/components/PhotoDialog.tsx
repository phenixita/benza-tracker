import { useEffect, useRef } from 'react'
import type { FuelEntry } from '../types'
import { formatDate, buildPhotoAlt } from '../utils/formatting'

type PhotoDialogProps = {
  entry: FuelEntry | null
  onClose: () => void
}

export function PhotoDialog({ entry, onClose }: PhotoDialogProps) {
  const closePhotoButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!entry) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [entry, onClose])

  useEffect(() => {
    if (entry) {
      closePhotoButtonRef.current?.focus()
    }
  }, [entry])

  if (!entry?.photoDataUrl) {
    return null
  }

  return (
    <div className="photo-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="photo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="photo-dialog-head">
          <div>
            <p className="panel-kicker">Foto allegata</p>
            <h2 id="photo-dialog-title">{entry.brand}</h2>
            <p className="metric-detail">
              {entry.country} · rilevato il {formatDate(entry.createdAt)}
            </p>
          </div>
          <button
            ref={closePhotoButtonRef}
            type="button"
            className="secondary-button photo-dialog-close"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>

        <img className="photo-dialog-image" src={entry.photoDataUrl} alt={buildPhotoAlt(entry)} />
      </div>
    </div>
  )
}
