"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";

interface Stats {
  total_users: number;
  tier_breakdown: { free: number; pro: number; premium: number };
  active_watches: number;
  today_searches: number;
  today_ai_messages: number;
  total_price_snapshots: number;
  recent_signups_7d: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
  home_airports: string[];
  tier: string;
  status: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sub = useSubscription();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) {
        setError("Access denied. Admin only.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load admin data.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-white mb-2">{error}</h1>
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    free: "bg-zinc-700 text-zinc-200",
    pro: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
    premium: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
    admin: "bg-red-600/20 text-red-400 border border-red-500/30",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            FareFlight platform overview
          </p>
        </div>
        <Badge className="bg-red-600/20 text-red-400 border border-red-500/30">
          Admin
        </Badge>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.total_users}
                  </p>
                  <p className="text-xs text-zinc-500">
                    +{stats.recent_signups_7d} this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Searches Today
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.today_searches}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    AI Messages Today
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.today_ai_messages}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Active Watches
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.active_watches}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tier Breakdown */}
      {stats && (
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Users by Plan
            </h3>
            <div className="flex gap-6">
              <div>
                <span className="text-2xl font-bold text-zinc-300">
                  {stats.tier_breakdown.free}
                </span>
                <span className="ml-1.5 text-xs text-zinc-500">Free</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-400">
                  {stats.tier_breakdown.pro}
                </span>
                <span className="ml-1.5 text-xs text-zinc-500">Pro</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-400">
                  {stats.tier_breakdown.premium}
                </span>
                <span className="ml-1.5 text-xs text-zinc-500">Premium</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">All Users</h2>
        <Card className="border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Airports
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-white">
                          {u.name || "—"}
                        </span>
                        {u.is_admin && (
                          <Badge className="ml-2 bg-red-600/20 text-red-400 border border-red-500/30 text-[10px]">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`capitalize text-xs ${tierColors[u.tier] || tierColors.free}`}
                      >
                        {u.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {u.home_airports?.length
                        ? u.home_airports.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
