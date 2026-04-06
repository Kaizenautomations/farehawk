"use client";

import { useEffect, useState } from "react";

interface UsageData {
  tier: string;
  searches_used: number;
  searches_limit: number;
  watches_used: number;
  watches_limit: number;
  email_alerts: boolean;
  sms_alerts: boolean;
  business_cabin: boolean;
}

export function useSubscription() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/user/usage");
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { ...data, loading, refresh };
}
