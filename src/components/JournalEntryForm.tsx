import React, { useState } from 'react';
import { Account, JournalLine } from '../types/accounting';
import { isJournalEntryBalanced } from '../lib/accounting';

interface Props {
  accounts: Account[];
  onSave: (description: string, lines: JournalLine[]) => void;
}

export const JournalEntryForm: React.FC<Props> = ({ accounts, onSave }) => {
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountId: '', description: '', debit: 0, credit: 0 },
    { id: '2', accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const isBalanced = isJournalEntryBalanced(lines);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return alert('سند تراز نیست! مجموع بدهکار و بستانکار باید برابر باشد.');
    onSave(description, lines);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-card space-y-4 dir-rtl text-right">
      <h3 className="text-lg font-bold">ثبت سند حسابداری دستی</h3>
      <input
        type="text"
        placeholder="شرح کلی سند"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded-md bg-background"
        required
      />

      <div className="space-y-2">
        {lines.map((line) => (
          <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
            <select
              value={line.accountId}
              onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
              className="col-span-4 p-2 border rounded-md bg-background text-sm"
              required
            >
              <option value="">انتخاب حساب...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="شرح سطر"
              value={line.description}
              onChange={(e) => updateLine(line.id, 'description', e.target.value)}
              className="col-span-4 p-2 border rounded-md bg-background text-sm"
            />
            <input
              type="number"
              placeholder="بدهکار"
              value={line.debit || ''}
              onChange={(e) => updateLine(line.id, 'debit', Number(e.target.value))}
              className="col-span-2 p-2 border rounded-md bg-background text-sm text-left"
            />
            <input
              type="number"
              placeholder="بستانکار"
              value={line.credit || ''}
              onChange={(e) => updateLine(line.id, 'credit', Number(e.target.value))}
              className="col-span-2 p-2 border rounded-md bg-background text-sm text-left"
            />
          </div>
        ))}
      </div>

      <button type="button" onClick={addLine} className="text-sm text-primary underline">
        + افزودن سطر جدید
      </button>

      <div className="flex justify-between items-center pt-2 border-t text-sm font-semibold">
        <div>مجموع بدهکار: {totalDebit.toLocaleString('fa-IR')} تومان</div>
        <div>مجموع بستانکار: {totalCredit.toLocaleString('fa-IR')} تومان</div>
        <div className={isBalanced ? 'text-green-600' : 'text-destructive'}>
          {isBalanced ? '✔ سند تراز است' : '✖ سند عدم تراز دارد'}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isBalanced || !description}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
      >
        ثبت نهایی سند
      </button>
    </form>
  );
};
