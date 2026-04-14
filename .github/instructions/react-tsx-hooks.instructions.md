---
description: "Use when writing or refactoring React TSX components, hooks, useEffect, useState, state updates, derived state, side effects, subscriptions, timers, async effects, and component local state. Enforce React best practices for TSX files."
name: "React TSX Hooks Best Practices"
applyTo: "**/*.tsx
---
# React TSX Hooks Best Practices

- Tratta queste regole come preferenze forti di default nei file TSX. Puoi derogare solo quando l'alternativa e chiaramente piu semplice, piu leggibile o piu coerente con l'architettura esistente; in quel caso esplicita il motivo.

- Usa `useEffect` solo per sincronizzare il componente con sistemi esterni: listener DOM, timer, rete, localStorage, API browser, subscription o librerie imperative.
- Non usare `useEffect` per calcolare dati derivati dal render. Se un valore dipende da props o state correnti, calcolalo direttamente nel render.
- Non usare `useEffect` per reagire a un click o a un submit quando la logica puo vivere direttamente nell'handler dell'evento.
- Ogni effect deve avere una responsabilita unica. Se un effect fa piu cose scollegate, suddividilo.
- Ogni effect che registra listener, timer o subscription deve restituire una cleanup function completa e simmetrica.
- Le dipendenze degli effect devono essere complete e corrette. Non sopprimere `exhaustive-deps` senza una motivazione tecnica forte.
- Se un effect aggiorna state basato sul valore precedente, usa l'update function (`setValue((current) => ...)`) per evitare dipendenze inutili e race condition.
- Per fetch asincroni dentro `useEffect`, gestisci sempre cancellazione o ignore flag per evitare update dopo l'unmount o dopo una richiesta obsoleta.
- Mantieni lo state minimo. Non duplicare in state valori gia derivabili da props, altri state o costanti.
- Evita di copiare props in state salvo casi intenzionali e commentabili, come un draft locale modificabile.
- Preferisci lazy initialization (`useState(() => initialValue)`) quando il valore iniziale richiede calcolo o lettura costosa.
- Usa uno state object solo quando i campi cambiano insieme. Se i campi evolvono in modo indipendente, preferisci state separati.
- Se la logica di aggiornamento dello state diventa articolata o dipende da piu transizioni, preferisci `useReducer` invece di molti `useState` concatenati.
- Nei TSX, nomi di state ed effect devono rendere chiaro se rappresentano dati persistenti, UI state temporaneo o stato derivato.

## Esempi

Preferisci questo:

```tsx
const sortedEntries = sortEntries(entries)
const bestEntry = sortedEntries[0]
```

Non questo:

```tsx
const [sortedEntries, setSortedEntries] = useState<FuelEntry[]>([])

useEffect(() => {
  setSortedEntries(sortEntries(entries))
}, [entries])
```

Preferisci questo:

```tsx
function handleAddEntry(newEntry: FuelEntry) {
  setEntries((currentEntries) => [...currentEntries, newEntry])
}
```

Non questo:

```tsx
function handleAddEntry(newEntry: FuelEntry) {
  setEntries([...entries, newEntry])
}
```

Per effetti asincroni, preferisci questo:

```tsx
useEffect(() => {
  let isCancelled = false

  async function loadData() {
    const response = await fetch(url)
    const data = await response.json()

    if (!isCancelled) {
      setData(data)
    }
  }

  void loadData()

  return () => {
    isCancelled = true
  }
}, [url])
```