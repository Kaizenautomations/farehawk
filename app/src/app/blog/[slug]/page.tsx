import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BLOG_POSTS: Record<
  string,
  { title: string; date: string; excerpt: string; content: string }
> = {
  "best-time-to-book-flights": {
    title: "When Is the Best Time to Book Flights in 2026?",
    date: "2026-04-06",
    excerpt:
      "Timing your booking can save you hundreds. Here's what the data shows.",
    content: `Booking flights at the right time is one of the easiest ways to save money on travel. While there is no single magic day that guarantees the cheapest fare, patterns in pricing data consistently show that timing matters more than most travelers realize.

## The 4-to-8 Week Sweet Spot

For domestic flights within North America, booking between 4 and 8 weeks before departure tends to yield the best prices. Airlines release seats in fare buckets, and the cheaper buckets are usually available during this window. Book too early and you may miss promotional fares. Book too late and you are competing with business travelers who book last-minute at premium prices.

For international flights, the window extends to 2 to 4 months ahead. Transatlantic and transpacific routes see the sharpest price increases inside the 3-week mark, so planning ahead pays off.

## Fly Midweek for Lower Fares

Tuesday and Wednesday departures are consistently cheaper than Friday and Sunday flights. Weekend demand drives prices up, especially on popular leisure routes. If your schedule allows even a one-day shift, you could see savings of 15 to 25 percent.

## Avoid Peak Travel Windows

Holiday weekends, spring break, and the first two weeks of summer are the most expensive times to fly. If you can travel in shoulder seasons, such as late September, October, or early March, you will find significantly lower fares to the same destinations.

## Use Price Tracking to Your Advantage

Rather than guessing, let tools do the work. FareFlight's <a href="/calendar" class="text-blue-400 hover:underline">Price Calendar</a> shows you the cheapest dates at a glance, and <a href="/watches" class="text-blue-400 hover:underline">Price Watches</a> alert you when a fare drops on your route. Combined with deal scores on every result, you never have to wonder whether you are getting a fair price.

## Key Takeaways

- Book domestic flights 4 to 8 weeks out, international 2 to 4 months out
- Fly on Tuesdays or Wednesdays when possible
- Avoid peak holiday periods and school break weeks
- Use FareFlight's calendar and alerts to track prices automatically`,
  },
  "cheapest-flights-from-canada": {
    title: "The Cheapest International Flights from Canada Right Now",
    date: "2026-04-06",
    excerpt:
      "We tracked prices from every major Canadian airport. Here are the best deals.",
    content: `Canada has four major international gateways, and the cheapest flights out of each one vary dramatically depending on the season, airline competition, and route demand. Here is what we are seeing right now across YEG, YYC, YVR, and YYZ.

## Toronto (YYZ) - The Volume Leader

As Canada's busiest airport, YYZ benefits from intense competition. Right now, some of the best value routes include flights to London Gatwick, Lisbon, and Dublin, all frequently available under $600 CAD round trip. Budget carriers like Flair and seasonal routes from WestJet and Air Transat keep transatlantic prices competitive.

## Vancouver (YVR) - Gateway to Asia-Pacific

YVR consistently offers the cheapest fares to Asia from Canada. Direct flights to Tokyo, Seoul, and Manila are often hundreds of dollars less than connecting through other hubs. Round trips to Tokyo can dip below $700 CAD during off-peak months.

## Calgary (YYC) - Surprising Value to the US and Mexico

YYC punches above its weight for sun destinations. WestJet's hub status means competitive pricing to Phoenix, Las Vegas, Los Angeles, and Mexican beach cities. Puerto Vallarta and Cancun regularly appear under $400 CAD round trip.

## Edmonton (YEG) - Hidden Gems with Patience

YEG has fewer direct international routes, but that does not mean you cannot find deals. Connecting through YYC or YVR often adds minimal cost. YEG to Las Vegas and YEG to Maui are standout value routes when booked in advance.

## How to Find the Best Canadian Deals

Use FareFlight's <a href="/explore" class="text-blue-400 hover:underline">Explore Anywhere</a> feature to enter your home airport and budget. The tool searches every available destination and ranks them by price, so you can discover routes you might not have considered. Pair this with <a href="/calendar" class="text-blue-400 hover:underline">flexible date searches</a> to zero in on the cheapest travel window.

## Key Takeaways

- YYZ is best for Europe, YVR for Asia, YYC for US sun destinations
- Budget carriers create competition that benefits all airports
- Use Explore Anywhere on FareFlight to see every destination ranked by price
- Shoulder season travel from any Canadian airport delivers the biggest savings`,
  },
  "how-flexible-dates-save-money": {
    title: "How Flexible Dates Can Save You Up to 40% on Flights",
    date: "2026-04-06",
    excerpt:
      "Shifting your trip by just a few days can dramatically change the price.",
    content: `One of the most underused strategies in flight booking is date flexibility. Airlines price flights dynamically based on demand, and shifting your travel dates by even one or two days can mean the difference between a full-price fare and a genuine deal.

## Why Prices Change Day to Day

Airline revenue management systems adjust prices constantly based on how many seats are sold, how close the departure date is, and how that route has performed historically. A Tuesday departure might be $280 while the same route on Friday is $450, simply because more people want to leave on Fridays.

This applies to both departure and return dates. A round trip that costs $600 when you fly Friday to Sunday might drop to $380 if you shift to Wednesday to Monday.

## The Plus-or-Minus 3 Days Strategy

The simplest way to take advantage of this is to search a range of dates rather than a single day. FareFlight's <a href="/calendar" class="text-blue-400 hover:underline">Price Calendar</a> was built exactly for this purpose. It shows you the lowest fare for every day within your travel window, color-coded so the cheapest options stand out immediately.

When searching on FareFlight, you can also enable the flexible dates option on the <a href="/search" class="text-blue-400 hover:underline">Search page</a>. This automatically checks dates 3 days before and after your chosen date and returns the best fares across the entire range.

## Real Savings Examples

In our data, flexible date searches consistently save 20 to 40 percent compared to fixed-date searches. On popular leisure routes like Toronto to Cancun or Vancouver to Honolulu, the savings can exceed $200 per person. Multiply that by a family of four and you are looking at $800 saved just by traveling on a slightly different day.

## When Flexibility Matters Most

Date flexibility has the biggest impact during peak demand periods. If you must travel during spring break or the December holidays, shifting by even one day before or after the peak window can dramatically reduce your fare. Mid-January and late November, right after the holidays, are especially good for finding low prices.

## Key Takeaways

- Shifting by 1 to 3 days can save 20 to 40 percent on most routes
- Use FareFlight's Price Calendar to visualize the cheapest dates at a glance
- Enable flexible dates in Search to automatically check nearby dates
- The biggest savings come during peak travel periods where a one-day shift avoids surge pricing`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) {
    return { title: "Post Not Found - FareFlight Blog" };
  }
  return {
    title: `${post.title} - FareFlight Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function renderContent(html: string) {
  // Split content by double newlines into blocks, then process headings/paragraphs
  const blocks = html.split("\n\n").filter((b) => b.trim());
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-xl font-semibold text-white mt-8 mb-3"
        >
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 text-zinc-300 leading-relaxed ml-2">
          {items.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{
                __html: item.replace("- ", ""),
              }}
            />
          ))}
        </ul>
      );
    }

    return (
      <p
        key={i}
        className="text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-blue-400 transition-colors mb-6"
        >
          &larr; Back to Blog
        </Link>

        <time className="block text-xs text-zinc-500 font-medium mb-3">
          {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="space-y-4">{renderContent(post.content)}</div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to find your next deal?
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Search real-time flight prices and set up price alerts with
            FareFlight.
          </p>
          <Link href="/signup">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all min-h-[44px]"
            >
              Get Started Free
            </button>
          </Link>
        </div>
      </article>

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
