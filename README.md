# Benza Tracker

Un'applicazione web moderna per tracciare e confrontare i prezzi del carburante in Europa. Realizzata con **React**, **TypeScript** e **Vite**, offre un'interfaccia intuitiva per registrare rifornimenti, visualizzare statistiche e consultare la cronologia delle rilevazioni con foto opzionali.

---

## Funzionalità Principali

- **Registrazione rilevazioni**: Salva prezzo, marca, paese e foto del rifornimento
- **Visualizzazione statistiche**: Miglior prezzo, media, numero di marche e paesi tracciati
- **Archivio ordinato**: Visualizza tutte le rilevazioni ordinate dal prezzo più basso al più alto
- **Gestione foto**: Carica e visualizza foto dei rifornimenti con compressione e ridimensionamento automatico
- **Persistenza locale**: Tutti i dati sono salvati nel browser tramite localStorage
- **Tema personalizzabile**: Scegli tra modalità chiara, scura o automatica

---

## Componenti Principali

### `src/App.tsx`
Il cuore dell'applicazione. Gestisce lo stato globale delle rilevazioni, le preferenze di tema, la logica di sincronizzazione con localStorage e la comunicazione tra i componenti figli tramite callback props.

**Responsabilità**:
- Gestione dello state delle rilevazioni (`entries`)
- Sincronizzazione con localStorage in lettura e scrittura
- Gestione del tema (preferenza e tema di sistema)
- Orchestrazione dei componenti figli

### `TrackerForm`
Componente per l'inserimento di nuove rilevazioni di carburante.

**Funzionalità**:
- Form con campi: prezzo, marca, paese
- Suggerimenti autocomplete per marcche e paesi
- Upload e preview di foto
- Validazione campo prezzo in tempo reale
- Feedback visivo durante l'elaborazione della foto

### `HeroPanel`
Pannello hero nella sezione superiore che visualizza le statistiche aggregate.

**Contenuto**:
- Miglior prezzo registrato (con marca, paese e data)
- Prezzo medio tra tutte le rilevazioni
- Numero di marche e paesi tracciati
- Controllo tema (light/dark/system)

### `ArchiveSection`
Sezione che elenca tutte le rilevazioni salvate.

**Funzionalità**:
- Lista ordinata dal prezzo più basso al più alto
- Visualizzazione data, prezzo, marca, paese
- Pulsante per visualizzare la foto (se presente)
- Pulsante per eliminare singola rilevazione
- Pulsante per cancellare l'intero archivio

### `PhotoDialog`
Dialog modale per visualizzare la foto a schermo intero.

**Funzionalità**:
- Visualizzazione foto in overlay responsive
- Chiusura con pulsante o click esterno

---

## Logica Applicativa

### Gestione dello State

L'applicazione usa una struttura di state minimale e derivata:

```typescript
// State minimale in App.tsx
const [entries, setEntries] = useState<FuelEntry[]>(readStoredEntries)
const [themePreference, setThemePreference] = useState<ThemePreference>(readStoredThemePreference)
const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

// Dati derivati calcolati al render
const sortedEntries = sortEntries(entries)
const bestEntry = sortedEntries[0]
const averagePrice = entries.length > 0 ? entries.reduce((total, entry) => total + entry.price, 0) / entries.length : null
const countriesCount = new Set(entries.map((entry) => entry.country.toLowerCase())).size
const brandsCount = new Set(entries.map((entry) => entry.brand.toLowerCase())).size
```

**Principi**:
- Lo state è mantenuto il più piccolo possibile
- I valori derivati (media, conteggi, ordinamenti) sono calcolati al render, non sincronizzati con effect
- Ogni handler modifica lo state in modo atomico e verifica il risultato della persistenza prima di aggiornare

### Persistenza su localStorage

Utilizzo il metodo `persistEntries()` prima di aggiornare lo state:

```typescript
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
```

**Vantaggi**:
- La persistenza fallita non causa un'inconsistenza tra UI e localStorage
- I messaggi di errore sono localizzati
- Lo state rimane sempre sincronizzato con localStorage

### Gestione del Tema

Il tema combina la preferenza dell'utente con il tema di sistema:

```typescript
// Effect per applicare il tema e salvare la preferenza
useEffect(() => {
  applyResolvedTheme(themePreference === 'system' ? systemTheme : themePreference)
  
  try {
    window.localStorage.setItem(themeStorageKey, themePreference)
  } catch {
    // Tema rimane attivo anche senza persistenza
  }
}, [systemTheme, themePreference])

// Effect per sincronizzare con il tema di sistema
useEffect(() => {
  if (themePreference !== 'system') return
  
  const mediaQueryList = window.matchMedia(systemThemeMediaQuery)
  
  const syncWithSystemTheme = (event?: MediaQueryListEvent) => {
    setSystemTheme((event?.matches ?? mediaQueryList.matches) ? 'dark' : 'light')
  }
  
  syncWithSystemTheme()
  mediaQueryList.addEventListener('change', syncWithSystemTheme)
  
  return () => {
    mediaQueryList.removeEventListener('change', syncWithSystemTheme)
  }
}, [themePreference])
```

---

## Logica di Gestione delle Immagini

Le foto sono gestite in modo efficiente per ridurre l'ingombro in localStorage.

### Caricamento e Elaborazione in `src/utils/photo.ts`

```typescript
const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxPhotoDimension = 1280
const photoOutputQuality = 0.8
const maxPhotoFileSizeBytes = 12 * 1024 * 1024
```

**Flusso**:

1. **Validazione tipo file**: Solo JPEG, PNG e WebP sono accettati
2. **Verifica dimensione**: Max 12 MB
3. **Lettura del Blob**: Conversione in data URL tramite FileReader
4. **Caricamento in DOM**: Creazione di un elemento Image per leggere le dimensioni
5. **Ridimensionamento**: Se la lunghezza del lato più lungo supera 1280 px, l'immagine viene rimpicciolita mantenendo le proporzioni
6. **Compressione**: Canvas con quality 0.8 per output JPEG
7. **Archiviazione**: Salvataggio come data URL (base64) in localStorage

**Funzioni**:

- `readBlobAsDataUrl(blob)`: Legge un Blob e lo converte in data URL
- `loadImageElement(source)`: Crea un elemento Image e attende il caricamento
- `getResizedDimensions(width, height)`: Calcola le nuove dimensioni mantenendo l'aspect ratio
- `convertPhotoToDataUrl(file)`: Orchestrazione completa del flusso di elaborazione

**Vantaggi**:
- Foto compresse e ridimensionate per minimizzare l'ingombro in localStorage
- Supporto multi-formato con fallback
- Gestione error completa con messaggi localizzati in italiano
- Processing asincrono con state loading per feedback visivo

---

## Setup per gli Sviluppatori

### Prerequisiti

- Node.js (versione 16+)
- npm o yarn

### Installazione

```bash
git clone https://github.com/tuousername/benza-tracker.git
cd benza-tracker
npm install
```

### Comandi Disponibili

```bash
# Avviare il server di sviluppo (HMR abilitato)
npm run dev

# Build per produzione (TypeScript + Vite bundler)
npm run build

# Eseguire i controlli lint su TypeScript e React
npm run lint

# Preview della build di produzione in locale
npm run preview
```

### Stack Tecnologico

- **React 19.x**: Framework UI
- **TypeScript 6.x**: Type safety rigorosa
- **Vite 8.x**: Build tool e dev server ad alte prestazioni
- **ESLint + TypeScript ESLint**: Linting con type-aware rules
- **localStorage API**: Persistenza client-side

### Configurazione TypeScript

Il progetto usa impostazioni strict:
- `noUnusedLocals`: Vieta variabili non utilizzate
- `noUnusedParameters`: Vieta parametri non utilizzati
- Ottimo per mantenere il codice pulito e coerente

---

## Contribuire al Progetto

Siamo felici di ricevere contributi della comunità! Ecco come partecipare.

### Linee Guida Generali

1. **Fork il repository** e clona il tuo fork in locale
2. **Crea un branch feature**: `git checkout -b feature/mia-feature`
3. **Lavora su un'unica feature per pull request** per mantenere i commit focati
4. **Testa i tuoi cambiamenti** prima di aprire una PR

### Flusso di Contribuzione

#### 1. Setup locale

```bash
git clone https://github.com/iltuousername/benza-tracker.git
cd benza-tracker
npm install
npm run dev
```

#### 2. Apporta modifiche

- **Rispetta lo stile di codice esistente**: TypeScript strict, React hooks best practices
- **Leggi [.github/instructions/react-tsx-hooks.instructions.md](.github/instructions/react-tsx-hooks.instructions.md)** per le best practice sui componenti React
- **Localizza il testo in italiano**: user-facing copy, messaggi di errore, label dei form
- **Mantieni la persistenza localStorage**: Preserva la key `benza-tracker.entries` e la shape di `FuelEntry`

#### 3. Verifica la build

```bash
npm run build
npm run lint
```

Questi comandi eseguono:
- Type checking TypeScript
- Vite production build
- ESLint con type-aware rules

#### 4. Apri una Pull Request

- Titolo chiaro e descrittivo in italiano
- Descrizione della feature o del fix chiaramente documentata
- Referente a eventuali issue collegate (`Fixes #123`)
- Non aggiungere assets o dipendenze senza discussione preliminare

### Consigli per le Feature

#### Aggiungere una nuova colonna o campo a `FuelEntry`

1. Aggiorna il type in [src/types/FuelEntry.ts](src/types/FuelEntry.ts)
2. Aggiorna la validazione in [src/utils/validation.ts](src/utils/validation.ts)
3. Aggiorna il form in [src/components/TrackerForm.tsx](src/components/TrackerForm.tsx)
4. Aggiorna l'archivio in [src/components/ArchiveSection.tsx](src/components/ArchiveSection.tsx)
5. Verifica che localStorage continui a funzionare (lettura dati vecchi deve fallire gracefully)

#### Aggiungere uno stile visivo

- Usa le custom properties CSS definite in [src/index.css](src/index.css)
- Mantieni il tema dark gradient come base
- Tutti gli stili globali in [src/App.css](src/App.css), componentali in file separati se necessario

#### Modificare la logica di persistenza o storage

- Non cambiare la key di localStorage `benza-tracker.entries` senza coordinamento
- Aggiungi validation runtime quando leggi da localStorage per mitigare breaking changes
- Testa il comportamento con dati "vecchi" per evitare errori ai vecchi utenti

### Best Practice di Codice

- **State minimale**: Non duplicare in state valori già derivabili
- **No useEffect per calcoli**: Derivata i valori nel render
- **Async asincrono sicuro**: Gestisci cancellazione o ignore flag nel cleanup
- **Nomi chiari**: Il nome di una variabile deve dire se è state, derivato, UI temporanea
- **Commit atomici**: Un commit = una feature logica o un fix

### Segnalare Bug

Se trovate un bug, aprite una GitHub Issue con:
- **Titolo descrittivo**
- **Versione del browser** e **OS**
- **Passaggi per riprodurre** il bug
- **Comportamento atteso** vs **comportamento osservato**
- **Screenshot o video** se utile

---

## Licenza

Consultare il file LICENSE per i dettagli di licensing.
