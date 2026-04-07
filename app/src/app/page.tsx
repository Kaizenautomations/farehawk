import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero noise-overlay">
        {/* Dot grid background */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-[oklch(0.55_0.2_280)]/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:pt-40 sm:pb-32 safe-x">
          <Badge
            variant="secondary"
            className="animate-fade-up mb-6 border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            Now in Early Access
          </Badge>

          <h1 className="animate-fade-up-delay-1 mx-auto max-w-4xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            Never Overpay for a{" "}
            <span className="text-gradient-brand">Flight Again</span>
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-6 sm:mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            The smart flight tracker that finds deals Google can&apos;t. AI-powered
            search, budget-based destination discovery, nearby airport savings,
            and automated price alerts — all in one place.
          </p>

          <div className="animate-fade-up-delay-3 mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row w-full sm:w-auto">
            <Link href="/waitlist">
              <Button
                size="lg"
                className="bg-gradient-brand px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 min-h-[44px] w-full sm:w-auto"
              >
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-border/50 bg-white/5 px-8 text-base backdrop-blur-sm hover:bg-white/10 min-h-[44px] w-full sm:w-auto"
              >
                See Pricing
              </Button>
            </Link>
          </div>

          {/* Clean plane icon — not animated weirdly, just a subtle static element */}
          <div className="animate-fade-up-delay-4 mt-16 flex items-center justify-center">
            <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span className="text-sm text-muted-foreground">
                Powered by Google Flights data
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get — replacing fake stats */}
      <section className="border-y border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 sm:flex-row sm:gap-16">
          {[
            { value: "2,800+", label: "Airports Worldwide" },
            { value: "Real-Time", label: "Google Flights Data" },
            { value: "6hr", label: "Price Check Intervals" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-6 animate-fade-up-delay-${i + 3}`}
            >
              {i > 0 && (
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
              )}
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-bold tracking-tight text-gradient-brand lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to find cheap flights
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Powerful tools that make it effortless to discover deals and book
              at the perfect time.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                ),
                title: "Smart Search",
                desc: "Search real-time flight prices powered by Google Flights data. Filter by cabin class, stops, and airlines.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                title: "Price Calendar",
                desc: "See the cheapest dates to fly at a glance. Color-coded calendar shows you exactly when to book.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                ),
                title: "Price Alerts",
                desc: "Set a target price and we'll notify you instantly when your flight drops. Never miss a deal again.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "AI Travel Advisor",
                desc: "Chat with AI to find the perfect trip. Describe what you want and get personalized flight recommendations.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                ),
                title: "Fly Anywhere Explorer",
                desc: "Enter your budget and see every destination you can reach, ranked by price. Discover places you didn't know you could afford.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ),
                title: "Weekend Getaways",
                desc: "Find cheap Friday-to-Sunday trips from your airport. Perfect for spontaneous weekend adventures.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                ),
                title: "Deal Score on Every Flight",
                desc: "Every result gets a 1-10 deal score so you know instantly if you're getting a good price — no guesswork, no second-guessing.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                title: "Nearby Airport Savings",
                desc: "Automatically checks if flying from a nearby airport could save you money. Drive 2 hours, save $200.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group relative border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 glow-hover gradient-border-hover"
              >
                <CardHeader className="relative z-10 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why FareFlight */}
      <section className="border-y border-border/50 bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              Why FareFlight?
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              More than just a flight search
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              Tools that actually help you save — not just show you prices.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                title: "Find Deals Faster",
                desc: "Stop manually searching dates and routes. Explore tells you everywhere you can fly on your budget. Calendar shows the cheapest dates at a glance. Weekend Getaways finds last-minute trips automatically.",
              },
              {
                icon: (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                ),
                title: "Know If It's Actually Cheap",
                desc: "Every flight gets a deal score from 1-10. Nearby airport comparison shows if you could save by driving. Price watches track routes and alert you when prices drop.",
              },
              {
                icon: (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Get Personalized Advice",
                desc: "Our AI Travel Advisor learns what you're looking for and suggests routes, dates, and destinations you hadn't considered. Like having a travel agent in your pocket.",
              },
            ].map((card) => (
              <Card
                key={card.title}
                className="border-border/50 bg-card/50 backdrop-blur-sm p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-y border-border/50 bg-muted/30 py-16 sm:py-24 lg:py-32 noise-overlay">
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to cheaper flights
            </h2>
          </div>

          <div className="relative mt-20">
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  step: "01",
                  title: "Search",
                  desc: "Enter your route and travel dates. Get instant results with real-time prices from hundreds of airlines.",
                },
                {
                  step: "02",
                  title: "Watch",
                  desc: "Save routes you care about and set your target price. We monitor prices around the clock for you.",
                },
                {
                  step: "03",
                  title: "Save",
                  desc: "Get notified the instant prices drop. Book with confidence knowing you got the best deal.",
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-lg font-bold text-white shadow-lg shadow-primary/25">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mx-auto max-w-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <Badge
            variant="secondary"
            className="mb-4 border-primary/20 bg-primary/10 text-primary"
          >
            Pricing
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Plans that pay for themselves
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <Card className="border-border/50 bg-card/50 p-4 sm:p-5 backdrop-blur-sm">
              <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                  Free
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold">$0</span>
                  <span className="text-xs text-muted-foreground">forever</span>
                </div>
                <Separator className="my-3 sm:my-4" />
                <ul className="space-y-1.5 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 3 searches per day
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 1 price watch
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Price calendar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Deal scores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Economy class only
                  </li>
                </ul>
                <Link href="/signup" className="mt-4 block">
                  <Button
                    variant="outline"
                    className="w-full border-border/50 min-h-[44px] text-sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro — highlighted */}
            <Card className="relative border-primary/40 bg-card/50 p-4 sm:p-5 shadow-lg shadow-primary/10 backdrop-blur-sm ring-1 ring-primary/30">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-white text-xs whitespace-nowrap">
                Most Popular
              </Badge>
              <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                  Pro
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold">$6</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                  <span className="text-xs text-muted-foreground ml-1">or $49/yr</span>
                </div>
                <Separator className="my-3 sm:my-4" />
                <ul className="space-y-1.5 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 50 searches per day
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 10 price watches
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Email price drop alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> AI Travel Advisor (15 msgs/day)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Flexible date search
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Nearby airport comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Economy &amp; Premium Economy
                  </li>
                </ul>
                <Link href="/pricing" className="mt-4 block">
                  <Button className="w-full bg-gradient-brand text-white shadow-lg shadow-primary/25 hover:brightness-110 min-h-[44px] text-sm font-semibold">
                    Start Pro
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Premium */}
            <Card className="border-border/50 bg-card/50 p-4 sm:p-5 backdrop-blur-sm">
              <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                  Premium
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold">$12</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                  <span className="text-xs text-muted-foreground ml-1">or $99/yr</span>
                </div>
                <Separator className="my-3 sm:my-4" />
                <ul className="space-y-1.5 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 200 searches per day
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> 50 price watches
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Email + SMS alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> AI Travel Advisor (50 msgs/day)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> All cabin classes incl. Business &amp; First
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Weekend getaway finder
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary text-xs">&#10003;</span> Priority features
                  </li>
                </ul>
                <Link href="/pricing" className="mt-4 block">
                  <Button
                    variant="outline"
                    className="w-full border-border/50 min-h-[44px] text-sm"
                  >
                    Start Premium
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <Link href="/pricing" className="mt-6 sm:mt-8 inline-block">
            <Button variant="outline" className="border-border/50 min-h-[44px]">
              View Full Pricing Details
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA — Waitlist */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-cta p-8 text-center shadow-2xl shadow-primary/10 sm:p-12 lg:p-16 noise-overlay">
            <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Be the first to know when we launch
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Join the waitlist and get early access to FareFlight. Free to
                start, no credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row w-full sm:w-auto">
                <Link href="/waitlist" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-gradient-brand px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 min-h-[44px] w-full sm:w-auto"
                  >
                    Join the Waitlist
                  </Button>
                </Link>
                <Link href="/search" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 px-8 text-base hover:bg-white/10 min-h-[44px] w-full sm:w-auto"
                  >
                    Try a Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="font-heading text-lg font-bold text-gradient-brand">
                FareFlight
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Track flight prices, get alerts, and never overpay again.
                Powered by Google Flights data.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/search"
                    className="transition-colors hover:text-foreground"
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calendar"
                    className="transition-colors hover:text-foreground"
                  >
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore"
                    className="transition-colors hover:text-foreground"
                  >
                    Explore
                  </Link>
                </li>
                <li>
                  <Link
                    href="/advisor"
                    className="transition-colors hover:text-foreground"
                  >
                    AI Advisor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/weekends"
                    className="transition-colors hover:text-foreground"
                  >
                    Weekends
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-foreground"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="transition-colors hover:text-foreground"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>&copy; 2026 FareFlight. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <div className="flex items-center gap-1.5">
                <span>Powered by</span>
                <a
                  href="https://kaizenshift.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Kaizen Shift
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
