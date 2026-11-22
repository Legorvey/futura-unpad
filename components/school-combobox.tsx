"use client";

import * as React from "react";
import { ChevronsUpDown, Loader2, Search, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InstitutionType =
  | "SD"
  | "SMP"
  | "SMA"
  | "SMK"
  | "perguruan_tinggi"
  | "umum";

interface SchoolItem {
  id: string;
  label: string;
  city?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const INSTITUTION_TYPE_OPTIONS: {
  value: InstitutionType;
  label: string;
  sublabel: string;
}[] = [
    { value: "SD", label: "SD", sublabel: "Sekolah Dasar" },
    { value: "SMP", label: "SMP", sublabel: "Sekolah Menengah Pertama" },
    { value: "SMA", label: "SMA", sublabel: "Sekolah Menengah Atas" },
    { value: "SMK", label: "SMK", sublabel: "Sekolah Menengah Kejuruan" },
    {
      value: "perguruan_tinggi",
      label: "Perguruan Tinggi",
      sublabel: "Universitas / Institut / Politeknik",
    },
    {
      value: "umum",
      label: "Umum",
      sublabel: "Instansi / Komunitas / Individu",
    },
  ];

export const SEARCHABLE_TYPES: InstitutionType[] = ["SD", "SMP", "SMA", "SMK"];

function parseItems(raw: unknown[]): SchoolItem[] {
  return raw.map((item: any) => ({
    id:
      item.npsn ||
      item.id ||
      `${item.sekolah ?? "?"}-${item.kecamatan ?? Math.random()}`,
    label: item.sekolah ?? item.nama ?? String(item),
    city:
      item.kabupaten_kota || item.kab_kota || item.propinsi || undefined,
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SchoolComboboxProps {
  /** The stored institution name string */
  value?: string;
  onChange: (value: string) => void;
  /** The jenjang to filter by (SD / SMP / SMA / SMK) */
  institutionType: InstitutionType;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// ─── Searchable Combobox (SD / SMP / SMA / SMK) ───────────────────────────────

export function SchoolCombobox({
  value = "",
  onChange,
  institutionType,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SchoolComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SchoolItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const jenjang = institutionType.toLowerCase();

  // Reset when query or jenjang changes
  React.useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(false);
    setSelectedIndex(-1);
  }, [query, institutionType]);

  // Debounced search (page 1)
  React.useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (query.trim().length < 3) {
      setResults([]);
      setHasMore(false);
      setSelectedIndex(-1);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/schools/search?q=${encodeURIComponent(query)}&jenjang=${jenjang}&page=1&perPage=10`;
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const body = await res.json();
          if (active) {
            setResults(parseItems(body?.data ?? []));
            setHasMore(body?.hasMore ?? false);
            setPage(1);
            setSelectedIndex(-1);
          }
        }
      } catch (err: any) {
        if (active && err.name !== 'AbortError') setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 400);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, jenjang]);

  // Load more pages
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const url = `/api/schools/search?q=${encodeURIComponent(query)}&jenjang=${jenjang}&page=${nextPage}&perPage=10`;
      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        setResults((prev) => [...prev, ...parseItems(body?.data ?? [])]);
        setHasMore(body?.hasMore ?? false);
        setPage(nextPage);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  };

  // Focus search input on open; reset on close
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setHasMore(false);
      setPage(1);
      setSelectedIndex(-1);
    }
  }, [open]);

  const showHint = query.trim().length < 3;
  const showManualOption = query.trim().length >= 3;
  const showResults = results.length > 0;
  const isFilled = !!value;

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full cursor-pointer items-center justify-between rounded-[8px] border border-input px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            ariaInvalid && "border-destructive ring-3 ring-destructive/20",
            "bg-slate-100/50 dark:bg-input/30"
          )}
        >
          <span className={cn("flex-1 truncate text-left", !value && "text-muted-foreground")}>
            {value || "Pilih atau cari nama sekolah..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 gap-0 shadow-lg bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-200 z-50"
        align="start"
        sideOffset={4}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <input
            ref={inputRef}
            aria-label="Cari nama sekolah"
            className="flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
            placeholder="Ketik nama sekolah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                  onChange(results[selectedIndex].label);
                  setOpen(false);
                } else if (query.trim().length >= 3) {
                  onChange(query.trim());
                  setOpen(false);
                }
              }
            }}
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" aria-hidden="true" />
          )}
        </div>

        <div
          data-lenis-prevent=""
          className="max-h-64 overflow-y-auto overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {showHint && (
            <p className="px-3 py-4 text-center text-xs text-slate-600">
              Ketik minimal 3 karakter untuk mencari
            </p>
          )}
          {loading && (
            <p className="px-3 py-4 text-center text-xs text-slate-600">
              Mencari...
            </p>
          )}
          {showResults && (
            <ul role="listbox" className="p-1">
              {results.map((item, index) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={value === item.label}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.label);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-11 w-full cursor-pointer flex-col justify-center rounded-sm px-2.5 py-2 text-left text-sm transition-colors hover:bg-amber-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-inset",
                      value === item.label && "bg-amber-300 text-slate-950",
                      selectedIndex === index && "bg-amber-200/80 text-slate-950"
                    )}
                  >
                    <span className="font-medium leading-snug">
                      {item.label}
                    </span>
                    {item.city && (
                      <span className="text-xs text-slate-600">
                        {item.city}
                      </span>
                    )}
                  </button>
                </li>
              ))}

              {hasMore && (
                <li className="px-1 py-1">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-inset disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      "Muat lebih banyak..."
                    )}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
        {showManualOption && (
          <div className="space-y-2 p-2 border-t border-slate-200 bg-slate-50">
            <p className="px-1 text-xs text-slate-600">
              {results.length === 0 && !loading ? "Tidak ditemukan." : "Tidak ada di daftar?"} Masukkan nama secara manual:
            </p>
            <button
              type="button"
              onClick={() => {
                onChange(query.trim());
                setOpen(false);
              }}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-slate-900 transition-colors hover:bg-amber-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-inset"
            >
              <PlusCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span>
                Gunakan{" "}
                <span className="font-semibold">&ldquo;{query}&rdquo;</span>
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Plain text input (Perguruan Tinggi / Umum) ───────────────────────────────

export interface PlainInstitutionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function PlainInstitutionInput({
  value,
  onChange,
  disabled,
  placeholder,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: PlainInstitutionInputProps) {
  const isFilled = !!value;
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "h-11 rounded-[8px] bg-slate-100/50 dark:bg-input/30",
        "focus-visible:border-amber-300 focus-visible:ring-3 focus-visible:ring-amber-300/50"
      )}
    />
  );
}
