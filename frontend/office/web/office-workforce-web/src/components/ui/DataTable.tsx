import { ReactNode } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  // Pagination
  pageNumber?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onRowClick,
  emptyMessage = "No data found.",
  pageNumber = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className={`px-6 py-3 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
              {col.header}
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((row) => (
          <tr 
            key={row.id} 
            className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((col, idx) => (
              <td key={idx} className={`px-6 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                {col.cell ? col.cell(row) : col.accessorKey ? row[col.accessorKey] as ReactNode : null}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-6 py-3 text-right">
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-slate-500">
              {emptyMessage}
            </td>
          </tr>
        )}
        </tbody>
        </table>
      </div>
      
      {totalPages > 1 && onPageChange && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0">
          <span className="text-xs text-slate-500">
            Page {pageNumber} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="px-2 py-1 border border-slate-200 text-slate-600 rounded text-xs font-medium hover:bg-white disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="px-2 py-1 border border-slate-200 text-slate-600 rounded text-xs font-medium hover:bg-white disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
