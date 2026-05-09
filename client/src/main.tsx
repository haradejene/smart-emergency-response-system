import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Only register service worker in production
const shouldRegisterSW = () => {
  if (!('serviceWorker' in navigator)) return false;
  
  // Only register in production environment
  if (import.meta.env.PROD) return true;
  
  return false;
};

if (shouldRegisterSW()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ SW registered:', registration.scope);
      })
      .catch(error => {
        console.log('⚠️ SW registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);