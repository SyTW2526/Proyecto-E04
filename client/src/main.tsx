import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LogIn from './login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogIn />
  </StrictMode>,
)
