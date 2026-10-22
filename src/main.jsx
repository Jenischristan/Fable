import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'

createRoot(document.getElementById('root'), {
  onRecoverableError(error, errorInfo) {
    console.error('Recoverable render error:', error, errorInfo);
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>
)
