import type { FuelEntry } from '../types'

const storageKey = 'benza-tracker.entries'

export function isFuelEntry(entry: unknown): entry is FuelEntry {
  const candidate = entry as Record<string, unknown> | null

  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.id === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.brand === 'string' &&
    typeof candidate.country === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.photoDataUrl === undefined || typeof candidate.photoDataUrl === 'string') &&
    (candidate.photoName === undefined || typeof candidate.photoName === 'string')
  )
}

export function readStoredEntries(): FuelEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isFuelEntry)
  } catch {
    return []
  }
}

export function persistEntries(entries: FuelEntry[]): boolean {
  try {
    if (typeof window !== 'undefined') {
      if (entries.length > 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(entries))
      } else {
        window.localStorage.removeItem(storageKey)
      }
    }

    return true
  } catch {
    return false
  }
}

export function getStorageErrorMessage(error: unknown) {
  if (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  ) {
    return 'Spazio del browser quasi esaurito: prova una foto piu leggera oppure rimuovi alcune rilevazioni con immagine.'
  }

  return 'Non sono riuscito a salvare la rilevazione nel browser corrente.'
}
