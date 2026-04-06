"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [homeAirports, setHomeAirports] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sub = useSubscription();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        setHomeAirports((data.home_airports || []).join(", "));
        setNotifyEmail(data.notification_email);
      }
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const airports = homeAirports
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    await supabase
      .from("profiles")
      .update({
        home_airports: airports,
        notification_email: notifyEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Could not open billing portal");
    }
  }

  const tierColors: Record<string, string> = {
    free: "bg-zinc-700 text-zinc-200",
    pro: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
    premium: "bg-amber-600/20 text-amber-400 border border-amber-500/30",
  };

  const isPremium = sub.tier === "premium";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-zinc-400">Manage your account and preferences.</p>
      </div>

      {/* Profile Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm text-zinc-400">Email</Label>
            <Input
              value={profile?.email || ""}
              disabled
              className="border-zinc-700 bg-zinc-800/50 text-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airports" className="text-sm text-zinc-400">
              Home airports
            </Label>
            <Input
              id="airports"
              placeholder="YEG, YYC, SEA"
              value={homeAirports}
              onChange={(e) => setHomeAirports(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600"
            />
            <p className="text-xs text-zinc-600">Comma-separated IATA codes</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 pt-2">
          {/* Email toggle */}
          <div className="flex items-center justify-between rounded-lg px-1 py-4">
            <div>
              <p className="text-sm font-medium text-white">Email notifications</p>
              <p className="text-xs text-zinc-500">Receive price drop alerts via email</p>
            </div>
            <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </div>
          {/* SMS toggle */}
          <div className="flex items-center justify-between rounded-lg px-1 py-4 opacity-60">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-white">SMS notifications</p>
                <p className="text-xs text-zinc-500">Get text alerts for big price drops</p>
              </div>
              {!isPremium && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                  Premium
                </span>
              )}
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Save button for profile/notifications */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Subscription Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">Subscription</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="flex items-center gap-3">
            <p className="text-sm text-zinc-400">Current plan:</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tierColors[sub.tier || "free"]}`}>
              {sub.tier || "..."}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Searches/day</p>
              <p className="mt-1 text-xl font-bold text-white">{sub.searches_limit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Watches</p>
              <p className="mt-1 text-xl font-bold text-white">{sub.watches_limit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email Alerts</p>
              <p className="mt-1 text-xl font-bold text-white">{sub.email_alerts ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {sub.tier !== "free" ? (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Manage Billing
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/pricing")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/50 bg-zinc-900/80">
        <CardHeader className="border-b border-red-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-950">
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-red-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete account</p>
              <p className="text-xs text-zinc-500">
                Permanently remove your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                  // TODO: implement account deletion
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
