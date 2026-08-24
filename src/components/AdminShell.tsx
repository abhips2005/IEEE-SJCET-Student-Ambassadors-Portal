import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { LOGO_URL } from "./branding";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { AdminGuard } from "./AuthGuard";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/admin", label: "Overview", icon: "dashboard", short: "Overview" },
  { to: "/admin/tasks", label: "Task Management", icon: "assignment", short: "Tasks" },
  { to: "/admin/ambassadors", label: "Ambassadors", icon: "group", short: "People" },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: "leaderboard", short: "Leaderboard" },
  { to: "/admin/gallery", label: "Gallery", icon: "photo_library", short: "Gallery" },
  { to: "/admin/queries", label: "Queries", icon: "help_center", short: "Queries" },
  { to: "/admin/member-additions", label: "Member Additions", icon: "group_add", short: "Members" },
] as const;


export function AdminShell({
  children,
  title,
  headerAction,
}: {
  children: ReactNode;
  title: string;
  headerAction?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || "Admin";
  const avatarUrl = profile?.avatar_url;
  const initials = displayName
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
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant z-50 flex-col pt-6 pb-8">
          <div className="px-6 mb-8 flex items-center gap-2">
            <img alt="IEEE logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
            <span className="text-headline-md font-semibold text-primary tracking-tight">
              IEEE Admin
            </span>
          </div>
          <nav className="flex-1 px-4 flex flex-col gap-1">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-4 mb-2">
              Command Center
            </div>
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-4 px-6 py-3 rounded-xl transition-all font-label-md text-label-md",
                    active
                      ? "bg-primary text-on-primary shadow-lg"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-6 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors"
            >
              <Icon name="swap_horiz" />
              Ambassador View
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-6 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors"
            >
              <Icon name="logout" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between gap-3 px-4 lg:px-[40px]">
            <div className="flex min-w-0 items-center gap-3">
              <img alt="IEEE logo" className="h-8 w-auto shrink-0 object-contain lg:hidden" src={LOGO_URL} />
              <span className="truncate text-headline-md font-semibold text-on-surface">{title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              {headerAction}
              <Link
                to="/dashboard"
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
                title="Switch to Ambassador View"
              >
                <Icon name="swap_horiz" />
              </Link>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                    {avatarUrl ? (
                      <img
                        alt="Admin profile"
                        className="w-9 h-9 shrink-0 rounded-full object-cover border-2 border-primary-fixed cursor-pointer"
                        src={avatarUrl}
                      />
                    ) : (
                      <div className="w-9 h-9 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold border-2 border-primary-fixed cursor-pointer">
                        {initials}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 lg:hidden">
                  <DropdownMenuItem className="text-error cursor-pointer gap-2" onClick={handleSignOut}>
                    <Icon name="logout" className="text-[18px]" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="relative bg-surface pt-20 pb-28 px-4 sm:px-6 lg:pt-24 lg:px-[40px] lg:pb-12">
            <div className="mx-auto w-full max-w-[80rem]">{children}</div>
          </main>
        </div>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-outline-variant z-50 grid grid-cols-4 items-center h-16 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
          {NAV.slice(0, 3).map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 transition-colors active:scale-95",
                  active ? "text-primary" : "text-on-surface-variant",
                )}
              >
                <Icon name={item.icon} />
                <span className={cn("font-label-sm text-[10px]", active && "font-bold")}>
                  {item.short}
                </span>
              </Link>
            );
          })}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-full flex-col items-center justify-center gap-1 transition-colors text-on-surface-variant active:scale-95 outline-none">
                <Icon name="more_horiz" />
                <span className="font-label-sm text-[10px]">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mb-2">
              {NAV.slice(3).map((item) => {
                const active = pathname === item.to;
                return (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 py-3 w-full cursor-pointer",
                        active && "text-primary font-bold"
                      )}
                    >
                      <Icon name={item.icon} className="text-[18px]" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </AdminGuard>
  );
}
