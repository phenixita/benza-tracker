import type { FuelEntry } from '../types'

const priceFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

export function formatPrice(value: number) {
  return `${priceFormatter.format(value)} / L`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function buildPhotoAlt(entry: FuelEntry) {
  return `Foto della colonnina prezzi di ${entry.brand} in ${entry.country}, rilevata il ${formatDate(entry.createdAt)}.`
}
