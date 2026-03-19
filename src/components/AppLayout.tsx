import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Map, ListFilter, PlusCircle, Info } from "lucide-react";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const navItems = [
  { to: "/", icon: Map, label: "ম্যাপ" },
  { to: "/feed", icon: ListFilter, label: "ফিড" },
  { to: "/add-report", icon: PlusCircle, label: "রিপোর্ট" },
  { to: "/info", icon: Info, label: "তথ্য" },
];

export function TopNav() {
  const { canInstall, install } = useInstallPWA();

  return (
    <header className="bg-primary text-primary-foreground h-12 flex items-center px-4 shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2 flex-1">
        <img src="/logo.jpg" alt="Chor Koi" className="h-7" />
        <h1 className="font-display font-bold text-lg tracking-tight">চোর কই</h1>
      </div>
      {canInstall && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors text-sm font-medium"
        >
          <span className="font-display">Install</span>
        </button>
      )}
    </header>
  );
}

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex">
        {navItems.map((item) => {
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="font-display">{item.label}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-card border-r min-h-screen sticky top-12">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {navItems.map((item) => {
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-display">{item.label}</span>
            </RouterNavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex flex-1">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
