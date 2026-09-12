// ثبت سرویس ورکر با قابلیت بروزرسانی آنی و اجباری PWA
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // پاکسازی اجباری کش و رفرش خودکار صفحه PWA
                if (window.confirm('نسخه جدید دیوان آماده است. آیا مایل به بروزرسانی هستید؟')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      });
    });
  }
}
