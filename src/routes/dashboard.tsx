import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { useAuth } from "@/lib/auth-context";
import { useMyAssignments } from "@/hooks/use-tasks";
import { useAnnouncements } from "@/hooks/use-announcements";
import { format, formatDistanceToNow, isPast } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard | IEEE Student Ambassador Portal" },
      {
        name: "description",
        content:
          "Your ambassador dashboard: announcements, active tasks, deadlines and points earned.",
      },
      { property: "og:title", content: "Ambassador Dashboard" },
      { property: "og:description", content: "Track announcements, active tasks and ambassador points." },
    ],
  }),
});

function DashboardPage() {
  const { profile } = useAuth();
  const { data: assignments, isLoading: loadingAssignments } = useMyAssignments();
  const { data: announcements, isLoading: loadingAnnouncements } = useAnnouncements();

  const activeTasks = assignments?.filter(
    (a) => a.status === "claimed" || a.status === "submitted",
  ) ?? [];

  const latestAnnouncement = announcements?.[0];

  return (
    <PortalShell eyebrow="Ambassador Portal">
      <div className="flex flex-col w-full gap-6 text-on-surface">
        {/* Welcome banner */}
        <div className="bg-primary text-on-primary rounded-xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-center min-h-[120px]">
          <svg
            className="absolute top-0 right-0 w-64 h-full opacity-20 text-on-primary"
            fill="currentColor"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M45.7,-76.4C58.9,-69.3,69.2,-55.5,76.5,-41.2C83.7,-26.9,87.9,-12.2,85.2,1.6C82.4,15.3,72.7,28.1,63.1,40.1C53.5,52.2,43.9,63.5,31.7,70.6C19.5,77.7,4.7,80.7,-9.6,79.5C-23.9,78.2,-37.8,72.7,-50.2,64.2C-62.6,55.7,-73.6,44.2,-81.1,30.4C-88.7,16.7,-92.9,0.7,-89.2,-13.6C-85.5,-27.9,-73.9,-40.4,-61.2,-48.9C-48.4,-57.4,-34.5,-61.8,-21.4,-68.5C-8.3,-75.2,4,-84.1,17.2,-83C30.4,-81.9,43.6,-70.7,45.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="relative z-10">
            <h2 className="text-headline-md mb-1">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Ambassador"}!
            </h2>
            <p className="text-body-md text-on-primary/80">
              You have <span className="font-bold">{activeTasks.length}</span> active task
              {activeTasks.length !== 1 ? "s" : ""} and{" "}
              <span className="font-bold">{profile?.points ?? 0}</span> points earned.
              <button 
                onClick={() => window.location.reload()} 
                className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-on-primary/10 transition-colors align-middle" 
                title="Reload Dashboard"
              >
                <Icon name="refresh" className="text-[14px]" />
              </button>
            </p>
          </div>
        </div>

        {/* Latest announcement */}
        {loadingAnnouncements ? (
          <div className="bg-surface-container rounded-lg p-4 animate-pulse h-20" />
        ) : latestAnnouncement ? (
          <div className="bg-secondary-container text-on-secondary-container rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-on-secondary-container/10 p-2.5 rounded-full shrink-0">
                <Icon name="campaign" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-headline-md mb-1">{latestAnnouncement.title}</h3>
                <p className="text-body-sm text-on-secondary-container/80 mb-2">
                  {latestAnnouncement.body}
                </p>
                <span className="font-label-sm text-label-sm text-on-secondary-container/60">
                  {formatDistanceToNow(new Date(latestAnnouncement.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Active tasks */}
        <div className="flex flex-col gap-4 mt-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-outline-variant/50 pb-3">
            <h1 className="truncate text-headline-lg text-on-surface">Active Tasks</h1>
            <Link
              to="/tasks"
              className="shrink-0 text-primary font-label-md text-label-md font-bold hover:bg-primary/10 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              View All <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          {loadingAssignments ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-4 animate-pulse h-28" />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <Icon name="task_alt" className="text-[48px] opacity-30 mb-3" />
              <p className="text-body-md">No active tasks. Browse available tasks to get started!</p>
            </div>
          ) : (
            activeTasks.map((assignment) => {
              const task = assignment.task;
              if (!task) return null;
              const inProgress = assignment.status === "claimed";
              const isOverdue = task.due_date && isPast(new Date(task.due_date));

              const CATEGORY_STYLES: Record<string, string> = {
                event_organization: "bg-secondary-container text-on-secondary-container",
                content_creation: "bg-tertiary-container text-on-tertiary-container",
                mentorship: "bg-primary/10 text-primary",
                outreach: "bg-secondary-container/50 text-on-secondary-container",
              };
              const CATEGORY_LABELS: Record<string, string> = {
                event_organization: "Event Planning",
                content_creation: "Content Creation",
                mentorship: "Mentorship",
                outreach: "Outreach",
              };

              return (
                <div
                  key={assignment.id}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${inProgress ? "bg-secondary" : "bg-primary"} group-hover:bg-primary transition-colors`}
                  />
                  <div className="flex-1 flex flex-col gap-3 pl-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`font-label-sm text-label-sm px-2 py-0.5 rounded uppercase tracking-wider ${CATEGORY_STYLES[task.category] || "bg-surface-container text-on-surface-variant"}`}
                      >
                        {CATEGORY_LABELS[task.category] || task.category}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm flex items-center gap-1 ${isOverdue ? "text-error" : "text-on-surface-variant"}`}
                      >
                        <Icon name="schedule" className="text-[16px]" />
                        {task.due_date
                          ? isOverdue
                            ? "Overdue"
                            : `Due ${format(new Date(task.due_date), "MMM d")}`
                          : "No deadline"}
                      </span>
                    </div>
                    <h4 className="text-headline-md text-on-surface group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-body-md text-on-surface-variant line-clamp-2 sm:line-clamp-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3 sm:min-w-[120px] mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                    <div className="flex flex-col sm:items-end">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Reward
                      </span>
                      <span className="text-headline-md text-primary font-bold">
                        +{task.points_reward} pts
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full border font-label-sm text-label-sm font-medium flex items-center gap-1 ${
                        assignment.status === "submitted"
                          ? "border-primary text-primary bg-primary/5"
                          : "border-secondary text-secondary bg-secondary/5"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${assignment.status === "submitted" ? "bg-primary" : "bg-secondary animate-pulse"}`}
                      />
                      {assignment.status === "submitted" ? "Submitted" : "In Progress"}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="mt-3 border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface-container-low transition-colors group">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <Icon name="add_task" />
            </div>
            <h4 className="text-headline-md text-on-surface">Looking for more?</h4>
            <p className="text-body-md text-on-surface-variant max-w-md">
              Browse the task directory to find new opportunities to earn points and contribute to
              the community.
            </p>
            <Link
              to="/tasks"
              className="mt-2 text-primary font-label-md text-label-md font-bold px-6 py-3 border border-primary rounded-lg hover:bg-primary hover:text-on-primary transition-colors w-full sm:w-auto text-center"
            >
              Browse all tasks
            </Link>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
