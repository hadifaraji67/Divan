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
