import React from 'react';
import { createRoot } from 'react-dom/client';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

const DevAgentation = import.meta.env.DEV
  ? React.lazy(() => import('./components/DevAgentation'))
  : null;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {DevAgentation && (
      <React.Suspense fallback={null}>
        <DevAgentation />
      </React.Suspense>
    )}
  </React.StrictMode>,
);
