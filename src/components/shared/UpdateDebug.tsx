import React, { useState } from 'react';

declare const __APP_VERSION__: string;

export const UpdateDebug: React.FC = () => {
  const [log, setLog] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const lines: string[] = [];
    const w = window as any;

    try {
      lines.push(`=== ENV ===`);
      lines.push(`APP_VERSION: ${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?'}`);
      lines.push(`Capacitor global: ${!!w.Capacitor}`);
      lines.push(`isNativePlatform(): ${w.Capacitor?.isNativePlatform?.()}`);
      lines.push(`platform: ${w.Capacitor?.platform}`);
      lines.push(`userAgent: ${navigator.userAgent.slice(0, 80)}`);

      lines.push('');
      lines.push(`=== API fetch ===`);
      const url = 'https://api.github.com/repos/hadifaraji67/Divan/releases?per_page=3';
      lines.push(`URL: ${url}`);

      const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-cache',
      });
      lines.push(`status: ${res.status}`);
      lines.push(`ok: ${res.ok}`);

      if (res.ok) {
        const releases = await res.json();
        lines.push(`releases count: ${releases.length}`);
        releases.slice(0, 3).forEach((r: any, i: number) => {
          lines.push(`  [${i}] ${r.tag_name} | prerelease: ${r.prerelease}`);
        });

        // اولین release با manifest
        const rel = releases.find((r: any) =>
          r.assets?.some((a: any) => a.name === 'manifest.json')
        );

        if (rel) {
          lines.push('');
          lines.push(`=== Manifest ===`);
          lines.push(`release: ${rel.tag_name}`);
          const asset = rel.assets.find((a: any) => a.name === 'manifest.json');
          lines.push(`manifest URL: ${asset.browser_download_url.slice(0, 60)}...`);

          const mRes = await fetch(asset.browser_download_url, { cache: 'no-cache' });
          lines.push(`manifest status: ${mRes.status}`);

          if (mRes.ok) {
            const manifest = await mRes.json();
            lines.push(`manifest.version: ${manifest.version}`);
            lines.push(`compareVersions('${manifest.version}', '${APP_VERSION}'): …`);
          }
        } else {
          lines.push('manifest asset: NOT FOUND in any release');
        }
      }
    } catch (err: any) {
      lines.push('');
      lines.push(`❌ ERROR: ${err?.message}`);
      lines.push(`name: ${err?.name}`);
      lines.push(`stack: ${err?.stack?.slice(0, 200)}`);
    }

    setLog(lines.join('\n'));
    setBusy(false);
  };

  return (
    <div className="mt-4 p-3 rounded-xl border-2 border-rose-500/50 bg-rose-500/5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
          🐛 دیباگ OTA
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg"
        >
          {busy ? '...' : 'اجرا'}
        </button>
      </div>
      {log && (
        <pre className="text-[10px] leading-relaxed whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-2 rounded border max-h-96 overflow-auto" dir="ltr">
          {log}
        </pre>
      )}
    </div>
  );
};

export default UpdateDebug;
