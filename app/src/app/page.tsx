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

        {/* Animated floating elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-[oklch(0.55_0.2_280)]/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-32 text-center sm:pt-40 sm:pb-32">
          <Badge
            variant="secondary"
            className="animate-fade-up mb-6 border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            Launching Soon -- Join the Waitlist
          </Badge>

          <h1 className="animate-fade-up-delay-1 mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
            Never Overpay for a{" "}
            <span className="text-gradient-brand">Flight Again</span>
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            FareHawk tracks thousands of flight prices in real time so you
            don&apos;t have to. Search routes, visualize the cheapest dates, and
            get instant alerts when prices drop.
          </p>

          <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-brand px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-border/50 bg-white/5 px-8 text-base backdrop-blur-sm hover:bg-white/10"
              >
                See Pricing
              </Button>
            </Link>
          </div>

          {/* Animated plane */}
          <div className="animate-fade-up-delay-4 relative mx-auto mt-16 flex items-center justify-center">
            <div className="animate-[fly_8s_ease-in-out_infinite] text-5xl opacity-60">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-primary/80"
              >
                <path d="M22 2L2 12l7 2 4 8 3-6 6-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </div>
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes fly {
                0%, 100% { transform: translateX(-30px) translateY(4px) rotate(-1deg); opacity: 0.6; }
                50% { transform: translateX(30px) translateY(-4px) rotate(1deg); opacity: 0.4; }
              }
            `,
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 sm:flex-row sm:gap-16">
          {[
            { value: "50,000+", label: "Prices Tracked" },
            { value: "3,200+", label: "Users" },
            { value: "$147", label: "Avg Savings" },
          ].map((stat, i) => (
            <div key={stat.label} className={`flex items-center gap-6 animate-fade-up-delay-${i + 3}`}>
              {i > 0 && (
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
              )}
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight text-gradient-brand sm:text-5xl">
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
      <section className="py-24 sm:py-32">
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

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <path
                      d="M21 21l-4.35-4.35"
                      strokeLinecap="round"
                    />
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

      {/* How it Works */}
      <section className="border-y border-border/50 bg-muted/30 py-24 sm:py-32 noise-overlay">
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

          {/* Horizontal timeline */}
          <div className="relative mt-20">
            {/* Connecting line */}
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

      {/* Testimonials / Social Proof */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-primary/20 bg-primary/10 text-primary"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by smart travelers
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "FareHawk saved me $320 on my flight to Tokyo. The price alerts are a game changer -- I booked the second prices dropped.",
                name: "Sarah M.",
                route: "YYC to NRT",
              },
              {
                quote:
                  "I used to spend hours comparing prices across different sites. Now I just set my routes and FareHawk does the rest.",
                name: "James K.",
                route: "YEG to LAX",
              },
              {
                quote:
                  "The price calendar is incredible. I shifted my trip by two days and saved almost $200. Absolutely worth it.",
                name: "Priya S.",
                route: "YVR to LHR",
              },
            ].map((testimonial) => (
              <Card
                key={testimonial.name}
                className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 gradient-border-hover"
              >
                <CardHeader className="relative z-10 space-y-4">
                  <div className="flex gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed text-foreground/80">
                    &ldquo;{testimonial.quote}&rdquo;
                  </CardDescription>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.route}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="border-y border-border/50 bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Badge
            variant="secondary"
            className="mb-4 border-primary/20 bg-primary/10 text-primary"
          >
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Plans that pay for themselves
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free and upgrade when you need more. Most users save enough on
            their first flight to cover a year of Pro.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 gradient-border-hover">
              <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                  Free
                </div>
                <div className="mt-2 text-4xl font-bold">$0</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  forever
                </div>
                <Separator className="my-6" />
                <ul className="space-y-3 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> 3 price alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Basic search
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Price calendar
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="relative border-primary/40 bg-card/50 p-8 shadow-lg shadow-primary/10 backdrop-blur-sm transition-all duration-300 glow-hover gradient-border-hover">
              <Badge className="absolute -top-3 right-6 bg-gradient-brand text-white">
                Popular
              </Badge>
              <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                  Pro
                </div>
                <div className="mt-2 text-4xl font-bold">$5</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  / month
                </div>
                <Separator className="my-6" />
                <ul className="space-y-3 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Unlimited
                    alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Advanced
                    filters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Price history
                    charts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">&#10003;</span> Priority
                    notifications
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <Link href="/pricing" className="mt-8 inline-block">
            <Button variant="outline" className="border-border/50">
              View Full Pricing Details
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-cta p-12 text-center shadow-2xl shadow-primary/10 sm:p-16 noise-overlay">
            <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start saving on flights today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Join thousands of travelers who never overpay. Free to start, no
                credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-brand px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
                  >
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/search">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 px-8 text-base hover:bg-white/10"
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="font-heading text-lg font-bold text-gradient-brand">
                FareHawk
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
                    Search Flights
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
                    href="/alerts"
                    className="transition-colors hover:text-foreground"
                  >
                    Price Alerts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-foreground"
                  >
                    About
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
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>&copy; 2026 FareHawk. All rights reserved.</p>
            <p>Flight prices from Google Flights.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
