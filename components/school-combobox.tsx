"use client";

import * as React from "react";
import { ChevronsUpDown, Loader2, Search, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SchoolItem {
  /** Unique key for React */
  id: string;
  /** School name as displayed */
  label: string;
  /** City / regency */
  city?: string;
}

export interface SchoolComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function SchoolCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Pilih atau cari institusi/sekolah...",
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SchoolComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SchoolItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/schools/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          const items: SchoolItem[] = (Array.isArray(data) ? data : []).map(
            (item: any) => ({
              id:
                item.npsn ||
                item.id ||
                `${item.sekolah}-${item.kecamatan ?? Math.random()}`,
              label: item.sekolah ?? item.nama ?? String(item),
              city:
                item.kabupaten_kota ||
                item.kab_kota ||
                item.propinsi ||
                undefined,
            })
          );
          setResults(items);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus the search input when the popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSelect = (label: string) => {
    onChange(label);
    setOpen(false);
  };

  const handleUseCustom = () => {
    if (query.trim()) {
      onChange(query.trim());
      setOpen(false);
    }
  };

  const showEmpty =
    !loading && query.trim().length >= 3 && results.length === 0;
  const showHint = query.trim().length < 3;
  const showResults = !loading && results.length > 0;

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
            // Match the look of FormTextField input
            "flex h-11 w-full items-center justify-between rounded-[8px] border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-amber-300 focus-visible:ring-3 focus-visible:ring-amber-300/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            ariaInvalid &&
              "border-destructive ring-3 ring-destructive/20",
            !value && "text-muted-foreground"
          )}
          onClick={() => setOpen(true)}
        >
          <span className="flex-1 truncate text-left">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Ketik nama sekolah/institusi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-60 overflow-y-auto">
          {/* Hint */}
          {showHint && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Ketik minimal 3 karakter untuk mencari
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Mencari...
            </p>
          )}

          {/* Empty + creatable */}
          {showEmpty && (
            <div className="space-y-2 p-2">
              <p className="px-1 text-xs text-muted-foreground">
                Tidak ditemukan di database. Gunakan teks kustom:
              </p>
              <button
                type="button"
                onClick={handleUseCustom}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <PlusCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Gunakan{" "}
                  <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                </span>
              </button>
            </div>
          )}

          {/* Results list */}
          {showResults && (
            <ul role="listbox" className="p-1">
              {results.map((item) => (
                <li key={item.id} role="option" aria-selected={value === item.label}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.label)}
                    className={cn(
                      "flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      value === item.label && "bg-accent/60"
                    )}
                  >
                    <span className="font-medium leading-snug">{item.label}</span>
                    {item.city && (
                      <span className="text-xs text-muted-foreground">
                        {item.city}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
