"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Globe,
  CalendarDays,
  Sparkles,
  Menu,
  Eye,
  Sun,
  Route,
  Briefcase,
  LayoutDashboard,
  Gift,
  Settings,
  Shield,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSubscription } from "@/hooks/useSubscription";

const tabs = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/explore", label: "Explore", icon: Globe },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/advisor", label: "AI", icon: Sparkles },
];

const moreFeatureLinks = [
  { href: "/trips", label: "Trips", icon: Briefcase },
  { href: "/watches", label: "Watches", icon: Eye },
  { href: "/weekends", label: "Weekends", icon: Sun },
  { href: "/multi-city", label: "Multi-City", icon: Route },
];

const moreAccountLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sub = useSubscription();

  // Check if "More" should appear active (when on a page that lives inside the More sheet)
  const moreHrefs = [
    ...moreFeatureLinks.map((l) => l.href),
    ...moreAccountLinks.map((l) => l.href),
    "/admin",
  ];
  const isMoreActive = moreHrefs.some((href) => pathname?.startsWith(href));

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/80 backdrop-blur-lg border-t border-white/10 safe-bottom">
        <div className="flex items-stretch justify-around px-1">
          {tabs.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] flex-1 py-2 transition-colors ${
                  isActive
                    ? "text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                <tab.icon className="size-5" />
                <span className="text-[10px] font-medium leading-tight">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] flex-1 py-2 transition-colors ${
              isMoreActive
                ? "text-blue-400"
                : "text-muted-foreground"
            }`}
          >
            <Menu className="size-5" />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="bg-background border-white/10 rounded-t-2xl max-h-[70vh]"
        >
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-2 overflow-y-auto">
            {/* Features */}
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Features
            </p>
            {moreFeatureLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <link.icon className="size-5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}

            <div className="my-2 mx-3 h-px bg-white/10" />

            {/* Account */}
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Account
            </p>
            {moreAccountLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <link.icon className="size-5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}

            {/* Admin — only for admins */}
            {sub.is_admin && (
              <>
                <div className="my-2 mx-3 h-px bg-white/10" />
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Admin
                </p>
                <Link
                  href="/admin"
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                    pathname?.startsWith("/admin")
                      ? "bg-red-500/15 text-red-400"
                      : "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <Shield className="size-5 shrink-0" />
                  Admin
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
