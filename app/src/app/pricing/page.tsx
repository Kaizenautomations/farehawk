"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
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
  },
  {
    name: "Pro",
    price: "$6",
    yearlyPrice: "$49/yr",
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
  },
  {
    name: "Premium",
    price: "$12",
    yearlyPrice: "$99/yr",
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
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);

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
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you need more.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={yearly ? "text-muted-foreground" : "font-medium"}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                yearly ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  yearly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={yearly ? "font-medium" : "text-muted-foreground"}>
              Yearly <Badge variant="secondary">Save 30%</Badge>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const activePriceId = yearly
              ? plan.yearlyPriceId
              : plan.priceId;
            return (
              <Card
                key={plan.name}
                className={
                  plan.popular ? "border-primary shadow-lg" : ""
                }
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="mb-2 w-fit">Most Popular</Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">
                      {yearly && plan.yearlyPrice
                        ? plan.yearlyPrice.split("/")[0]
                        : plan.price}
                    </span>
                    {plan.period !== "forever" && (
                      <span className="text-muted-foreground">
                        {yearly ? "/yr" : plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-green-500">&#10003;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() =>
                      plan.href
                        ? router.push(plan.href)
                        : handleSubscribe(activePriceId)
                    }
                    disabled={loadingPlan === activePriceId}
                  >
                    {loadingPlan === activePriceId
                      ? "Loading..."
                      : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
