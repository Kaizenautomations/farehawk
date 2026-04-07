"use client";

import { useState } from "react";
import { CalendarDays, Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DealScoreBadge } from "@/components/search/DealScoreBadge";
import { useCurrency } from "@/hooks/useCurrency";

interface WeekendGetaway {
  destination_code: string;
  destination_city: string;
  destination_country: string;
  departure_date: string;
  return_date: string;
  price: number;
  currency: string;
  deal_score: number;
  deal_label: string;
}

interface WeekendGroup {
  weekend: string;
  dates: string;
  getaways: WeekendGetaway[];
}

function formatWeekendLabel(departure: string, returnDate: string): string {
  const dep = new Date(departure + "T12:00:00");
  const ret = new Date(returnDate + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${dep.toLocaleDateString("en-US", opts)}-${ret.toLocaleDateString("en-US", { day: "numeric" })}`;
}

function groupByWeekend(getaways: WeekendGetaway[]): WeekendGroup[] {
  const groups: Record<string, WeekendGetaway[]> = {};
  for (const g of getaways) {
    const key = `${g.departure_date}_${g.return_date}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(g);
  }
  return Object.entries(groups)
    .map(([key, items]) => {
      const sorted = items.sort((a, b) => a.price - b.price);
      const first = sorted[0];
      return {
        weekend: key,
        dates: formatWeekendLabel(first.departure_date, first.return_date),
        getaways: sorted,
      };
    })
    .sort((a, b) => a.weekend.localeCompare(b.weekend));
}

function buildGoogleFlightsUrl(origin: string, dest: string, depDate: string, retDate: string): string {
  return `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${dest}+on+${depDate}+through+${retDate}`;
}

export default function WeekendsPage() {
  const { format, currency } = useCurrency();
  const [origin, setOrigin] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [groups, setGroups] = useState<WeekendGroup[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setGroups([]);

    try {
      const res = await fetch("/api/weekends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.trim().toUpperCase(),
          max_budget: budget ? Number(budget) : null,
          weeks_ahead: 8,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to search weekends.");
        return;
      }

      if (data.getaways && data.getaways.length > 0) {
        setGroups(groupByWeekend(data.getaways));
      } else {
        setGroups([]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <CalendarDays className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekend Getaways</h1>
            <p className="text-sm text-muted-foreground">Find cheap Fri-Sun trips from your airport</p>
          </div>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin airport (e.g. YEG)"
          maxLength={4}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-h-[44px] uppercase"
        />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Max budget (optional)"
          min={0}
          className="sm:w-48 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-h-[44px]"
        />
        <Button
          type="submit"
          disabled={!origin.trim() || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl min-h-[44px] px-6 shadow-md shadow-blue-500/15"
        >
          {loading ? "Searching..." : "Find Getaways"}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground text-center py-4">
            Searching upcoming weekends... this may take a moment
          </p>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-40 bg-slate-800 rounded animate-pulse" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-slate-800/60 rounded-xl animate-pulse border border-slate-800" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && groups.length > 0 && (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.weekend}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="size-4 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">{group.dates}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.getaways.map((g, idx) => (
                  <Card
                    key={`${g.destination_code}-${idx}`}
                    className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 gradient-border-hover"
                  >
                    <CardContent className="relative z-10 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Plane className="size-3.5 text-blue-400 -rotate-45" />
                            <span className="font-semibold text-white">{g.destination_city}</span>
                          </div>
                          <span className="text-xs text-slate-500">{g.destination_code} &middot; {g.destination_country}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{format(g.price)}</div>
                          <span className="text-xs text-slate-500 uppercase">{currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <DealScoreBadge price={g.price} score={g.deal_score} label={g.deal_label} />
                        <a
                          href={buildGoogleFlightsUrl(origin.trim().toUpperCase(), g.destination_code, g.departure_date, g.return_date)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs h-8 min-h-[44px] shadow-md shadow-blue-500/15"
                          >
                            Book
                            <ExternalLink className="size-3 ml-1" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && groups.length === 0 && !error && (
        <div className="text-center py-12">
          <CalendarDays className="size-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No weekend getaways found. Try a different airport or increase your budget.</p>
        </div>
      )}
    </div>
  );
}
