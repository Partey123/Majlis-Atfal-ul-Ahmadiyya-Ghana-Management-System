import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, GraduationCap, BarChart3, Map, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Graduations", href: "/graduations", icon: GraduationCap },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Locations", href: "/locations", icon: Map },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useAppContext();

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4">
      {navigation.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-sidebar border-r border-sidebar-border shadow-lg shadow-black/5">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-extrabold text-sidebar-primary tracking-tight">
            Majlis Atfal
          </h1>
          <p className="text-[10px] text-sidebar-foreground/60 mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
            <span className="w-4 h-[1px] bg-sidebar-foreground/20"></span>
            Ghana
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-6">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-sidebar-border bg-sidebar-accent/50">
              <AvatarFallback className="bg-transparent text-sidebar-foreground text-xs font-semibold">NA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">National Admin</span>
              <span className="text-[10px] text-sidebar-foreground/60">System User</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40 shadow-sm">
          <h1 className="text-lg font-bold text-primary">Majlis Atfal</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 text-muted-foreground">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-0 flex flex-col">
                <div className="p-6">
                  <h1 className="text-xl font-bold text-sidebar-primary tracking-tight">Majlis Atfal</h1>
                  <p className="text-[10px] text-sidebar-foreground/60 mt-1 uppercase tracking-widest font-semibold">Ghana</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <NavLinks />
                </div>
                <div className="p-4 border-t border-sidebar-border flex items-center gap-3 bg-sidebar-accent/20">
                  <Avatar className="h-8 w-8 bg-sidebar-accent/50">
                    <AvatarFallback className="bg-transparent text-sidebar-foreground text-xs">NA</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-sidebar-foreground">National Admin</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-full">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
