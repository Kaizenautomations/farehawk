import type { Metadata } from "next";
import Link from "next/link";
import { POPULAR_AIRPORTS } from "@/lib/airports";

interface Props {
  params: Promise<{ route: string }>;
}

function getAirportCity(code: string): string {
  const upper = code.toUpperCase();
  const airport = POPULAR_AIRPORTS.find((a) => a.code === upper);
  return airport ? airport.city : upper;
}

function getAirportName(code: string): string {
  const upper = code.toUpperCase();
  const airport = POPULAR_AIRPORTS.find((a) => a.code === upper);
  return airport ? airport.name : upper;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route } = await params;
  const parts = route.split("-to-");
  if (parts.length !== 2) {
    return { title: "Flight Route | FareHawk" };
  }

  const originCode = parts[0].toUpperCase();
  const destCode = parts[1].toUpperCase();
  const originCity = getAirportCity(originCode);
  const destCity = getAirportCity(destCode);

  return {
    title: `Cheap Flights from ${originCity} (${originCode}) to ${destCity} (${destCode}) | FareHawk`,
    description: `Track and compare flight prices from ${originCity} (${originCode}) to ${destCity} (${destCode}). Get alerts when prices drop with FareHawk.`,
    openGraph: {
      title: `Cheap Flights from ${originCity} to ${destCity} | FareHawk`,
      description: `Find the best deals on flights from ${originCity} (${originCode}) to ${destCity} (${destCode}). Set price alerts and never miss a deal.`,
    },
  };
}

export default async function FlightRoutePage({ params }: Props) {
  const { route } = await params;
  const parts = route.split("-to-");

  if (parts.length !== 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Invalid Route</h1>
          <p className="text-slate-400">
            Please use the format: /flights/yeg-to-lax
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 min-h-[44px] text-sm font-medium text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const originCode = parts[0].toUpperCase();
  const destCode = parts[1].toUpperCase();
  const originCity = getAirportCity(originCode);
  const destCity = getAirportCity(destCode);
  const originName = getAirportName(originCode);
  const destName = getAirportName(destCode);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <svg
            className="h-5 w-5 text-blue-400 -rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            FareHawk
          </span>
        </div>

        {/* Route header */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>{originCode}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span>{destCode}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Flights from {originCity} to {destCity}
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Track prices for{" "}
              <span className="text-slate-200 font-medium">{originCode}</span>{" "}
              &rarr;{" "}
              <span className="text-slate-200 font-medium">{destCode}</span>{" "}
              and get alerts when they drop.
            </p>
          </div>

          {/* Route details card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  From
                </p>
                <p className="text-lg font-bold text-white">{originCity}</p>
                <p className="text-sm text-slate-400">{originName}</p>
              </div>
              <div className="flex items-center px-4">
                <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <svg
                  className="h-5 w-5 text-blue-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-indigo-500 to-blue-500" />
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  To
                </p>
                <p className="text-lg font-bold text-white">{destCity}</p>
                <p className="text-sm text-slate-400">{destName}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                  Join FareHawk
                </Link>
                <Link
                  href={`/search?origin=${originCode}&destination=${destCode}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-6 py-3 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  Already have an account? Search now
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <p className="text-sm font-medium text-white">Compare Airlines</p>
              <p className="text-xs text-slate-500">
                See prices across all major carriers in one search.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941"
                />
              </svg>
              <p className="text-sm font-medium text-white">Price Alerts</p>
              <p className="text-xs text-slate-500">
                Get notified the moment prices drop on this route.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <svg
                className="h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm font-medium text-white">Price Calendar</p>
              <p className="text-xs text-slate-500">
                Find the cheapest days to fly this route.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
