import type { FuelEntry } from '../types'

export function sortEntries(entries: FuelEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.price !== right.price) {
      return left.price - right.price
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

export function validatePrice(price: string): { valid: boolean; parsed: number } {
  const parsed = Number.parseFloat(price.replace(',', '.'))

  return {
    valid: Number.isFinite(parsed) && parsed > 0,
    parsed,
  }
}

export function validateFormData(price: number, brand: string, country: string): boolean {
  return price > 0 && brand.trim().length > 0 && country.trim().length > 0
}
