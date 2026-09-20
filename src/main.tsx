import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AppErrorComponent } from './lib/error-component';
import { ThemeProvider } from './lib/theme-context';
import { Toaster } from 'sonner';
import './styles.css';

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

// ⚠️ اطلاع به LiveUpdate که اپ با موفقیت لود شد
(async () => {
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.Plugins?.LiveUpdate) {
    try {
      await w.Capacitor.Plugins.LiveUpdate.notifyAppReady();
      console.log('[LiveUpdate] notifyAppReady ✓');
    } catch (e) {
      console.warn('[LiveUpdate] notifyAppReady خطا:', e);
    }
  }
  // لاگ پلتفرم
  console.log('[Diwan] platform:', w.Capacitor?.platform, '| native:', w.Capacitor?.isNativePlatform?.());
})();

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
