import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import KissPage from './KissPage.jsx'

const page = window.location.pathname === '/kiss' ? <KissPage /> : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
