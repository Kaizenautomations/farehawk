"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReferralsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setShareSupported(typeof navigator !== "undefined" && !!navigator.share);
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    loadUser();
  }, [supabase]);

  const shortId = userId ? userId.slice(0, 8) : "...";
  const referralLink = `https://fareflight.ca/waitlist?ref=${shortId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard failed silently
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join FareFlight",
          text: "I've been using FareFlight to find cheap flights. Sign up and we both get rewarded!",
          url: referralLink,
        });
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Refer a Friend
        </h1>
        <p className="mt-1 text-zinc-400">
          Share FareFlight with friends. When they sign up, you'll both get
          rewarded.
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">
              Your Referral Link
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Link display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-300 font-mono truncate select-all">
              {referralLink}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 min-h-[44px]"
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy Link
                </span>
              )}
            </Button>
            {shareSupported && (
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-white">
              How It Works
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-white">Share your link</p>
              <p className="text-xs text-zinc-500">
                Send your unique referral link to friends via text, email, or
                social media.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-white">They sign up</p>
              <p className="text-xs text-zinc-500">
                When your friend joins FareFlight through your link, we track
                the referral.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                You both get rewarded
              </p>
              <p className="text-xs text-zinc-500">
                Rewards coming soon -- stay tuned for details on referral perks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
