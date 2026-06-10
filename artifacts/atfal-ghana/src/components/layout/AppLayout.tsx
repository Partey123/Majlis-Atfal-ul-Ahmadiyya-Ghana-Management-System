import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, GraduationCap, BarChart3, Map,
  Moon, Sun, UserPlus, ChevronRight, Settings, LogOut, User,
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
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard",   href: "/",            icon: LayoutDashboard },
  { name: "Members",     href: "/members",      icon: Users           },
  { name: "Graduations", href: "/graduations",  icon: GraduationCap   },
  { name: "Analytics",   href: "/analytics",    icon: BarChart3       },
  { name: "Locations",   href: "/locations",    icon: Map             },
];

function NavItem({
  item,
  active,
}: {
  item: (typeof navigation)[0];
  active: boolean;
}) {
  return (
    <Link href={item.href}>
      <div
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer select-none",
          active
            ? "bg-white/15 text-white font-semibold shadow-sm"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[hsl(43,90%,50%)]" />
        )}
        <item.icon className="shrink-0 h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm tracking-tight flex-1">{item.name}</span>
        {active && <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
      </div>
    </Link>
  );
}

function AvatarButton({ size = "md" }: { size?: "sm" | "md" }) {
  const { theme, toggleTheme } = useAppContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full bg-[hsl(43,90%,50%)] flex items-center justify-center font-bold text-[hsl(142,60%,15%)] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"
          )}
        >
          MA
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Majlis Admin</span>
            <span className="text-xs text-muted-foreground">administrator</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <User className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useAppContext();

  const currentNav = navigation.find(
    (n) => n.href === location || (n.href !== "/" && location.startsWith(n.href)),
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col fixed inset-y-0 z-50 bg-sidebar border-r border-white/10 shadow-xl shadow-black/20">

        {/* Brand */}
        <div className="px-5 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[hsl(43,90%,50%)] flex items-center justify-center shrink-0 shadow">
              <span className="text-[hsl(142,60%,15%)] font-black text-sm leading-none">M</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight tracking-tight">Majlis Atfal</p>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest leading-tight">Ghana</p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-white/10 mb-3 shrink-0" />

        <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1 shrink-0">
          Navigation
        </p>

        {/* Nav links — no overflow, never scrolls */}
        <nav className="px-3 space-y-0.5 pb-4 shrink-0">
          {navigation.map((item) => {
            const active = item.href === location || (item.href !== "/" && location.startsWith(item.href));
            return <NavItem key={item.name} item={item} active={active} />;
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="mx-4 h-px bg-white/10 shrink-0" />
        <div className="p-4 flex items-center gap-2 shrink-0">
          <Link href="/members/new" className="flex-1">
            <Button
              size="sm"
              className="w-full bg-[hsl(43,90%,50%)] hover:bg-[hsl(43,90%,44%)] text-[hsl(142,60%,15%)] font-semibold h-8 text-xs gap-1.5 shadow-none rounded-lg"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Member
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 shrink-0 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <AvatarButton />
        </div>
      </aside>

      {/* ── Content Area ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile Top Header — fixed, never scrolls */}
        <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 h-14 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-sidebar flex items-center justify-center shrink-0">
              <span className="text-[hsl(43,90%,50%)] font-black text-xs">M</span>
            </div>
            <p className="text-sm font-bold leading-tight">{currentNav?.name ?? "Majlis Atfal"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/members/new">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 text-xs gap-1 rounded-lg px-3"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add
              </Button>
            </Link>
            <AvatarButton size="sm" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="grid grid-cols-5 h-16">
            {navigation.map((item) => {
              const active = item.href === location || (item.href !== "/" && location.startsWith(item.href));
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
    </div>
  );
}
