import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Stop overpaying
          <br />
          for flights.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          FareHawk tracks flight prices so you don&apos;t have to. Search
          flights, visualize the cheapest dates, and get instant alerts when
          prices drop on routes you care about.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              See Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need to find cheap flights
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>
                  Search real-time flight prices powered by Google Flights data.
                  Filter by cabin class, stops, and airlines.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Price Calendar</CardTitle>
                <CardDescription>
                  See the cheapest dates to fly at a glance. Color-coded
                  calendar shows you exactly when to book.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>
                  Set a target price and we&apos;ll notify you instantly when
                  your flight drops. Never miss a deal again.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Search",
                desc: "Enter your route and dates. Get instant results with real prices.",
              },
              {
                step: "2",
                title: "Watch",
                desc: "Save routes you care about. Set target prices for alerts.",
              },
              {
                step: "3",
                title: "Save",
                desc: "Get notified when prices drop. Book at the right time.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">
            Start saving on flights today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Free to start. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-6">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>FareHawk. Flight prices from Google Flights.</p>
        </div>
      </footer>
    </div>
  );
}
