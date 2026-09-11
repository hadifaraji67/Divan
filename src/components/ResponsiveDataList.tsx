import React from 'react';

export interface DataColumn<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface ResponsiveDataListProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  keyExtractor: (item: T) => string | number;
  renderCardHeader?: (item: T) => React.ReactNode;
}

export function ResponsiveDataList<T>({
  data,
  columns,
  keyExtractor,
  renderCardHeader,
}: ResponsiveDataListProps<T>) {
  const getCellValue = (item: T, column: DataColumn<T>) => {
    if (typeof column.accessorKey === 'function') {
      return column.accessorKey(item);
    }
    return item[column.accessorKey] as React.ReactNode;
  };

  return (
    <div className="w-full dir-rtl">
      {/* Mobile Layout: Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2">
            {renderCardHeader && <div className="pb-2 border-b font-semibold">{renderCardHeader(item)}</div>}
            <div className="space-y-1.5">
              {columns.map((col, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-0.5">
                  <span className="text-muted-foreground font-medium">{col.header}:</span>
                  <span className="font-semibold text-foreground">{getCellValue(item, col)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout: Standard Table View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm text-right">
          <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-muted/30 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                    {getCellValue(item, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
