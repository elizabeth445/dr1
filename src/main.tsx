import React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

// Every visit starts with a fresh invitation, including a restored browser tab.
// Keep ScrollTrigger refreshes from restoring the browser's previous scroll position.
ScrollTrigger.clearScrollMemory('manual');
if (window.location.hash) {
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.search,
  );
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
const restartRestoredVisit = (event: PageTransitionEvent) => {
  if (event.persisted) window.location.reload();
};
window.addEventListener('pageshow', restartRestoredVisit);
if (import.meta.hot) {
  import.meta.hot.dispose(() => window.removeEventListener('pageshow', restartRestoredVisit));
}

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
