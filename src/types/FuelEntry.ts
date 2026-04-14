export type FuelEntry = {
  id: string
  price: number
  brand: string
  country: string
  createdAt: string
  photoDataUrl?: string
  photoName?: string
}

export type FormState = {
  price: string
  brand: string
  country: string
  photoDataUrl: string
  photoName: string
}

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
