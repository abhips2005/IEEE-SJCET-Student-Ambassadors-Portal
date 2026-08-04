import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { cn } from "@/lib/utils";
import { useTasks, useMyAssignments, useClaimTask, useSubmitProof } from "@/hooks/use-tasks";
import { useAuth } from "@/lib/auth-context";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({
    meta: [
      { title: "Volunteer Tasks | IEEE Student Ambassador Portal" },
      {
        name: "description",
        content:
          "Browse available IEEE ambassador volunteer tasks, track deadlines and earn ambassador points in your region.",
      },
      { property: "og:title", content: "Volunteer Tasks" },
      { property: "og:description", content: "Find IEEE volunteer tasks and earn ambassador points." },
    ],
  }),
});

const TABS = ["Available", "In Progress", "Completed"];
const CATEGORY_LABELS: Record<string, string> = {
  event_organization: "Event Organization",
  content_creation: "Content Creation",
  mentorship: "Mentorship",
  outreach: "Outreach",
};
const CATEGORY_ICONS: Record<string, string> = {
  event_organization: "event",
  content_creation: "article",
  mentorship: "school",
  outreach: "campaign",
};
const CATEGORY_STYLES: Record<string, string> = {
  event_organization: "bg-secondary-container/30 text-on-secondary-container",
  content_creation: "bg-tertiary-container/20 text-tertiary",
  mentorship: "bg-primary/10 text-primary",
  outreach: "bg-secondary-container/30 text-on-secondary-container",
};

function TasksPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [proofModal, setProofModal] = useState<{ assignmentId: string; taskTitle: string } | null>(null);
  const [proofText, setProofText] = useState("");

  const { data: allTasks, isLoading: loadingTasks } = useTasks(
    categoryFilter ? { category: categoryFilter } : undefined,
  );
  const { data: assignments, isLoading: loadingAssignments } = useMyAssignments();
  const claimTask = useClaimTask();
  const submitProof = useSubmitProof();

  const myClaimedTaskIds = new Set(assignments?.map((a) => a.task_id) ?? []);

  // Filter tasks based on tab
  const availableTasks =
    allTasks?.filter((t) => {
      if (t.status !== "open" && t.status !== "in_progress") return false;
      if (myClaimedTaskIds.has(t.id)) return false;
      
      // Target audience filtering
      if (t.target_department && t.target_department !== profile?.department) return false;
      if (t.target_semester && t.target_semester !== profile?.semester) return false;
      
      return true;
    }) ?? [];
  const inProgressAssignments =
    assignments?.filter((a) => a.status === "claimed" || a.status === "submitted") ?? [];
  const completedAssignments =
    assignments?.filter((a) => a.status === "approved" || a.status === "rejected") ?? [];

  const displayTasks =
    tab === 0
      ? availableTasks
      : tab === 1
        ? inProgressAssignments.map((a) => a.task).filter(Boolean)
        : completedAssignments.map((a) => a.task).filter(Boolean);

  const filteredTasks = displayTasks.filter((t) => {
    if (!t) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClaim = async (taskId: string) => {
    try {
      await claimTask.mutateAsync(taskId);
      toast.success("Task claimed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim task");
    }
  };

  const handleSubmitProof = async () => {
    if (!proofModal || !proofText.trim()) return;
    try {
      await submitProof.mutateAsync({
        assignmentId: proofModal.assignmentId,
        proofText: proofText.trim(),
      });
      toast.success("Proof submitted for review!");
      setProofModal(null);
      setProofText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit proof");
    }
  };

  const getAssignment = (taskId: string) => assignments?.find((a) => a.task_id === taskId);

  return (
    <PortalShell eyebrow="Volunteer Portal" showSearch>
      <div className="flex flex-col w-full gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">
            Volunteer Tasks
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Manage your assignments, track upcoming deadlines, and discover new opportunities to earn
            ambassador points.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-surface-variant pb-1">
          {TABS.map((t, i) => {
            const count =
              i === 0
                ? availableTasks.length
                : i === 1
                  ? inProgressAssignments.length
                  : completedAssignments.length;
            return (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={cn(
                  "px-4 py-3 font-label-md text-label-md transition-colors rounded-t-lg",
                  tab === i
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low",
                )}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Filter:
            </span>
            <select
              className="bg-surface-container-low border-none rounded-lg px-4 py-1 font-label-md text-label-md text-on-surface outline-none focus:ring-2 ring-primary/20"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="event_organization">Event Organization</option>
              <option value="content_creation">Content Creation</option>
              <option value="mentorship">Mentorship</option>
              <option value="outreach">Outreach</option>
            </select>
          </div>
          <div className="flex items-center bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/30">
            <Icon name="search" className="text-on-surface-variant text-[18px] mr-2" />
            <input
              className="bg-transparent border-none outline-none text-body-sm w-40 text-on-surface"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Task grid */}
        {loadingTasks || loadingAssignments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-6 animate-pulse h-56" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="inventory_2" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">
              {tab === 0
                ? "No available tasks right now. Check back later!"
                : tab === 1
                  ? "No tasks in progress. Claim one from the Available tab!"
                  : "No completed tasks yet. Start volunteering!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredTasks.map((task) => {
              if (!task) return null;
              const assignment = getAssignment(task.id);
              const isOverdue = task.due_date && isPast(new Date(task.due_date));

              return (
                <article
                  key={task.id}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition-all relative overflow-hidden group border border-surface-variant hover:border-primary-fixed-dim"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <span
                      className={cn(
                        "inline-flex min-w-0 items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm",
                        CATEGORY_STYLES[task.category] || "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      <Icon
                        name={CATEGORY_ICONS[task.category] || "task"}
                        className="text-[14px] shrink-0"
                      />
                      <span className="truncate">
                        {CATEGORY_LABELS[task.category] || task.category}
                      </span>
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold flex shrink-0 items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap">
                      <Icon name="stars" className="text-[16px]" />
                      {task.points_reward} pts
                    </span>
                  </div>

                  <div>
                    <h2 className="text-headline-md text-on-surface mb-1 leading-tight">
                      {task.title}
                    </h2>
                    <p className="text-body-sm text-on-surface-variant line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex flex-wrap items-center justify-between border-t border-surface-variant gap-3">
                    <div
                      className={cn(
                        "flex items-center gap-2 font-label-sm text-label-sm",
                        isOverdue ? "text-error" : "text-on-surface-variant",
                      )}
                    >
                      <Icon
                        name={isOverdue ? "schedule" : "calendar_today"}
                        className="text-[18px]"
                      />
                      <span className="whitespace-nowrap">
                        {task.due_date
                          ? isOverdue
                            ? "Overdue"
                            : `Due: ${format(new Date(task.due_date), "MMM d, yyyy")}`
                          : "No deadline"}
                      </span>
                    </div>

                    {/* Action button based on tab */}
                    {tab === 0 && !assignment && (
                      <button
                        onClick={() => handleClaim(task.id)}
                        disabled={claimTask.isPending}
                        className="px-4 py-2.5 bg-primary/10 text-primary font-label-md text-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors shrink-0 disabled:opacity-50"
                      >
                        Claim Task
                      </button>
                    )}
                    {tab === 1 && assignment?.status === "claimed" && (
                      <button
                        onClick={() =>
                          setProofModal({ assignmentId: assignment.id, taskTitle: task.title })
                        }
                        className="px-4 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors shrink-0"
                      >
                        Submit Proof
                      </button>
                    )}
                    {tab === 1 && assignment?.status === "submitted" && (
                      <span className="px-3 py-1.5 rounded-full border border-primary text-primary font-label-sm text-label-sm">
                        Awaiting Review
                      </span>
                    )}
                    {tab === 2 && assignment && (
                      <span
                        className={`px-3 py-1.5 rounded-full border font-label-sm text-label-sm ${assignment.status === "approved" ? "border-secondary text-secondary" : "border-error text-error"}`}
                      >
                        {assignment.status === "approved" ? "Approved ✓" : "Rejected"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof submission modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-headline-md text-on-surface mb-1">Submit Proof</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Describe what you completed for "{proofModal.taskTitle}"
            </p>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md text-on-surface min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the work you completed, any links or evidence..."
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setProofModal(null);
                  setProofText("");
                }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProof}
                disabled={!proofText.trim() || submitProof.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {submitProof.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
