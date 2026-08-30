import { Smartphone } from "lucide-react";

/**
 * This app is designed for mobile only. On any screen wider than the
 * `md` breakpoint (768px) we hide the real app and show this notice
 * instead — pure CSS (`md:hidden` / `hidden md:flex`), no JS/user-agent
 * sniffing, so it can't be spoofed or cause hydration mismatches, and it
 * still reacts live if a desktop window is resized down.
 */
export function DesktopBlockNotice() {
  return (
    <div className="no-print fixed inset-0 z-50 hidden flex-col items-center justify-center gap-4 bg-background px-6 text-center md:flex">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Smartphone className="size-8" />
      </div>
      <h1 className="text-xl font-semibold">فقط روی موبایل قابل استفاده است</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        این برنامه فقط برای نمایشگر گوشی موبایل طراحی شده. لطفاً این صفحه را با
        مرورگر گوشی خود باز کنید، یا پنجرهٔ مرورگر را باریک‌تر کنید.
      </p>
    </div>
  );
}
