"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: "forever",
    description: "Get started with basic flight search",
    features: [
      "3 searches per day",
      "1 price watch",
      "Economy class only",
      "Basic search filters",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
    accent: "zinc",
  },
  {
    name: "Pro",
    monthlyPrice: 6,
    yearlyPrice: 49,
    period: "/month",
    description: "For travelers who want to save on every trip",
    features: [
      "50 searches per day",
      "10 price watches",
      "Email price drop alerts",
      "Economy & Premium Economy",
      "Price history charts",
      "30-minute search cache",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    cta: "Start Pro",
    popular: true,
    accent: "blue",
  },
  {
    name: "Premium",
    monthlyPrice: 12,
    yearlyPrice: 99,
    period: "/month",
    description: "For frequent flyers and business travelers",
    features: [
      "200 searches per day",
      "50 price watches",
      "Email + SMS alerts",
      "All cabin classes incl. Business & First",
      "Priority search speed",
      "Weekly price digest",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY,
    cta: "Start Premium",
    popular: false,
    accent: "amber",
  },
];

const comparisonFeatures = [
  { name: "Daily searches", free: "3", pro: "50", premium: "200" },
  { name: "Price watches", free: "1", pro: "10", premium: "50" },
  { name: "Email alerts", free: "---", pro: "Yes", premium: "Yes" },
  { name: "SMS alerts", free: "---", pro: "---", premium: "Yes" },
  { name: "Cabin classes", free: "Economy", pro: "Economy + Prem", premium: "All classes" },
  { name: "Price history", free: "---", pro: "Yes", premium: "Yes" },
  { name: "Search cache", free: "---", pro: "30 min", premium: "30 min" },
  { name: "Search speed", free: "Standard", pro: "Standard", premium: "Priority" },
  { name: "Weekly digest", free: "---", pro: "---", premium: "Yes" },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. You will retain access until the end of your billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards through Stripe. All payments are securely processed.",
  },
  {
    q: "Can I switch plans?",
    a: "Absolutely. You can upgrade or downgrade at any time. Changes are prorated for the remainder of your billing cycle.",
  },
  {
    q: "What happens when I hit my search limit?",
    a: "You will see a friendly message letting you know the limit has been reached. Limits reset daily at midnight UTC.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSubscribe(priceId?: string) {
    if (!priceId) {
      router.push("/signup");
      return;
    }
    setLoadingPlan(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero section with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/8 via-indigo-600/5 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-16 sm:pt-24">
          {/* Headline */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              Start free, upgrade when you need more.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${!yearly ? "text-white" : "text-zinc-500"}`}>
                Monthly
              </span>
              <button
                onClick={() => setYearly(!yearly)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  yearly
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    yearly ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${yearly ? "text-white" : "text-zinc-500"}`}>
                Yearly
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Save 30%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const activePriceId = yearly ? plan.yearlyPriceId : plan.priceId;
            const displayPrice = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.popular;
            const isAmber = plan.accent === "amber";

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl ${
                  isPopular
                    ? "z-10 md:-mt-2 md:mb-[-8px]"
                    : ""
                }`}
              >
                {/* Glow effect for Pro */}
                {isPopular && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-600 opacity-75 blur-sm" />
                )}

                <div
                  className={`relative h-full rounded-2xl border p-6 ${
                    isPopular
                      ? "border-blue-500/50 bg-zinc-900"
                      : isAmber
                      ? "border-amber-500/20 bg-zinc-900/80"
                      : "border-zinc-800 bg-zinc-900/80"
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}

                  {/* Plan name */}
                  <h3 className={`text-lg font-semibold ${
                    isAmber ? "text-amber-300" : "text-white"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-bold text-white">
                      ${displayPrice}
                    </span>
                    {plan.period !== "forever" && (
                      <span className="ml-1 text-zinc-500">
                        {yearly ? "/yr" : "/mo"}
                      </span>
                    )}
                  </div>
                  {plan.period === "forever" && (
                    <p className="mt-1 text-sm text-zinc-600">Free forever</p>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() =>
                      plan.href
                        ? router.push(plan.href)
                        : handleSubscribe(activePriceId)
                    }
                    disabled={loadingPlan === activePriceId}
                    className={`mt-6 w-full rounded-lg px-4 py-3 min-h-[44px] text-sm font-semibold transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-600/40"
                        : isAmber
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    {loadingPlan === activePriceId ? "Loading..." : plan.cta}
                  </button>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <svg
                          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            isPopular
                              ? "text-blue-400"
                              : isAmber
                              ? "text-amber-400"
                              : "text-zinc-500"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-800 -mx-4 sm:mx-0">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-zinc-400">Feature</th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-medium text-zinc-400">Free</th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-medium text-blue-400">Pro</th>
                  <th className="px-3 sm:px-6 py-4 text-center text-sm font-medium text-amber-400">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-zinc-800/50 ${
                      i % 2 === 0 ? "bg-zinc-900/40" : "bg-zinc-900/20"
                    }`}
                  >
                    <td className="px-6 py-3.5 text-sm text-zinc-300">{feature.name}</td>
                    <td className="px-6 py-3.5 text-center text-sm text-zinc-500">{feature.free}</td>
                    <td className="px-6 py-3.5 text-center text-sm text-zinc-300">{feature.pro}</td>
                    <td className="px-6 py-3.5 text-center text-sm text-zinc-300">{feature.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-2xl space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 transition-colors hover:border-zinc-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 sm:px-6 py-4 min-h-[44px] text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <svg
                    className={`h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="border-t border-zinc-800 px-6 pb-4 pt-3">
                    <p className="text-sm text-zinc-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
