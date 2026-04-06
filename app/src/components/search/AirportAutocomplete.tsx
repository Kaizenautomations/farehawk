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
          className="w-full justify-start font-normal"
        >
          {selected ? (
            <span>
              <span className="font-semibold">{selected.code}</span>{" "}
              <span className="text-muted-foreground">{selected.city}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search airports..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No airports found.</CommandEmpty>
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
                >
                  <span className="font-semibold">{airport.code}</span>
                  <span className="ml-2 text-muted-foreground">
                    {airport.city} - {airport.name}
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
