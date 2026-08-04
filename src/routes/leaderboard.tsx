import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/hooks/use-profiles";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => ({
    meta: [
      { title: "Leaderboard | IEEE Student Ambassador Portal" },
      {
        name: "description",
        content:
          "See how ambassadors rank by points earned across tasks, events and outreach this semester.",
      },
      { property: "og:title", content: "Ambassador Leaderboard" },
      { property: "og:description", content: "Top IEEE student ambassadors ranked by points." },
    ],
  }),
});

const DEPT_LABELS: Record<string, string> = {
  cs: "Computer Science",
  ee: "Electrical Engineering",
  me: "Mechanical Eng.",
  other: "Other",
};

function LeaderboardPage() {
  const { user } = useAuth();
  const { data: ranks, isLoading } = useLeaderboard();

  return (
    <PortalShell eyebrow="Volunteer Portal">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">Leaderboard</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Ambassador standings ranked by total points earned across tasks and events.
          </p>
        </header>

        {isLoading ? (
          <div className="bg-surface-container-lowest rounded-xl p-4 animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-surface-container rounded-lg" />
            ))}
          </div>
        ) : !ranks || ranks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="leaderboard" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">No active ambassadors yet. Be the first!</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
            {ranks.map((r, i) => {
              const isMe = r.id === user?.id;
              const initials = (r.full_name || "?")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-b border-outline-variant/40 last:border-b-0",
                    isMe && "bg-primary-fixed/50",
                  )}
                >
                  <span
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-label-md text-label-md shrink-0",
                      i < 3
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant",
                    )}
                  >
                    {i + 1}
                  </span>
                  {r.avatar_url ? (
                    <img
                      alt={r.full_name}
                      className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full object-cover"
                      src={r.avatar_url}
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-body-md text-on-surface font-semibold truncate">
                      {r.full_name}
                      {isMe && (
                        <span className="ml-2 text-primary font-label-sm text-label-sm">(You)</span>
                      )}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      {DEPT_LABELS[r.department] || r.department}
                    </span>
                  </div>
                  <span className="text-headline-md text-primary font-bold flex shrink-0 items-center gap-1">
                    <Icon name="stars" className="text-[18px]" />
                    {r.points.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
