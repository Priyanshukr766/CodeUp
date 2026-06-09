import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import axios from 'axios'

// Dynamically set the backend URL based on the environment.
// When deployed on Vercel, we will set VITE_API_URL to the Render backend URL.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
