import { readFileSync, writeFileSync } from 'node:fs';

const file = 'vite.config.ts';
let src = readFileSync(file, 'utf8');

const before = `  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});`;

const after = `  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("html2canvas")) return "vendor-html2canvas";
          if (id.includes("qrcode")) return "vendor-qrcode";
          if (id.includes("@capacitor")) return "vendor-capacitor";
          if (id.includes("react-dom") || /\\/react\\//.test(id)) return "vendor-react";
          if (id.includes("@tanstack/react-router")) return "vendor-router";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("sonner")) return "vendor-toast";
          return "vendor";
        },
      },
    },
  },
});`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ vite.config.ts — manualChunks اضافه شد');
} else {
  console.log('❌ بلوک build پیدا نشد');
  process.exit(1);
}
