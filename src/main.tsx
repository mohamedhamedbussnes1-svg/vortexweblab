import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        void reg.unregister();
      });
    });
  } else {
    registerSW({ immediate: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <OfflineIndicator />
  </>,
);
