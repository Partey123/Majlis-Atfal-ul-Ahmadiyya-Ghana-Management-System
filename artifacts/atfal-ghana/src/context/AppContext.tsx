import { createContext, useContext, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

type ViewMode = "card" | "list";

interface AppContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: string;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem("viewMode") as ViewMode) || "card";
    } catch {
      return "card";
    }
  });

  const { theme, setTheme, resolvedTheme } = useTheme();

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try { localStorage.setItem("viewMode", mode); } catch {}
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <AppContext.Provider value={{ viewMode, setViewMode, theme: resolvedTheme ?? theme ?? "light", toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
