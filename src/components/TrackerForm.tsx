import { useState, useRef } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { FuelEntry, FormState } from '../types'
import { convertPhotoToDataUrl } from '../utils/photo'
import { formatPrice } from '../utils/formatting'
import { validatePrice, validateFormData } from '../utils/validation'

type TrackerFormProps = {
  onSubmit: (entry: FuelEntry) => void
  onPhotoProcessingChange: (isProcessing: boolean) => void
  onStatusMessageChange: (message: string) => void
  isPhotoProcessing: boolean
}

const emptyForm: FormState = {
  price: '',
  brand: '',
  country: '',
  photoDataUrl: '',
  photoName: '',
}

const brandSuggestions = ['Q8', 'Eni', 'Shell', 'Esso', 'TotalEnergies', 'Tamoil']
const countrySuggestions = ['Italia', 'Francia', 'Germania', 'Spagna', 'Austria', 'Svizzera']

export function TrackerForm({ onSubmit, onPhotoProcessingChange, onStatusMessageChange, isPhotoProcessing }: TrackerFormProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handleFieldChange(field: keyof FormState, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    onPhotoProcessingChange(true)

    try {
      const photoDataUrl = await convertPhotoToDataUrl(file)

      setFormData((current) => ({
        ...current,
        photoDataUrl,
        photoName: file.name,
      }))
      onStatusMessageChange(`Foto pronta: ${file.name}. Verra allegata alla prossima rilevazione.`)
    } catch (error) {
      setFormData((current) => ({
        ...current,
        photoDataUrl: '',
        photoName: '',
      }))

      if (photoInputRef.current) {
        photoInputRef.current.value = ''
      }

      onStatusMessageChange(error instanceof Error ? error.message : 'Impossibile leggere la foto selezionata.')
    } finally {
      onPhotoProcessingChange(false)
    }
  }

  function handleRemovePhoto() {
    setFormData((current) => ({
      ...current,
      photoDataUrl: '',
      photoName: '',
    }))

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }

    onStatusMessageChange('Foto rimossa dalla rilevazione in corso.')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPhotoProcessing) {
      onStatusMessageChange('Attendi il completamento della preparazione della foto prima di salvare.')
      return
    }

    const { valid, parsed: parsedPrice } = validatePrice(formData.price)
    const brand = formData.brand.trim()
    const country = formData.country.trim()

    if (!valid || !validateFormData(parsedPrice, brand, country)) {
      onStatusMessageChange('Controlla i campi: il prezzo deve essere maggiore di zero e i testi non possono essere vuoti.')
      return
    }

    const newEntry: FuelEntry = {
      id: globalThis.crypto.randomUUID(),
      price: parsedPrice,
      brand,
      country,
      createdAt: new Date().toISOString(),
      ...(formData.photoDataUrl
        ? {
            photoDataUrl: formData.photoDataUrl,
            photoName: formData.photoName,
          }
        : {}),
    }

    onSubmit(newEntry)

    setFormData(emptyForm)

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }

    onStatusMessageChange(
      `Rilevazione salvata: ${brand} in ${country} a ${formatPrice(parsedPrice)}${
        formData.photoDataUrl ? ', con foto allegata.' : '.'
      }`,
    )
    priceInputRef.current?.focus()
  }

  return (
    <form className="tracker-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="price">Prezzo al litro</label>
        <p id="price-help" className="field-help">
          Usa il punto o la virgola come separatore decimale, ad esempio 1,789.
        </p>
        <input
          ref={priceInputRef}
          id="price"
          name="price"
          type="text"
          inputMode="decimal"
          placeholder="1,789"
          value={formData.price}
          onChange={(event) => handleFieldChange('price', event.target.value)}
          aria-describedby="price-help"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="brand">Marchio del distributore</label>
        <p id="brand-help" className="field-help">
          Inserisci il brand come compare sulla stazione di servizio.
        </p>
        <input
          id="brand"
          name="brand"
          type="text"
          list="brand-suggestions"
          placeholder="Es. Q8"
          value={formData.brand}
          onChange={(event) => handleFieldChange('brand', event.target.value)}
          aria-describedby="brand-help"
          autoComplete="organization"
          required
        />
        <datalist id="brand-suggestions">
          {brandSuggestions.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </div>

      <div className="field-group">
        <label htmlFor="country">Paese</label>
        <p id="country-help" className="field-help">
          Indica dove hai trovato il prezzo per distinguere i mercati locali.
        </p>
        <input
          id="country"
          name="country"
          type="text"
          list="country-suggestions"
          placeholder="Es. Italia"
          value={formData.country}
          onChange={(event) => handleFieldChange('country', event.target.value)}
          aria-describedby="country-help"
          autoComplete="country-name"
          required
        />
        <datalist id="country-suggestions">
          {countrySuggestions.map((country) => (
            <option key={country} value={country} />
          ))}
        </datalist>
      </div>

      <div className="field-group">
        <label htmlFor="photo">Foto della colonnina (facoltativa)</label>
        <p id="photo-help" className="field-help">
          Accetta JPG, PNG o WebP. La foto viene ridotta automaticamente prima del salvataggio.
        </p>
        <input
          ref={photoInputRef}
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handlePhotoChange}
          aria-describedby="photo-help photo-status"
        />
        <div className="photo-field-meta" id="photo-status">
          {isPhotoProcessing ? (
            <p className="photo-chip">Preparazione foto in corso...</p>
          ) : formData.photoDataUrl ? (
            <>
              <p className="photo-chip">Foto allegata: {formData.photoName || 'immagine pronta'}</p>
              <button type="button" className="secondary-button subtle-button" onClick={handleRemovePhoto}>
                Rimuovi foto
              </button>
            </>
          ) : (
            <p className="storage-note">Nessuna foto selezionata.</p>
          )}
        </div>
      </div>

      <div className="actions-row">
        <button type="submit" className="primary-button" disabled={isPhotoProcessing}>
          {isPhotoProcessing ? 'Preparazione foto...' : 'Salva rilevazione'}
        </button>
      </div>

      <p className="storage-note">
        I dati vengono salvati solo nel browser corrente. Le foto vengono ridotte per occupare meno spazio.
      </p>
    </form>
  )
}
