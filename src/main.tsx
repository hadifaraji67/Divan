import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AppErrorComponent } from './lib/error-component';
import { ThemeProvider } from './lib/theme-context';
import { Toaster } from 'sonner';
import { installGlobalHandlers, logInfo, logError } from './lib/error-logger';
import './styles.css';

/* ═══════════════════════════════════════════════════════
   ⚠️ CRITICAL: notifyAppReady باید قبل از هر چیز اجرا شود
   ═══════════════════════════════════════════════════════ */

async function notifyLiveUpdateReady(): Promise<void> {
  const w = window as any;
  if (!w.Capacitor?.isNativePlatform?.()) return;

  const LiveUpdate = w.Capacitor?.Plugins?.LiveUpdate;
  if (!LiveUpdate?.notifyAppReady) {
    logInfo('liveupdate', 'plugin نیست');
    return;
  }

  // تلاش ۲۰ بار با فاصله ۱۰۰ms — کل ۲ ثانیه
  for (let i = 0; i < 20; i++) {
    try {
      await LiveUpdate.notifyAppReady();
      logInfo('liveupdate', `notifyAppReady موفق (تلاش ${i + 1})`);

      // ثبت bundle فعال
      try {
        const curr = await LiveUpdate.getCurrentBundle?.();
        logInfo('liveupdate', 'bundle فعال', curr);
      } catch {}
      return;
    } catch (err: any) {
      if (i === 19) {
        logError('liveupdate', 'notifyAppReady ناموفق بعد از ۲۰ تلاش', {}, err);
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

// اجرای فوری — بدون انتظار
notifyLiveUpdateReady();

// نصب handler های سراسری
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

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
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
            style: {
              fontFamily: 'Vazirmatn, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
      </ThemeProvider>
    </React.StrictMode>
  );
}
