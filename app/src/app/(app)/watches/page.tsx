"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Watches</h1>
          <p className="text-sm text-muted-foreground">
            Get notified when prices drop on routes you care about.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sub.tier && (
            <Badge variant="outline">
              {sub.watches_used}/{sub.watches_limit} watches
            </Badge>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button>New Watch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Watch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <AirportAutocomplete value={origin} onChange={setOrigin} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <AirportAutocomplete value={destination} onChange={setDestination} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Depart</Label>
                    <Input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Return</Label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={departureDate}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target price (optional)</Label>
                  <Input
                    type="number"
                    placeholder="Alert me when price is below..."
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    min={0}
                    step={1}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create Watch"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : watches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No watches yet. Create one to start tracking flight prices.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {watches.map((watch) => (
            <Card key={watch.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">
                  {watch.origin} → {watch.destination}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {watch.is_active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Paused</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-sm">
                    <p>
                      Depart: {watch.departure_date}
                      {watch.return_date && ` — Return: ${watch.return_date}`}
                    </p>
                    <div className="flex gap-4">
                      {watch.current_price && (
                        <span>
                          Current: <strong>${watch.current_price}</strong>
                        </span>
                      )}
                      {watch.lowest_price && (
                        <span className="text-green-600">
                          Lowest: ${watch.lowest_price}
                        </span>
                      )}
                      {watch.target_price && (
                        <span className="text-muted-foreground">
                          Target: ${watch.target_price}
                        </span>
                      )}
                    </div>
                    {watch.last_checked_at && (
                      <p className="text-xs text-muted-foreground">
                        Last checked:{" "}
                        {new Date(watch.last_checked_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(watch.id, watch.is_active)}
                    >
                      {watch.is_active ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(watch.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
