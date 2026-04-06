"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { POPULAR_AIRPORTS } from "@/lib/airports";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  CA: "\u{1F1E8}\u{1F1E6}",
  US: "\u{1F1FA}\u{1F1F8}",
  GB: "\u{1F1EC}\u{1F1E7}",
  MX: "\u{1F1F2}\u{1F1FD}",
  FR: "\u{1F1EB}\u{1F1F7}",
  DE: "\u{1F1E9}\u{1F1EA}",
  JP: "\u{1F1EF}\u{1F1F5}",
  AU: "\u{1F1E6}\u{1F1FA}",
  AE: "\u{1F1E6}\u{1F1EA}",
  NL: "\u{1F1F3}\u{1F1F1}",
  ES: "\u{1F1EA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}",
  BR: "\u{1F1E7}\u{1F1F7}",
  KR: "\u{1F1F0}\u{1F1F7}",
  SG: "\u{1F1F8}\u{1F1EC}",
  HK: "\u{1F1ED}\u{1F1F0}",
  TH: "\u{1F1F9}\u{1F1ED}",
  PT: "\u{1F1F5}\u{1F1F9}",
  IE: "\u{1F1EE}\u{1F1EA}",
  TR: "\u{1F1F9}\u{1F1F7}",
  CH: "\u{1F1E8}\u{1F1ED}",
  AT: "\u{1F1E6}\u{1F1F9}",
  SE: "\u{1F1F8}\u{1F1EA}",
  NO: "\u{1F1F3}\u{1F1F4}",
  DK: "\u{1F1E9}\u{1F1F0}",
  NZ: "\u{1F1F3}\u{1F1FF}",
  IN: "\u{1F1EE}\u{1F1F3}",
  CN: "\u{1F1E8}\u{1F1F3}",
  CU: "\u{1F1E8}\u{1F1FA}",
  DO: "\u{1F1E9}\u{1F1F4}",
  JM: "\u{1F1EF}\u{1F1F2}",
  CO: "\u{1F1E8}\u{1F1F4}",
  AR: "\u{1F1E6}\u{1F1F7}",
  CL: "\u{1F1E8}\u{1F1F1}",
  PE: "\u{1F1F5}\u{1F1EA}",
  PH: "\u{1F1F5}\u{1F1ED}",
  GR: "\u{1F1EC}\u{1F1F7}",
  IL: "\u{1F1EE}\u{1F1F1}",
  EG: "\u{1F1EA}\u{1F1EC}",
  ZA: "\u{1F1FF}\u{1F1E6}",
  FI: "\u{1F1EB}\u{1F1EE}",
  PL: "\u{1F1F5}\u{1F1F1}",
  HR: "\u{1F1ED}\u{1F1F7}",
  TW: "\u{1F1F9}\u{1F1FC}",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "\u{2708}\u{FE0F}";
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
