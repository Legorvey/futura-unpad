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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const jenjang = institutionType.toLowerCase();

  // Reset when query or jenjang changes
  React.useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(false);
  }, [query, institutionType]);

  // Debounced search — page 1
  React.useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setHasMore(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/schools/search?q=${encodeURIComponent(query)}&jenjang=${jenjang}&page=1&perPage=10`;
        const res = await fetch(url);
        if (res.ok) {
          const body = await res.json();
          setResults(parseItems(body?.data ?? []));
          setHasMore(body?.hasMore ?? false);
          setPage(1);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
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
    }
  }, [open]);

  const showHint = query.trim().length < 3;
  const showEmpty =
    !loading && query.trim().length >= 3 && results.length === 0;
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
            "flex h-11 w-full items-center justify-between rounded-[8px] border border-input px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-amber-300 focus-visible:ring-3 focus-visible:ring-amber-300/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            ariaInvalid && "border-destructive ring-3 ring-destructive/20",
            "bg-slate-100/50 dark:bg-input/30"
          )}
        >
          <span className={cn("flex-1 truncate text-left", !value && "text-muted-foreground")}>
            {value || "Pilih atau cari nama sekolah..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 gap-0 shadow-lg bg-white dark:bg-white dark:text-slate-900"
        align="start"
        sideOffset={4}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-border dark:border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Ketik nama sekolah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {showHint && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Ketik minimal 3 karakter untuk mencari
            </p>
          )}
          {loading && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Mencari...
            </p>
          )}
          {showEmpty && (
            <div className="space-y-2 p-2">
              <p className="px-1 text-xs text-muted-foreground">
                Tidak ditemukan. Masukkan nama secara manual:
              </p>
              <button
                type="button"
                onClick={() => {
                  onChange(query.trim());
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-yellow-500 hover:text-black"
              >
                <PlusCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Gunakan{" "}
                  <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                </span>
              </button>
            </div>
          )}
          {showResults && (
            <ul role="listbox" className="p-1">
              {results.map((item) => (
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
                      "flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-yellow-500 hover:text-black",
                      value === item.label && "bg-yellow-500 text-black"
                    )}
                  >
                    <span className="font-medium leading-snug">
                      {item.label}
                    </span>
                    {item.city && (
                      <span className="text-xs text-muted-foreground">
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
                    className="flex w-full items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-xs text-primary transition-colors hover:bg-yellow-500 hover:text-black disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Muat lebih banyak..."
                    )}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
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
