"use client";

import { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
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
  IN: "\u{1F1EE}\u{1F1F3}",
  CN: "\u{1F1E8}\u{1F1F3}",
  KR: "\u{1F1F0}\u{1F1F7}",
  SG: "\u{1F1F8}\u{1F1EC}",
  HK: "\u{1F1ED}\u{1F1F0}",
  TH: "\u{1F1F9}\u{1F1ED}",
  PT: "\u{1F1F5}\u{1F1F9}",
  IE: "\u{1F1EE}\u{1F1EA}",
  IS: "\u{1F1EE}\u{1F1F8}",
  CU: "\u{1F1E8}\u{1F1FA}",
  DO: "\u{1F1E9}\u{1F1F4}",
  JM: "\u{1F1EF}\u{1F1F2}",
  CO: "\u{1F1E8}\u{1F1F4}",
  PE: "\u{1F1F5}\u{1F1EA}",
  CL: "\u{1F1E8}\u{1F1F1}",
  AR: "\u{1F1E6}\u{1F1F7}",
  TR: "\u{1F1F9}\u{1F1F7}",
  GR: "\u{1F1EC}\u{1F1F7}",
  HR: "\u{1F1ED}\u{1F1F7}",
  IL: "\u{1F1EE}\u{1F1F1}",
  EG: "\u{1F1EA}\u{1F1EC}",
  MA: "\u{1F1F2}\u{1F1E6}",
  ZA: "\u{1F1FF}\u{1F1E6}",
  KE: "\u{1F1F0}\u{1F1EA}",
  NZ: "\u{1F1F3}\u{1F1FF}",
  FI: "\u{1F1EB}\u{1F1EE}",
  SE: "\u{1F1F8}\u{1F1EA}",
  NO: "\u{1F1F3}\u{1F1F4}",
  DK: "\u{1F1E9}\u{1F1F0}",
  CH: "\u{1F1E8}\u{1F1ED}",
  AT: "\u{1F1E6}\u{1F1F9}",
  PL: "\u{1F1F5}\u{1F1F1}",
  CZ: "\u{1F1E8}\u{1F1FF}",
  PH: "\u{1F1F5}\u{1F1ED}",
  TW: "\u{1F1F9}\u{1F1FC}",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "\u{2708}\u{FE0F}";
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-blue-400 font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Airport",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return POPULAR_AIRPORTS.slice(0, 20);
    const q = search.toLowerCase();
    return POPULAR_AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [search]);

  const selected = POPULAR_AIRPORTS.find((a) => a.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-start font-normal bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white h-11"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="text-base">{getFlag(selected.country)}</span>
              <span className="font-semibold text-white">{selected.code}</span>
              <span className="text-slate-400 truncate">{selected.city}</span>
            </span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0 bg-slate-900 border-slate-700 shadow-xl shadow-black/20"
        align="start"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            placeholder="Search airports..."
            value={search}
            onValueChange={setSearch}
            className="text-white"
          />
          <CommandList className="max-h-[280px]">
            <CommandEmpty className="py-6 text-center text-slate-500">
              No airports found.
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={() => {
                    onChange(airport.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-800 data-[selected=true]:bg-slate-800 text-slate-300"
                >
                  <span className="text-base flex-shrink-0">
                    {getFlag(airport.country)}
                  </span>
                  <span className="font-semibold text-white flex-shrink-0">
                    {highlightMatch(airport.code, search)}
                  </span>
                  <span className="text-slate-400 truncate">
                    {highlightMatch(airport.city, search)} -{" "}
                    {highlightMatch(airport.name, search)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
