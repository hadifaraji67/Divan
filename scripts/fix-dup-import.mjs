import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/print/InvoicePrintPro.tsx';
let src = readFileSync(file, 'utf8');

// حذف import تکراری Share2 از خط دوم
src = src.replace(
  "import { MessageCircle, Send, Share2 } from 'lucide-react';",
  "import { MessageCircle, Send } from 'lucide-react';"
);

// اطمینان از اینکه Share2 در import اول هست
if (!src.includes("Share2") || !src.includes("X, Printer, Image as ImageIcon, Share2")) {
  src = src.replace(
    "import { X, Printer, Image as ImageIcon } from 'lucide-react';",
    "import { X, Printer, Image as ImageIcon, Share2 } from 'lucide-react';"
  );
}

writeFileSync(file, src);
console.log('✅ InvoicePrintPro.tsx — import تکراری حذف شد');
