import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '../components/Sidebar';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 dir-rtl font-sans">
      {/* رندر مستقیم سایدبار کشویی */}
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 text-slate-100">
        <Outlet />
      </main>
    </div>
  );
}
