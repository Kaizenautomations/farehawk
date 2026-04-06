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
  CardDescription,
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

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airports">
              Home airports (comma-separated IATA codes)
            </Label>
            <Input
              id="airports"
              placeholder="YEG, YYC, SEA"
              value={homeAirports}
              onChange={(e) => setHomeAirports(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive price drop alerts via email
              </p>
            </div>
            <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            You are on the{" "}
            <span className="font-semibold capitalize">{sub.tier}</span> plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p>Searches: {sub.searches_limit}/day</p>
            <p>Watches: {sub.watches_limit}</p>
            <p>Email alerts: {sub.email_alerts ? "Yes" : "No"}</p>
          </div>
          {sub.tier !== "free" ? (
            <Button variant="outline" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          ) : (
            <Button onClick={() => (window.location.href = "/pricing")}>
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
