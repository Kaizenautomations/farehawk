"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold">
          FareHawk
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/search"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Search
              </Link>
              <Link
                href="/calendar"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Calendar
              </Link>
              <Link
                href="/watches"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Watches
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
