"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import type { Watch } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const ONBOARDING_DISMISSED_KEY = "farehawk_onboarding_dismissed";

export default function DashboardPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const sub = useSubscription();

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => r.json())
      .then((data: Watch[]) => {
        setWatches(data);
        // Show onboarding only if user has no watches and hasn't dismissed
        const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
        if (!dismissed && data.length === 0) {
          setShowOnboarding(true);
        }
      });

    // Fetch user's name from Supabase auth metadata
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "";
        setUserName(name);
      }
    });
  }, []);

  const activeWatches = watches.filter((w) => w.is_active);
  const nearTarget = activeWatches.filter(
    (w) =>
      w.target_price &&
      w.current_price &&
      w.current_price <= w.target_price * 1.1
  );

  const searchPercent = sub.searches_limit
    ? Math.min(100, Math.round(((sub.searches_used ?? 0) / sub.searches_limit) * 100))
    : 0;

  const tierColors: Record<string, string> = {
    free: "bg-zinc-700 text-zinc-200",
    pro: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
    premium: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back{userName ? `, ${userName}` : ""}</h1>
        <p className="mt-1 text-zinc-400">Here is what is happening with your flight watches.</p>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-violet-600/10 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
          <div className="relative space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Welcome to FareHawk{userName ? `, ${userName}` : ""}!
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-lg">
                Start by setting your home airports in{" "}
                <Link href="/settings" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                  Settings
                </Link>{" "}
                so we can find the best deals near you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/search"
                className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 min-h-[44px] hover:border-blue-500/40 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Search Flights</p>
                  <p className="text-xs text-slate-500">Find the best deals</p>
                </div>
              </Link>

              <Link
                href="/explore"
                className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 min-h-[44px] hover:border-blue-500/40 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">Explore Destinations</p>
                  <p className="text-xs text-slate-500">Discover where to go</p>
                </div>
              </Link>

              <Link
                href="/watches"
                className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 min-h-[44px] hover:border-blue-500/40 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                  <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Set Up Price Alerts</p>
                  <p className="text-xs text-slate-500">Track price drops</p>
                </div>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
                setShowOnboarding(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Plan Card */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Plan</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tierColors[sub.tier || "free"]}`}>
                    {sub.tier || "..."}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Searches Card */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Searches Today</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {sub.searches_used ?? 0}
                  <span className="text-sm font-normal text-zinc-500">
                    /{sub.searches_limit ?? 3}
                  </span>
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${searchPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Watches Card */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active Watches</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {activeWatches.length}
                  <span className="text-sm font-normal text-zinc-500">
                    /{sub.watches_limit ?? 1}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Near Target Card */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Near Target</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {nearTarget.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Banner */}
      {sub.tier === "free" && (
        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-violet-500/5" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Upgrade to Pro</p>
                <p className="text-sm text-zinc-400">
                  Get 50 searches/day, 10 watches, and email alerts for just $6/mo
                </p>
              </div>
            </div>
            <Link href="/pricing" className="w-full sm:w-auto shrink-0">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 min-h-[44px]">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Active Watches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Watches</h2>
          <Link href="/watches">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              View All
            </Button>
          </Link>
        </div>
        {activeWatches.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-base font-medium text-zinc-300">You haven't set up any price watches yet</p>
              <p className="mt-2 text-sm text-zinc-500 max-w-sm">
                Search for a flight and click &quot;Watch&quot; to track its price. We'll notify you when it drops.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Link href="/search">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 min-h-[44px]">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                    </svg>
                    Search Flights
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-h-[44px]">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    Explore Destinations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeWatches.slice(0, 5).map((watch) => {
              const isNear =
                watch.target_price &&
                watch.current_price &&
                watch.current_price <= watch.target_price * 1.1;
              return (
                <Card key={watch.id} className={`border-zinc-800 bg-zinc-900/80 transition-colors hover:border-zinc-700 ${isNear ? "border-l-2 border-l-emerald-500" : ""}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {watch.origin} <span className="text-zinc-500">→</span> {watch.destination}
                        </p>
                        <p className="text-xs text-zinc-500">{watch.departure_date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {watch.current_price && (
                        <p className={`text-sm font-semibold ${isNear ? "text-emerald-400" : "text-white"}`}>
                          ${watch.current_price}
                        </p>
                      )}
                      {watch.target_price && (
                        <p className="text-xs text-zinc-500">
                          Target: ${watch.target_price}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
