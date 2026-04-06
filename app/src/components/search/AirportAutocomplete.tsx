"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { POPULAR_AIRPORTS } from "@/lib/airports";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Generate flag emoji from 2-letter country code programmatically
function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "\u{2708}\u{FE0F}";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Airport",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return POPULAR_AIRPORTS.slice(0, 30);
    const q = search.toLowerCase();
    return POPULAR_AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [search]);

  const selected = POPULAR_AIRPORTS.find((a) => a.code === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger / display */}
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="flex h-11 min-h-[44px] w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 text-left text-sm hover:bg-slate-800 hover:border-slate-600 transition-colors"
        >
          {selected ? (
            <>
              <span className="text-base">{getFlag(selected.country)}</span>
              <span className="font-semibold text-white">{selected.code}</span>
              <span className="text-slate-400 truncate">{selected.city}</span>
            </>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setSearch("");
            }
            if (e.key === "Enter" && filtered.length > 0) {
              handleSelect(filtered[0].code);
            }
          }}
          placeholder="Search airports..."
          className="h-11 w-full rounded-lg border border-blue-500 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 outline-none ring-2 ring-blue-500/20"
          autoComplete="off"
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[240px] sm:max-h-[280px] overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/30 overscroll-contain">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-500">
              No airports found
            </div>
          ) : (
            filtered.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => handleSelect(airport.code)}
                className="flex w-full items-center gap-2.5 px-3 py-3 min-h-[44px] text-left text-sm hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-base shrink-0">
                  {getFlag(airport.country)}
                </span>
                <span className="font-semibold text-white shrink-0">
                  {airport.code}
                </span>
                <span className="text-slate-400 truncate">
                  {airport.city} - {airport.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
