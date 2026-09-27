import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';


interface Option {
    id: number;
    label: string;
}

interface DropdownSearchProps {
    value: number | null;
    onChange: (value: number) => void;
    fetchData: (search: string, page: number) => Promise<{ content: Option[], totalPages: number }>;
    placeholder?: string;
    disabled?: boolean;
    initialLabel?: string;
}

export function DropdownSearch({ value, onChange, fetchData, placeholder = "Search...", disabled = false, initialLabel = "" }: DropdownSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(initialLabel);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Simple useClickAway equivalent if the hook is missing (we will create it or use inline logic)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadOptions = async (searchValue: string, pageNum: number, append: boolean = false) => {
        setIsLoading(true);
        try {
            const data = await fetchData(searchValue, pageNum);
            setOptions(prev => append ? [...prev, ...data.content] : data.content);
            setTotalPages(data.totalPages);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to load options", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadOptions(search, 0);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                loadOptions(search, 0);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [search]);

    const handleSelect = (opt: Option) => {
        onChange(opt.id);
        setSelectedLabel(opt.label);
        setIsOpen(false);
        setSearch("");
    };

    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 10;
        if (bottom && !isLoading && page + 1 < totalPages) {
            loadOptions(search, page + 1, true);
        }
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            >
                <span className={`truncate ${!value && !selectedLabel ? 'text-slate-400' : 'text-slate-700'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-md z-10 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full text-xs bg-transparent focus:outline-none"
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <ul 
                        className="max-h-48 overflow-y-auto py-1"
                        onScroll={handleScroll}
                    >
                        {options.length === 0 && !isLoading && (
                            <li className="px-3 py-2 text-xs text-slate-500 text-center">No results found</li>
                        )}
                        {options.map((opt) => (
                            <li
                                key={opt.id}
                                onClick={() => handleSelect(opt)}
                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${value === opt.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}
                            >
                                {opt.label}
                            </li>
                        ))}
                        {isLoading && (
                            <li className="px-3 py-2 flex justify-center">
                                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
