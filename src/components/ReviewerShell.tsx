import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";

const NAV = [
  { to: "/reviewer/submissions", label: "Submissions", icon: "rate_review", short: "Submissions" },
];

interface ReviewerShellProps {
  children: ReactNode;
  title?: string;
}

export function ReviewerShell({ children, title }: ReviewerShellProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (profile?.full_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-surface-container-low border-r border-outline-variant flex flex-col z-40 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto",
        )}
      >
        <div className="px-6 py-5 border-b border-outline-variant/50">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-0.5">Reviewer Portal</p>
          <p className="text-headline-md text-on-surface">IEEE SJCET SBA</p>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-md transition-all",
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                <Icon name={item.icon} filled={active} className="text-[20px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-outline-variant/50">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img alt={profile.full_name} className="w-10 h-10 rounded-full object-cover" src={profile.avatar_url} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold">
                {initials}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-body-md text-on-surface font-semibold truncate">{profile?.full_name}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Reviewer</span>
            </div>
            <button onClick={handleSignOut} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Sign out">
              <Icon name="logout" className="text-[20px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 bg-surface-container-low border-b border-outline-variant px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
            <Icon name="menu" />
          </button>
          <span className="text-headline-md text-on-surface font-semibold flex-1 truncate">{title || "Reviewer Portal"}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0">
                {profile?.avatar_url ? (
                  <img alt={profile.full_name} className="w-9 h-9 rounded-full object-cover" src={profile.avatar_url} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold">
                    {initials}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="text-error focus:text-error focus:bg-error/10" onClick={handleSignOut}>
                <Icon name="logout" className="mr-2 text-[18px]" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
