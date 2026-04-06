"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Eye,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  Plane,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/watches", label: "Watches", icon: Eye },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase.auth]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav
      className={`sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b transition-all duration-300 ${
        scrolled
          ? "border-primary/20 shadow-[0_1px_12px_0_oklch(0.67_0.22_262_/_0.12)]"
          : "border-white/10"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <Plane className="size-5 text-blue-400 -rotate-45" />
          <span
            className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
          >
            FareHawk
          </span>
        </Link>

        {/* Desktop nav links (authenticated) */}
        {user && (
          <div className="hidden md:flex items-center gap-1 rounded-full bg-white/5 p-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <link.icon className="size-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* User dropdown -- desktop */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white ring-2 ring-white/10 hover:ring-white/20 transition-all"
                    >
                      {initial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8}>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard")}
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="size-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="size-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile hamburger */}
              <div className="md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger>
                    <Button variant="ghost" size="icon">
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 bg-background border-white/10">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Plane className="size-4 text-blue-400 -rotate-45" />
                        <span
                          className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                        >
                          FareHawk
                        </span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-1 px-2">
                      {navLinks.map((link) => {
                        const isActive = pathname?.startsWith(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-blue-500/15 text-blue-400"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                          >
                            <link.icon className="size-4" />
                            {link.label}
                          </Link>
                        );
                      })}
                      <div className="my-2 h-px bg-white/10" />
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>
                      <div className="my-2 h-px bg-white/10" />
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all"
                >
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
