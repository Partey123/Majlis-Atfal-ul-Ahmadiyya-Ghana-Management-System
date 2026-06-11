import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, GraduationCap, BarChart3, Map,
  Moon, Sun, UserPlus, Settings, LogOut, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import atfalLogo from "/atfal-logo.png";

const navigation = [
  { name: "Dashboard",   href: "/",            icon: LayoutDashboard },
  { name: "Members",     href: "/members",      icon: Users           },
  { name: "Graduations", href: "/graduations",  icon: GraduationCap   },
  { name: "Analytics",   href: "/analytics",    icon: BarChart3       },
  { name: "Locations",   href: "/locations",    icon: Map             },
];

function useActiveNav(location: string) {
  return (href: string) =>
    href === location || (href !== "/" && location.startsWith(href));
}

function AvatarButton({ size = "md" }: { size?: "sm" | "md" }) {
  const { theme, toggleTheme } = useAppContext();
  const { user, logout } = useAuth();
  
  // Get initials from email or name
  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "MA";
  };

  const initials = getInitials();
  const displayName = user?.email ?? "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className={cn(
            "rounded-full bg-[hsl(43,90%,50%)] flex items-center justify-center font-bold text-[hsl(142,60%,15%)] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"
          )}
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="font-semibold text-sm truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden bg-white dark:bg-white shadow-sm">
        <img
          src={atfalLogo}
          alt="Majlis Atfal"
          className="h-6 w-6 object-contain"
          style={{ filter: "none" }}
        />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-sm tracking-tight">Majlis Atfal</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">Ghana</p>
      </div>
    </div>
  );
}

/* ── Sidebar nav item (medium screens) ── */
function SideNavItem({ item, active }: { item: (typeof navigation)[0]; active: boolean }) {
  return (
    <Link href={item.href}>
      <div className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer select-none",
        active
          ? "bg-white/15 text-white font-semibold shadow-sm"
          : "text-white/65 hover:bg-white/10 hover:text-white",
      )}>
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[hsl(43,90%,50%)]" />
        )}
        <item.icon className="shrink-0 h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm tracking-tight">{item.name}</span>
      </div>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useAppContext();
  const isActive = useActiveNav(location);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* ══════════════════════════════════════
          TOP NAVBAR — fixed height, never scrolls
          ══════════════════════════════════════ */}
      <header className="shrink-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center h-14 px-4 gap-4 max-w-screen-2xl mx-auto">

          {/* Brand */}
          <Brand />

          {/* ── Large screen: nav links inline ── */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* ── Right-side controls ── */}
          <div className="flex items-center gap-2">
            {/* Add Member — shown md+ */}
            <Link href="/members/new" className="hidden md:block">
              <Button
                size="sm"
                className="bg-[hsl(43,90%,50%)] hover:bg-[hsl(43,90%,44%)] text-[hsl(142,60%,15%)] font-semibold h-8 text-xs gap-1.5 rounded-lg shadow-none"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Member
              </Button>
            </Link>

            {/* Theme toggle — shown md+ */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Avatar dropdown — all screens */}
            <AvatarButton size="sm" />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          BODY — fills remaining height, only
          the main column scrolls internally
          ══════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 max-w-screen-2xl mx-auto w-full">

        {/* ── Medium-screen sidebar: nav items only, never scrolls ── */}
        <aside className="hidden md:flex lg:hidden w-56 shrink-0 flex-col bg-sidebar border-r border-white/10 overflow-y-auto">
          <nav className="px-3 py-4 space-y-0.5">
            {navigation.map((item) => (
              <SideNavItem key={item.name} item={item} active={isActive(item.href)} />
            ))}
          </nav>
        </aside>

        {/* ── Main content: this is the only scrolling region ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM NAV — no hamburger needed
          ══════════════════════════════════════ */}
      <nav className="md:hidden shrink-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 transition-colors relative",
                  active ? "text-primary" : "text-muted-foreground",
                )}>
                  {active && (
                    <span className="absolute top-0 inset-x-3 h-0.5 rounded-b-full bg-primary" />
                  )}
                  <item.icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                  <span className={cn("text-[10px] font-medium leading-none", active ? "text-primary" : "text-muted-foreground/70")}>
                    {item.name === "Graduations" ? "Grad." : item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
