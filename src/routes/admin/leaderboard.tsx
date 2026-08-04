import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { LeaderboardView } from "@/components/LeaderboardView";

export const Route = createFileRoute("/admin/leaderboard")({
  component: AdminLeaderboardPage,
  head: () => ({
    meta: [
      { title: "Leaderboard | Admin | IEEE Student Ambassador Portal" },
    ],
  }),
});

function AdminLeaderboardPage() {
  return (
    <AdminShell title="Leaderboard">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Ambassador standings ranked by total points earned across tasks and events.
          </p>
        </header>

        <div className="max-w-4xl">
          <LeaderboardView />
        </div>
      </div>
    </AdminShell>
  );
}
