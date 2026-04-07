"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";

export default function WaitlistPage() {
  return (
    <Suspense>
      <WaitlistContent />
    </Suspense>
  );
}

function WaitlistContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          ...(referralCode ? { referral_code: referralCode } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-blue-950/30 safe-x">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-2">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="size-6 text-blue-400 -rotate-45" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                FareFlight
              </span>
            </Link>

            {submitted ? (
              <div className="text-center pt-4 pb-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  You&apos;re on the list!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  We&apos;ll email you when FareFlight launches. Keep an eye on your inbox for early access and exclusive pricing.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-xl font-semibold text-foreground">
                  Join the Waitlist
                </h1>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Be first to know when FareFlight launches. Get early access and exclusive pricing.
                </p>
              </div>
            )}
          </div>

          {/* Form or success */}
          {submitted ? (
            <div className="px-8 pt-4 pb-8">
              <Link href="/">
                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 min-h-[44px] text-sm font-medium text-muted-foreground hover:bg-white/10 transition-colors"
                >
                  Back to Home
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 pt-4 pb-8 space-y-5">
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Name
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="waitlist-email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Already have an account link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
