import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { MainProvider } from './providers/main.provider'
import "./index.css"

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <MainProvider />
    </StrictMode>,
  )
}