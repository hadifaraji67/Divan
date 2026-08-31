import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { OfflineCache } from "@/components/offline-cache";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "دیوان - سامانه جامع حسابداری";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#1b3654" },
      {
        name: "description",
        content: "سامانه جامع حسابداری دیوان — صدور پیش‌فاکتور، مدیریت مشتریان و کالاها",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="fa" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <OfflineCache />
        <div className="app-shell">
          <Outlet />
        </div>
        <Toaster position="top-center" dir="rtl" richColors closeButton />
        <Scripts />
      </body>
    </html>
  ),
});
