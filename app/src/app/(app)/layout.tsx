"use client";

import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  CalendarDays,
  Eye,
  LayoutDashboard,
  Settings,
  Globe,
  Sparkles,
  Sun,
} from "lucide-react";

const sidebarLinks = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/explore", label: "Explore", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/weekends", label: "Weekends", icon: Sun },
  { href: "/watches", label: "Watches", icon: Eye },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col gap-1 w-16 hover:w-48 group/sidebar border-r border-white/10 bg-background/50 backdrop-blur-sm pt-4 px-2 transition-all duration-200 overflow-hidden shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
          {sidebarLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <link.icon className="size-5 shrink-0" />
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6 md:py-8 safe-x">{children}</div>
        </main>
      </div>
    </div>
  );
}
