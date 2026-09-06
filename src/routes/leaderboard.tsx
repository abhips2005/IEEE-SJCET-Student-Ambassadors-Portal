import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { LeaderboardView } from "@/components/LeaderboardView";

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

function LeaderboardPage() {
  return (
    <PortalShell eyebrow="Ambassador Portal">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">Leaderboard</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Ambassador standings ranked by total points earned across tasks and events.
          </p>
        </header>

        <LeaderboardView />
      </div>
    </PortalShell>
  );
}
