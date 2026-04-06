"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import type { Watch } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const sub = useSubscription();

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => r.json())
      .then(setWatches);
  }, []);

  const activeWatches = watches.filter((w) => w.is_active);
  const nearTarget = activeWatches.filter(
    (w) =>
      w.target_price &&
      w.current_price &&
      w.current_price <= w.target_price * 1.1
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{sub.tier || "..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Searches Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {sub.searches_used ?? 0}
              <span className="text-sm font-normal text-muted-foreground">
                /{sub.searches_limit ?? 3}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Watches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {activeWatches.length}
              <span className="text-sm font-normal text-muted-foreground">
                /{sub.watches_limit ?? 1}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Near Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {nearTarget.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {sub.tier === "free" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold">Upgrade to Pro</p>
              <p className="text-sm text-muted-foreground">
                Get 50 searches/day, 10 watches, and email alerts for $6/mo
              </p>
            </div>
            <Link href="/pricing">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Watches</h2>
          <Link href="/watches">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {activeWatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active watches.{" "}
              <Link href="/search" className="text-primary underline">
                Search flights
              </Link>{" "}
              to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeWatches.slice(0, 5).map((watch) => (
              <Card key={watch.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {watch.origin} → {watch.destination}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {watch.departure_date}
                    </p>
                  </div>
                  <div className="text-right">
                    {watch.current_price && (
                      <p className="font-semibold">${watch.current_price}</p>
                    )}
                    {watch.target_price && (
                      <p className="text-xs text-muted-foreground">
                        Target: ${watch.target_price}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
