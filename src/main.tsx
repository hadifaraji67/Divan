import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AppErrorComponent } from './lib/error-component';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ThemeProvider } from './lib/theme-context';
import { Toaster } from 'sonner';
import { installGlobalHandlers } from './lib/error-logger';
import { bootstrapIndexedDB } from './lib/storage-idb';
import './styles.css';

/* ═══════════════════════════════════════════════════════
   LiveUpdate — notifyAppReady اختیاری
   در نسخه‌های جدید @capawesome/capacitor-live-update
   این متد وجود ندارد و پلاگین خودش مدیریت می‌کند
   ═══════════════════════════════════════════════════════ */

async function notifyLiveUpdateReady(): Promise<void> {
  try {
    const w = window as any;
    if (!w.Capacitor?.isNativePlatform?.()) return;

    const LU = w.Capacitor?.Plugins?.LiveUpdate;
    if (!LU) return;

    // فقط اگر متد وجود داشت صدا بزن (نسخه‌های قدیمی)
    if (typeof LU.notifyAppReady === 'function') {
      await LU.notifyAppReady();
      console.log('[LiveUpdate] notifyAppReady ✓');
    }
  } catch (err) {
    console.warn('[LiveUpdate] notify ready:', err);
  }
}

notifyLiveUpdateReady();
installGlobalHandlers();



/* ═══════════════════════════════════════════════════════ */

const router = createRouter({
  routeTree,
  defaultErrorComponent: AppErrorComponent,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function renderApp() {
  const rootElement = document.getElementById('root')!;
  if (!rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-center"
              dir="rtl"
              richColors
              closeButton
              expand
              visibleToasts={3}
              toastOptions={{
                style: { fontFamily: 'Vazirmatn, sans-serif', borderRadius: '12px' },
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }
}

// ═══ Bootstrap IndexedDB قبل از render ═══
(async () => {
  try {
    await bootstrapIndexedDB();
  } catch (err) {
    console.warn('[main] IDB bootstrap failed, using localStorage', err);
  }

  renderApp();
})();
