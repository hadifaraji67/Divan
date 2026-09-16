import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppErrorComponent } from '../lib/error-component';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: AppErrorComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">۴۰۴</h1>
        <p className="text-sm opacity-60 mb-4">صفحه یافت نشد</p>
        <a href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          بازگشت به خانه
        </a>
      </div>
    </div>
  ),
});

function RootComponent() {
  return <Outlet />;
}
