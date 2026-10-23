import { useSyncExternalStore } from 'react';
import { Agentation } from 'agentation';

function canStoreFeedback() {
  try {
    const key = `invitation:agentation:probe:${crypto.randomUUID()}`;
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// The optional editor must not take down the page when browser storage is blocked.
const feedbackStorageAvailable = canStoreFeedback();

function getActiveDialog() {
  return document.querySelector<HTMLDialogElement>('.opening[open], .lightbox[open]');
}

function subscribeToDialogs(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  });
  return () => observer.disconnect();
}

export default function DevAgentation() {
  const dialog = useSyncExternalStore(subscribeToDialogs, getActiveDialog, () => null);

  // Keep the toolbar interactive inside the native dialog's focus boundary.
  return feedbackStorageAvailable ? (
    <Agentation appName="Після шостої" portalContainer={dialog} />
  ) : null;
}
