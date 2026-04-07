import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - FareFlight | Flight Deals, Tips & Travel Savings",
  description:
    "Expert tips on finding cheap flights, booking at the right time, and saving money on airfare. Powered by FareFlight.",
};

const BLOG_POSTS = [
  {
    slug: "best-time-to-book-flights",
    title: "When Is the Best Time to Book Flights in 2026?",
    date: "2026-04-06",
    excerpt:
      "Timing your booking can save you hundreds. Here's what the data shows about when to book domestic and international flights for the lowest fares.",
  },
  {
    slug: "cheapest-flights-from-canada",
    title: "The Cheapest International Flights from Canada Right Now",
    date: "2026-04-06",
    excerpt:
      "We tracked prices from every major Canadian airport. Here are the best deals flying out of YEG, YYC, YVR, and YYZ.",
  },
  {
    slug: "how-flexible-dates-save-money",
    title: "How Flexible Dates Can Save You Up to 40% on Flights",
    date: "2026-04-06",
    excerpt:
      "Shifting your trip by just a few days can dramatically change the price. Learn how to use date flexibility to your advantage.",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          FareFlight Blog
        </h1>
        <p className="text-zinc-400 mb-10">
          Tips, insights, and strategies to help you fly for less.
        </p>

        <div className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-blue-500/30 hover:bg-zinc-900/80 transition-all duration-200"
            >
              <time className="text-xs text-zinc-500 font-medium">
                {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {post.excerpt}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-blue-400 group-hover:underline">
                Read more
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>&copy; 2026 FareFlight. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <a
              href="https://kaizenshift.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-300 hover:text-blue-400 transition-colors"
            >
              Kaizen Shift
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
