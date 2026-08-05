import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { useMyPointActivity } from "@/hooks/use-point-activity";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/point-activity")({
  component: PointActivityPage,
  head: () => ({
    meta: [
      { title: "Point Activity | IEEE Student Ambassador Portal" },
    ],
  }),
});

function PointActivityPage() {
  const { data: activities, isLoading } = useMyPointActivity();

  return (
    <PortalShell eyebrow="Volunteer Portal">
      <div className="flex flex-col w-full gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">
            Point Activity
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Track your point history, including pending task submissions, manual adjustments, and member addition rewards.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-container-lowest rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activities.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:bg-surface-container-low"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.source}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {format(new Date(item.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-headline-sm text-on-surface break-words">{item.title}</h3>
                  {item.remarks && (
                    <div className="mt-2 text-body-sm text-on-surface-variant bg-surface-container/50 p-2.5 rounded-lg border-l-2 border-primary whitespace-pre-wrap">
                      {item.remarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 shrink-0 bg-surface-container sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Icon
                      name="stars"
                      className={cn(
                        "text-[20px]",
                        item.status === "approved" ? "text-primary" : "text-on-surface-variant"
                      )}
                    />
                    <span
                      className={cn(
                        "font-bold text-headline-sm",
                        item.status === "approved" ? "text-primary" : "text-on-surface-variant"
                      )}
                    >
                      {item.points > 0 ? "+" : ""}{item.points}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-label-sm text-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider text-center",
                      item.status === "approved" && "bg-primary/10 text-primary",
                      item.status === "pending" && "bg-secondary/10 text-secondary",
                      item.status === "rejected" && "bg-error/10 text-error"
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
            <Icon name="history" className="text-[48px] opacity-20 mb-3" />
            <h3 className="text-headline-sm text-on-surface mb-1">No Activity Yet</h3>
            <p className="text-body-md">Your point history will appear here once you start completing tasks.</p>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
