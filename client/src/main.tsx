import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Only register service worker in production or localhost HTTPS
const shouldRegisterSW = () => {
  if (!('serviceWorker' in navigator)) return false;
  
  // In production, always register
  if (import.meta.env.PROD) return true;
  
  // In development, only register on localhost with HTTPS or localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  return isLocalhost;
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