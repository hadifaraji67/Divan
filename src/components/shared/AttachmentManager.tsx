import React, { useRef, useState } from 'react';
import { Paperclip, Camera as CameraIcon, X, FileText, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import type { Attachment } from '../../types/models';
import {
  saveAttachment,
  deleteAttachmentFile,
  readAttachment,
  fileToBase64,
  captureFromCamera,
  isAttachmentCapacitor,
} from '../../lib/attachments';
import { notify } from '../../lib/toast';

interface Props {
  scopeId: string;
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AttachmentManager: React.FC<Props> = ({ scopeId, attachments, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const showCamera = isAttachmentCapacitor();

  const addFromFile = async (file: File) => {
    setBusy(true);
    try {
      const { base64, mimeType, fileName } = await fileToBase64(file);
      const att = await saveAttachment(scopeId || 'draft', fileName, mimeType, base64);
      if (att) {
        onChange([...attachments, att]);
        notify.success('پیوست اضافه شد');
      } else {
        notify.error('ذخیره پیوست ناموفق بود');
      }
    } catch {
      notify.error('خطا در پردازش فایل');
    } finally {
      setBusy(false);
    }
  };

  const addFromCamera = async () => {
    setBusy(true);
    try {
      const captured = await captureFromCamera();
      if (!captured) { setBusy(false); return; }
      const att = await saveAttachment(scopeId || 'draft', captured.fileName, captured.mimeType, captured.base64);
      if (att) {
        onChange([...attachments, att]);
        notify.success('عکس اضافه شد');
      } else {
        notify.error('ذخیره عکس ناموفق بود');
      }
    } catch {
      notify.error('خطا در گرفتن عکس');
    } finally {
      setBusy(false);
    }
  };

  const removeAttachment = async (att: Attachment) => {
    if (!confirm(`«${att.fileName}» حذف شود؟`)) return;
    await deleteAttachmentFile(att);
    onChange(attachments.filter(a => a.id !== att.id));
  };

  const openAttachment = async (att: Attachment) => {
    const url = await readAttachment(att);
    if (!url) { notify.error('باز کردن فایل ناموفق بود'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (!url.startsWith('http')) a.download = att.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mt-3 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold flex items-center gap-1.5">
          <Paperclip className="w-4 h-4" /> پیوست‌ها {attachments.length > 0 && `(${attachments.length.toLocaleString('fa-IR')})`}
        </span>
        <div className="flex gap-2">
          {showCamera && (
            <button
              type="button"
              onClick={addFromCamera}
              disabled={busy}
              className="p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-50"
              title="گرفتن عکس"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 disabled:opacity-50"
            title="افزودن فایل"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addFromFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs opacity-50">هنوز پیوستی اضافه نشده — عکس رسید یا فایل PDF می‌توانید اضافه کنید.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {attachments.map(att => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-xs max-w-[220px]"
            >
              {att.mimeType.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5 shrink-0 opacity-60" />
              ) : (
                <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
              )}
              <button
                type="button"
                onClick={() => openAttachment(att)}
                className="truncate hover:underline text-right flex-1"
                title={att.fileName}
              >
                {att.fileName}
              </button>
              <span className="opacity-40 shrink-0">{formatSize(att.size)}</span>
              <button
                type="button"
                onClick={() => openAttachment(att)}
                className="shrink-0 opacity-60 hover:opacity-100"
                title="دانلود/مشاهده"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeAttachment(att)}
                className="shrink-0 opacity-60 hover:opacity-100 hover:text-rose-600"
                title="حذف"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
