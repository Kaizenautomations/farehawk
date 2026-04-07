"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/useSubscription";
import { SUPPORTED_CURRENCIES, getCurrencyPreference, setCurrencyPreference, type CurrencyCode } from "@/lib/currency";
import {
  requestNotificationPermission,
  getNotificationStatus,
} from "@/lib/notifications";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [homeAirports, setHomeAirports] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [priceDropFrequency, setPriceDropFrequency] = useState("immediately");
  const [pushStatus, setPushStatus] = useState<
    "granted" | "denied" | "default" | "unsupported"
  >("default");
  const [pushRequesting, setPushRequesting] = useState(false);
  const sub = useSubscription();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setSelectedCurrency(getCurrencyPreference());
    setWeeklyDigest(localStorage.getItem("fareflight_weekly_digest") === "true");
    setPriceDropFrequency(localStorage.getItem("fareflight_pricedrop_freq") || "immediately");
    setPushStatus(getNotificationStatus());
  }, []);

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
    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
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
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm text-zinc-400">
              Display Currency
            </Label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={(e) => {
                const code = e.target.value as CurrencyCode;
                setSelectedCurrency(code);
                setCurrencyPreference(code);
              }}
              className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-600">
              Prices are sourced in USD and converted using live exchange rates
            </p>
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
          <div className={`flex items-center justify-between rounded-lg px-1 py-4 ${!isPremium ? "opacity-60" : ""}`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">SMS notifications</p>
                {!isPremium && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">Get text alerts for big price drops</p>
              {!isPremium ? (
                <p className="text-xs text-zinc-500">SMS alerts are available on the Premium plan</p>
              ) : !profile?.phone ? (
                <p className="text-xs text-amber-400/80">Add your phone number to enable SMS alerts</p>
              ) : null}
            </div>
            <Switch checked={false} disabled={!isPremium || !profile?.phone} />
          </div>
          {/* Push notifications toggle */}
          <div className="flex items-center justify-between rounded-lg px-1 py-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-white">Push notifications</p>
              {pushStatus === "granted" && (
                <p className="text-xs text-emerald-400">
                  You will receive browser notifications for price drops
                </p>
              )}
              {pushStatus === "denied" && (
                <p className="text-xs text-amber-400">
                  Notifications are blocked. Enable them in your browser settings.
                </p>
              )}
              {pushStatus === "default" && (
                <p className="text-xs text-zinc-500">
                  Get browser notifications when prices drop on your watched routes
                </p>
              )}
              {pushStatus === "unsupported" && (
                <p className="text-xs text-zinc-500">
                  Push notifications are not supported in this browser
                </p>
              )}
            </div>
            {pushStatus === "default" && (
              <Button
                variant="outline"
                size="sm"
                disabled={pushRequesting}
                onClick={async () => {
                  setPushRequesting(true);
                  const granted = await requestNotificationPermission();
                  setPushStatus(granted ? "granted" : "denied");
                  setPushRequesting(false);
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-h-[44px] shrink-0"
              >
                {pushRequesting ? "Requesting..." : "Enable"}
              </Button>
            )}
            {pushStatus === "granted" && (
              <Switch checked={true} disabled />
            )}
            {pushStatus === "denied" && (
              <Switch checked={false} disabled />
            )}
            {pushStatus === "unsupported" && (
              <Switch checked={false} disabled />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">Email Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 pt-2">
          {/* Weekly digest toggle */}
          <div className="flex items-center justify-between rounded-lg px-1 py-4">
            <div>
              <p className="text-sm font-medium text-white">Weekly deal digest</p>
              <p className="text-xs text-zinc-500">Receive a weekly summary of the best deals from your home airports</p>
            </div>
            <Switch
              checked={weeklyDigest}
              onCheckedChange={(checked) => {
                setWeeklyDigest(checked);
                localStorage.setItem("fareflight_weekly_digest", String(checked));
              }}
            />
          </div>
          {/* Price drop frequency */}
          <div className="rounded-lg px-1 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Price drop alert frequency</p>
                <p className="text-xs text-zinc-500">How often to receive price drop notifications</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {[
                { value: "immediately", label: "Immediately" },
                { value: "daily", label: "Daily summary" },
                { value: "weekly", label: "Weekly summary" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPriceDropFrequency(opt.value);
                    localStorage.setItem("fareflight_pricedrop_freq", opt.value);
                  }}
                  className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    priceDropFrequency === opt.value
                      ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button for profile/notifications */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 min-h-[44px] w-full sm:w-auto"
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

          <div className="grid grid-cols-3 gap-2 sm:gap-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3 sm:p-4">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Delete account</p>
              <p className="text-xs text-zinc-500">
                Permanently remove your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300 min-h-[44px] w-full sm:w-auto shrink-0"
              onClick={() => {
                setDeleteDialogOpen(true);
                setDeleteConfirmText("");
                setDeleteError("");
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-400">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">
                Are you sure? This will permanently delete your account and all
                data including watches, price history, and settings. This action
                cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">
                Type <span className="font-mono font-bold text-white">DELETE</span> to confirm
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600 font-mono"
              />
            </div>
            {deleteError && (
              <p className="text-sm text-red-400">{deleteError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 min-h-[44px]"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700 min-h-[44px]"
                disabled={deleteConfirmText !== "DELETE" || deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError("");
                  try {
                    const res = await fetch("/api/user/delete", {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      await supabase.auth.signOut();
                      router.push("/");
                      router.refresh();
                    } else {
                      const data = await res.json();
                      setDeleteError(
                        data.error || "Failed to delete account. Please try again."
                      );
                    }
                  } catch {
                    setDeleteError(
                      "Something went wrong. Please try again."
                    );
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Deleting..." : "Delete My Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
