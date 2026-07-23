import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.js'
import { AuthProvider } from './contexts/AuthContext.js'
import { NodesProvider } from './contexts/NodesContext.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './reset.css'
import './index.css'
import App from './App.js'

import './styles/base.css'
import './styles/themes.css'
import './styles/responsive.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NodesProvider>
          <BrowserRouter>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </BrowserRouter>
      </NodesProvider>
    </AuthProvider>
  </StrictMode>
)
