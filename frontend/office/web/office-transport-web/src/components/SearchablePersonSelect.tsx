import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Check, ChevronDown, X, Phone, Mail, CreditCard, Shield } from 'lucide-react';
import PersonContentService from '../services/content/office/transport/PersonContentService.ts';
import { PersonSummaryDTO } from '../models/dto/office/transport/object.dto.ts';

interface SearchablePersonSelectProps {
  value?: string;
  onChange: (personUid: string, person?: PersonSummaryDTO) => void;
  required?: boolean;
  label?: string;
}

export function SearchablePersonSelect({
  value,
  onChange,
  required = false,
  label = "Registered Owner (Person)"
}: SearchablePersonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [persons, setPersons] = useState<PersonSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonSummaryDTO | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial or searched persons
  useEffect(() => {
    let active = true;
    const fetchPersons = async () => {
      setLoading(true);
      try {
        const list = await PersonContentService.getInstance().searchPersons(searchTerm);
        if (active) {
          setPersons(list);
          if (value && !selectedPerson) {
            const match = list.find(p => p.uid === value);
            if (match) setSelectedPerson(match);
          }
        }
      } catch (err) {
        console.warn("Failed to search persons:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchPersons, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, value]);

  // If value is set externally, resolve person
  useEffect(() => {
    if (value && (!selectedPerson || selectedPerson.uid !== value)) {
      const match = persons.find(p => p.uid === value);
      if (match) {
        setSelectedPerson(match);
      } else {
        PersonContentService.getInstance().findByUid(value).then(p => {
          if (p) setSelectedPerson(p);
        }).catch(() => {});
      }
    } else if (!value) {
      setSelectedPerson(null);
    }
  }, [value, persons]);

  const handleSelect = (p: PersonSummaryDTO) => {
    setSelectedPerson(p);
    onChange(p.uid || '', p);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPerson(null);
    onChange('', undefined);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Box or Selector trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] px-3 py-2 border border-zinc-300 rounded-md shadow-xs bg-white hover:border-zinc-400 focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex items-center justify-between transition-all"
      >
        {selectedPerson ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 text-sm">
                  {selectedPerson.nameEnglish || selectedPerson.nameChinese || 'Unknown Person'}
                </span>
                {selectedPerson.nameChinese && selectedPerson.nameEnglish && (
                  <span className="text-xs text-zinc-500">({selectedPerson.nameChinese})</span>
                )}
                {selectedPerson.hkId && (
                  <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded text-[11px] font-mono border border-zinc-200">
                    {selectedPerson.hkId}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400 truncate font-mono">
                UID: {selectedPerson.uid}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center text-zinc-400 text-sm">
            <User className="w-4 h-4 mr-2 text-zinc-400" />
            <span>Click to search and select person...</span>
          </div>
        )}

        <ChevronDown className={`w-4 h-4 text-zinc-400 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400 ml-1 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, HKID, mobile, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-xs focus:outline-hidden text-zinc-800 placeholder-zinc-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-zinc-400 hover:text-zinc-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-zinc-400">Loading persons...</div>
            ) : persons.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                No persons found matching &quot;{searchTerm}&quot;.
              </div>
            ) : (
              persons.map((p) => {
                const isSelected = selectedPerson?.uid === p.uid;
                return (
                  <div
                    key={p.uid}
                    onClick={() => handleSelect(p)}
                    className={`p-3 flex items-start justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 text-xs sm:text-sm truncate">
                            {p.nameEnglish || 'Person'} {p.nameChinese && <span className="text-zinc-500 font-normal">({p.nameChinese})</span>}
                          </span>
                          {p.hkId && (
                            <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded text-[10px] font-mono border border-zinc-200">
                              {p.hkId}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-zinc-500">
                          {p.mobileTel && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              {p.mobileTel}
                            </span>
                          )}
                          {p.email && (
                            <span className="flex items-center gap-1 truncate max-w-[160px]">
                              <Mail className="w-3 h-3 text-zinc-400" />
                              {p.email}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          UID: {p.uid}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
