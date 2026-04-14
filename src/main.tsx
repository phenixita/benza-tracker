import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyResolvedTheme, readStoredThemePreference, resolveTheme } from './theme'

applyResolvedTheme(resolveTheme(readStoredThemePreference()))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
