import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { LOGO_URL } from "./branding";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "./AuthGuard";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", mobileIcon: "grid_view", short: "Dashboard" },
  { to: "/tasks", label: "Tasks", icon: "assignment", mobileIcon: "task_alt", short: "Tasks" },
  { to: "/leaderboard", label: "Leaderboard", icon: "leaderboard", mobileIcon: "leaderboard", short: "Ranking" },
  { to: "/profile", label: "Profile", icon: "person", mobileIcon: "person_outline", short: "Profile" },
] as const;

export function PortalShell({
  children,
  eyebrow,
  showSearch = false,
}: {
  children: ReactNode;
  eyebrow?: string;
  showSearch?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || "Ambassador";
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
    <AuthGuard>
      <div className="min-h-screen bg-surface">
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant z-50 flex-col pt-6 pb-8">
          <div className="px-6 mb-8 flex items-center gap-2">
            <img alt="IEEE logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
            <span className="text-headline-md font-semibold text-primary tracking-tight">
              IEEE SB SJCET
            </span>
          </div>
          <nav className="flex-1 px-4 flex flex-col gap-1">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-4 mb-2">
              Volunteer
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
            {profile?.role === "admin" && (
              <>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-4 mb-2 mt-6">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-4 px-6 py-3 rounded-xl transition-all font-label-md text-label-md",
                    pathname.startsWith("/admin")
                      ? "bg-primary text-on-primary shadow-lg"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  <Icon name="admin_panel_settings" />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>
          <div className="p-6 mt-auto space-y-2">
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4">
              {avatarUrl ? (
                <img
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed"
                  src={avatarUrl}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-md text-label-md font-bold border-2 border-primary-fixed">
                  {initials}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-label-md font-semibold text-on-surface truncate">{displayName}</span>
                <span className="text-label-sm text-on-surface-variant truncate capitalize">{profile?.role || "Ambassador"}</span>
              </div>
            </div>
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
          <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-[40px]">
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <img alt="IEEE logo" className="h-6 w-auto shrink-0" src={LOGO_URL} />
              <span className="truncate text-headline-md font-semibold text-primary">Ambassador</span>
            </div>
            {eyebrow ? (
              <span className="hidden lg:block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                {eyebrow}
              </span>
            ) : (
              <div className="hidden lg:block" />
            )}
            <div className="flex shrink-0 items-center gap-1 sm:gap-3 lg:gap-6 justify-self-end">
              {showSearch && (
                <div className="hidden md:flex items-center bg-surface-container-high px-4 py-1 rounded-full border border-outline-variant">
                  <Icon name="search" className="text-on-surface-variant text-[18px] mr-2" />
                  <input
                    className="bg-transparent border-none outline-none text-body-sm w-40 xl:w-48 text-on-surface"
                    placeholder="Search tasks..."
                    type="text"
                  />
                </div>
              )}
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
                  title="Switch to Admin View"
                >
                  <Icon name="admin_panel_settings" />
                </Link>
              )}
              <NotificationBell />
              <div className="flex items-center gap-3 lg:pl-4 lg:border-l border-outline-variant">
                <div className="text-right hidden sm:block">
                  <div className="font-label-md text-label-md text-on-surface font-bold leading-none">
                    {displayName}
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant capitalize">{profile?.role || "Ambassador"}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                      {avatarUrl ? (
                        <img
                          alt="Profile"
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
            </div>
          </header>

          <main className="relative bg-surface pt-20 pb-28 px-4 sm:px-6 lg:pt-24 lg:px-[40px] lg:pb-12">
            <div className="mx-auto w-full max-w-[80rem]">{children}</div>
          </main>
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-outline-variant z-50 grid grid-cols-4 items-center h-16 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
          {NAV.map((item) => {
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
                <Icon name={item.mobileIcon} />
                <span className={cn("font-label-sm text-label-sm", active && "font-bold")}>
                  {item.short}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AuthGuard>
  );
}
