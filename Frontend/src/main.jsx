import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GlobalErrorProvider } from './context/GlobalErrorContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GlobalErrorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
)
