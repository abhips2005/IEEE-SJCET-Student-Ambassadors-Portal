import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { Icon } from "./Icon";

/** Redirects to /login if not authenticated. Shows spinner while loading. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  // If profile is pending, show pending message
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mx-auto">
            <Icon name="hourglass_top" className="text-primary text-[32px]" />
          </div>
          <h1 className="text-headline-lg text-on-surface">Account Pending Approval</h1>
          <p className="text-body-md text-on-surface-variant">
            Your ambassador registration has been submitted. An admin will review and approve your
            account shortly. You'll be able to access the portal once approved.
          </p>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="mt-4 px-6 py-3 bg-surface-container text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Redirects non-admins to /dashboard */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    } else if (!loading && profile && profile.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, profile, navigate]);

  if (loading) return <LoadingScreen />;
  if (!user || !profile || profile.role !== "admin") return null;

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Icon name="progress_activity" className="animate-spin text-primary text-[40px]" />
        <span className="font-label-md text-label-md text-on-surface-variant">Loading…</span>
      </div>
    </div>
  );
}
