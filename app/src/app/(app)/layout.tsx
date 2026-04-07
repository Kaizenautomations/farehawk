"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
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
  Gift,
  Shield,
  Route,
  ChevronLeft,
  ChevronRight,
  Moon,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";

const sidebarLinks = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/multi-city", label: "Multi-City", icon: Route },
  { href: "/explore", label: "Explore", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/weekends", label: "Weekends", icon: Sun },
  { href: "/watches", label: "Watches", icon: Eye },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/referrals", label: "Refer", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sub = useSubscription();
  const { theme, toggleTheme } = useTheme();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSidebarExpanded(
        localStorage.getItem("fareflight_sidebar_expanded") === "true"
      );
    }
  }, []);

  function handleToggleSidebar() {
    const next = !sidebarExpanded;
    setSidebarExpanded(next);
    localStorage.setItem("fareflight_sidebar_expanded", String(next));
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside
          className={`hidden lg:flex flex-col gap-1 ${
            sidebarExpanded ? "w-48" : "w-16"
          } border-r border-white/10 bg-background/50 backdrop-blur-sm pt-4 px-2 transition-all duration-200 overflow-hidden shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]`}
        >
          {/* Toggle button */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="flex items-center justify-center rounded-lg p-1.5 mb-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors self-end min-h-[44px] min-w-[44px]"
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

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
                <span
                  className={`transition-opacity duration-200 ${
                    sidebarExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
          {/* Admin link — only for admins */}
          {sub.is_admin && (
            <>
              <div className="my-2 mx-3 h-px bg-white/10" />
              <Link
                href="/admin"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname?.startsWith("/admin")
                    ? "bg-red-500/15 text-red-400"
                    : "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                <Shield className="size-5 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    sidebarExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Admin
                </span>
              </Link>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Theme toggle at bottom */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-white/5 mb-2 min-h-[44px]"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="size-5 shrink-0" />
            ) : (
              <Moon className="size-5 shrink-0" />
            )}
            <span
              className={`transition-opacity duration-200 ${
                sidebarExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6 md:py-8 pb-24 lg:pb-8 safe-x">{children}</div>
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
