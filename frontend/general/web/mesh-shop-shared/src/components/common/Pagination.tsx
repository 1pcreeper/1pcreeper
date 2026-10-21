import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PageRequestDTO, PaginationBaseResponseDTO } from "../../models/dto/base.dto";
import { useAsync } from "../../hooks/useAsync";
export function Pagination({
    data,
    onPage,
    busy = false,
    label = "Results",
}: {
    data?: PaginationBaseResponseDTO<unknown>;
    onPage: (page: number) => void;
    busy?: boolean;
    label?: string;
}) {
    if (!data) return null;
    return (
        <nav className="pagination" aria-label={`${label} pagination`}>
            <span>
                {data.totalElements.toLocaleString()} results · {data.totalPages ? data.pageNumber + 1 : 0} /{" "}
                {data.totalPages}
            </span>
            <button
                className="icon-button"
                aria-label={`Previous ${label.toLowerCase()} page`}
                disabled={busy || data.pageNumber === 0}
                onClick={() => onPage(data.pageNumber - 1)}
            >
                <ChevronLeft size={17} />
            </button>
            <button
                className="icon-button"
                aria-label={`Next ${label.toLowerCase()} page`}
                disabled={busy || data.pageNumber + 1 >= data.totalPages}
                onClick={() => onPage(data.pageNumber + 1)}
            >
                <ChevronRight size={17} />
            </button>
        </nav>
    );
}
export interface SelectOption {
    id: string;
    name: string;
    detail?: string;
}
export function PagedSelect({
    label,
    value,
    selectedLabel,
    load,
    onChange,
    placeholder = "Choose an option",
    required = false,
    disabled = false,
}: {
    label: string;
    value?: string;
    selectedLabel?: string;
    load: (query: PageRequestDTO) => Promise<PaginationBaseResponseDTO<SelectOption>>;
    onChange: (option?: SelectOption) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false),
        [search, setSearch] = useState(""),
        [page, setPage] = useState(0),
        [chosen, setChosen] = useState<SelectOption>();
    const root = useRef<HTMLDivElement>(null),
        menu = useRef<HTMLDivElement>(null);
    const [anchor, setAnchor] = useState<{
        left: number;
        top: number;
        width: number;
        maxHeight: number;
        mount: Element;
    }>();
    useLayoutEffect(() => {
        if (!open || !root.current) return;
        const rect = root.current.getBoundingClientRect(),
            height = Math.min(350, window.innerHeight - 24),
            width = Math.min(Math.max(220, rect.width), window.innerWidth - 24);
        setAnchor({
            left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
            top: Math.max(12, rect.bottom + height + 6 <= window.innerHeight ? rect.bottom + 6 : rect.top - height - 6),
            width,
            maxHeight: height,
            mount: root.current.closest("dialog") || document.body,
        });
    }, [open]);
    const loader = useRef(load);
    loader.current = load;
    const result = useAsync(
        () => (open ? loader.current({ page, size: 10, search }) : Promise.resolve(undefined)),
        [open, page, search, load],
    );
    useEffect(() => {
        const outside = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node))
                setOpen(false);
        };
        document.addEventListener("pointerdown", outside);
        return () => document.removeEventListener("pointerdown", outside);
    }, []);
    return (
        <div
            className="paged-select"
            ref={root}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.stopPropagation();
                    setOpen(false);
                }
            }}
        >
            <span className="select-label">
                {label}
                {required ? " *" : ""}
            </span>
            <button
                type="button"
                className="select-trigger"
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => setOpen(!open)}
            >
                <span>
                    {value ? (chosen?.id === value ? chosen.name : selectedLabel || `Selected #${value}`) : placeholder}
                </span>
                <ChevronDown size={14} />
            </button>
            {open &&
                anchor &&
                createPortal(
                    <div
                        ref={menu}
                        style={{
                            position: "fixed",
                            left: anchor.left,
                            top: anchor.top,
                            width: anchor.width,
                            maxHeight: anchor.maxHeight,
                        }}
                        className="select-popover"
                        role="dialog"
                        aria-label={`Choose ${label.toLowerCase()}`}
                    >
                        <div className="search-input">
                            <Search size={15} />
                            <input
                                autoFocus
                                aria-label={`Search ${label.toLowerCase()}`}
                                placeholder="Search…"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(0);
                                }}
                            />
                        </div>
                        <div className="select-options" role="listbox" aria-label={`${label} options`}>
                            {!required && (
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={!value}
                                    onClick={() => {
                                        onChange(undefined);
                                        setChosen(undefined);
                                        setOpen(false);
                                    }}
                                >
                                    None
                                </button>
                            )}
                            {result.loading ? (
                                <p>Loading…</p>
                            ) : result.error ? (
                                <button type="button" onClick={result.reload}>
                                    Retry: {result.error}
                                </button>
                            ) : (
                                result.data?.content.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        role="option"
                                        aria-selected={value === option.id}
                                        onClick={() => {
                                            setChosen(option);
                                            onChange(option);
                                            setOpen(false);
                                        }}
                                    >
                                        <span>{option.name}</span>
                                        {option.detail && <small>{option.detail}</small>}
                                    </button>
                                ))
                            )}
                            {!result.loading && result.data?.content.length === 0 && <p>No matching results.</p>}
                        </div>
                        <Pagination data={result.data} onPage={setPage} busy={result.loading} label={label} />
                    </div>,
                    anchor.mount,
                )}
        </div>
    );
}
