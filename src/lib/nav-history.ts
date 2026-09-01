// Central counter of how many in-app history states we've pushed (one per
// view change or open dialog/sidebar/menu — see goTo() in invoice-app.tsx
// and useBackableOpen()). The hardware back button listener uses this to
// decide "navigate back inside the app" vs "nothing left, exit the app",
// instead of trusting the native WebView's own canGoBack()/goBack(), which
// doesn't reliably track client-side pushState() navigations.
let depth = 0;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    if (depth > 0) depth--;
  });
}

export function pushNav(state: unknown) {
  window.history.pushState(state, "");
  depth++;
}

export function navDepth() {
  return depth;
}
