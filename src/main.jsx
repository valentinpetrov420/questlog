import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ListsProvider } from './contexts/ListsContext.jsx'
import { NodesProvider } from './contexts/NodesContext.jsx'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './reset.css'
import './index.css'
import App from './App.jsx'

import './styles/base.css'
import './styles/themes.css'
import './styles/responsive.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NodesProvider>
        <ListsProvider>
          <BrowserRouter>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </BrowserRouter>
        </ListsProvider>
      </NodesProvider>
    </AuthProvider>
  </StrictMode>
)
