"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AirportAutocomplete } from "@/components/search/AirportAutocomplete";
import { useSubscription } from "@/hooks/useSubscription";
import type { Watch } from "@/types/database";

export default function WatchesPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sub = useSubscription();

  // Create form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchWatches() {
    const res = await fetch("/api/watches");
    if (res.ok) setWatches(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchWatches();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate || null,
        target_price: targetPrice ? parseFloat(targetPrice) : null,
      }),
    });

    if (res.ok) {
      setDialogOpen(false);
      setOrigin("");
      setDestination("");
      setDepartureDate("");
      setReturnDate("");
      setTargetPrice("");
      fetchWatches();
      sub.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create watch");
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/watches/${id}`, { method: "DELETE" });
    fetchWatches();
    sub.refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch(`/api/watches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    fetchWatches();
  }

  function getPriceProgress(current: number | null, target: number | null) {
    if (!current || !target) return 0;
    if (current <= target) return 100;
    // Show progress: how close current is to target (from 2x target down to target = 0% to 100%)
    const max = target * 2;
    if (current >= max) return 0;
    return Math.round(((max - current) / (max - target)) * 100);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Price Watches</h1>
          {sub.tier && (
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              {sub.watches_used}/{sub.watches_limit}
            </span>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 min-h-[44px] text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-600/30 shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Watch
            </span>
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-white">Create Price Watch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">From</Label>
                <AirportAutocomplete value={origin} onChange={setOrigin} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">To</Label>
                <AirportAutocomplete value={destination} onChange={setDestination} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-zinc-400">Depart</Label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="border-zinc-700 bg-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-zinc-400">Return</Label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate}
                    className="border-zinc-700 bg-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Target price (optional)</Label>
                <Input
                  type="number"
                  placeholder="Alert me when price is below..."
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min={0}
                  step={1}
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Watch"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-zinc-400">
        Get notified when prices drop on routes you care about.
      </p>

      {/* Watch List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-800/50" />
          ))}
        </div>
      ) : watches.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-medium text-zinc-300">No watches yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Create one to start tracking flight prices.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {watches.map((watch) => {
            const progress = getPriceProgress(watch.current_price, watch.target_price);
            const isNear =
              watch.target_price &&
              watch.current_price &&
              watch.current_price <= watch.target_price * 1.1;
            const isAtTarget =
              watch.target_price &&
              watch.current_price &&
              watch.current_price <= watch.target_price;

            return (
              <Card
                key={watch.id}
                className={`border-zinc-800 bg-zinc-900/80 transition-all hover:border-zinc-700 ${
                  isAtTarget ? "border-l-2 border-l-emerald-500" : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Left: Route + dates */}
                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold tracking-wide text-white">
                          {watch.origin}{" "}
                          <span className="mx-1 text-zinc-500">→</span>{" "}
                          {watch.destination}
                        </h3>
                        {watch.is_active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700/50 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                            Paused
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-zinc-500">
                        {watch.departure_date}
                        {watch.return_date && (
                          <span> — Return: {watch.return_date}</span>
                        )}
                      </p>

                      {/* Price row */}
                      <div className="flex items-end gap-4 sm:gap-6 flex-wrap">
                        {watch.current_price != null && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Current</p>
                            <p className={`text-2xl font-bold ${isNear ? "text-emerald-400" : "text-white"}`}>
                              ${watch.current_price}
                            </p>
                          </div>
                        )}
                        {watch.target_price != null && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Target</p>
                            <p className="text-lg font-semibold text-zinc-400">
                              ${watch.target_price}
                            </p>
                          </div>
                        )}
                        {watch.lowest_price != null && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Lowest</p>
                            <p className="text-lg font-semibold text-emerald-400/80">
                              ${watch.lowest_price}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Price progress bar */}
                      {watch.target_price != null && watch.current_price != null && (
                        <div className="max-w-xs">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isAtTarget
                                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                  : isNear
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Last checked */}
                      {watch.last_checked_at && (
                        <p className="text-xs text-zinc-600">
                          Last checked: {new Date(watch.last_checked_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                      {/* Pause/Resume */}
                      <button
                        onClick={() => handleToggle(watch.id, watch.is_active)}
                        className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                        title={watch.is_active ? "Pause" : "Resume"}
                      >
                        {watch.is_active ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                          </svg>
                        )}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(watch.id)}
                        className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors hover:border-red-800 hover:bg-red-950 hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
