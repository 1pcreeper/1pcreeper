import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown, Search, X } from 'lucide-react';

export interface DropdownItem {
  value: string;
  label: string;
  meta?: string;
}

interface SearchableDropdownProps {
  placeholder: string;
  items: DropdownItem[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  label?: string;
  clearable?: boolean;
}

export function SearchableDropdown({
  placeholder,
  items,
  selected,
  onSelect,
  disabled,
  label,
  clearable = true,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((i) => i.value === selected);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = query.trim()
    ? items.filter(
      (i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.meta?.toLowerCase().includes(query.toLowerCase())
    )
    : items;

  const handleOpen = () => {
    if (disabled) return;
    setOpen((v) => !v);
    setQuery('');
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={label ? 'space-y-1' : ''} ref={ref}>
      {label && <Label className="text-xs">{label}</Label>}
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white transition-colors ${disabled
            ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
            : 'border-slate-300 hover:border-slate-400 cursor-pointer text-slate-900'
            } ${open ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
        >
          <span className={selectedItem ? 'text-slate-900' : 'text-slate-400'}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {selected && clearable && !disabled && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onSelect(''); }}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-slate-400 text-center">No results found</div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelect(item.value)}
                    className={`w-full text-left px-3 py-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis hover:cursor-pointer bg-slate-50 transition-colors ${item.value === selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-900'
                      }`}
                  >
                    <div>{item.label}</div>
                    {item.meta && <div className="text-xs text-slate-400 mt-0.5 truncate">{item.meta}</div>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
