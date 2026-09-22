import { Link, useLocation } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "home", match: (p: string) => p === "/" },
  { to: "/scan", label: "scan", match: (p: string) => p.startsWith("/scan") || p.startsWith("/analyzing") },
  { to: "/treatments", label: "treatments", match: (p: string) => p.startsWith("/treatments") || p.startsWith("/report") },
  { to: "/history", label: "history", match: (p: string) => p.startsWith("/history") },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="text-xl font-bold lowercase tracking-tight">
          treatme<span className="text-hot">.</span>
        </Link>
        <nav className="hidden items-center gap-7 sm:flex">
          {NAV.map((n) => (
            <TopLink key={n.to} to={n.to} label={n.label} />
          ))}
        </nav>
        <Link to="/scan" className="tm-btn-primary !h-10 !px-5 text-sm">
          scan my skin
        </Link>
      </div>
    </header>
  );
}

function TopLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium lowercase text-ink-soft transition-colors hover:text-hot"
      activeProps={{ className: "text-hot" }}
    >
      {label}
    </Link>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 backdrop-blur sm:hidden">
      <div className="grid grid-cols-4">
        {NAV.map((n) => {
          const active = n.match(pathname);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center gap-1 py-3 text-[0.7rem] font-semibold lowercase ${
                active ? "text-hot" : "text-ink-mute"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-hot" : "bg-line"}`}
              />
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
