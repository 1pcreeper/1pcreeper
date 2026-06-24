import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

type Place = { id: string; name: string };

type SearchablePlaceSelectProps = {
  places: Place[];
  value: string;
  onChange: (value: string) => void;
};

export function SearchablePlaceSelect({ places, value, onChange }: SearchablePlaceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlaces = useMemo(() => {
    return places.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [places, searchTerm]);

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);

  const paginatedPlaces = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPlaces.slice(start, start + itemsPerPage);
  }, [filteredPlaces, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const selectedPlace = places.find(p => p.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 flex items-center justify-between cursor-pointer"
      >
        <span className="truncate">{selectedPlace?.name || 'Select a place...'}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-xl flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center">
             <Search className="w-3 h-3 text-slate-400 mr-2" />
             <input 
               type="text" 
               autoFocus
               value={searchTerm} 
               onChange={e => setSearchTerm(e.target.value)} 
               placeholder="Search..." 
               className="w-full text-xs bg-transparent focus:outline-none"
             />
          </div>
          <div className="max-h-48 overflow-y-auto">
             {paginatedPlaces.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { onChange(p.id); setIsOpen(false); }}
                  className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                >
                  {p.name}
                </div>
             ))}
             {paginatedPlaces.length === 0 && (
                <div className="p-3 text-xs text-slate-400 text-center">No places found</div>
             )}
          </div>
          
          {totalPages > 1 && (
            <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-slate-500 font-bold">
                PAGE {page} OF {totalPages}
              </span>
              <button 
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
