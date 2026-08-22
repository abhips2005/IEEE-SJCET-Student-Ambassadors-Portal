import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AdminShell } from "@/components/AdminShell";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAllAssignments,
  useReviewAssignment,
} from "@/hooks/use-tasks";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/database.types";
import { DEPARTMENTS } from "@/lib/constants";
import type { TargetRole } from "@/lib/database.types";

type TasksSearch = {
  tab?: string | undefined;
};

export const Route = createFileRoute("/admin/tasks")({
  validateSearch: (search: Record<string, unknown>): TasksSearch => ({
    tab: search['tab'] as string | undefined,
  }),
  component: AdminTasksPage,
  head: () => ({
    meta: [
      { title: "Task Management | IEEE Ambassador Admin" },
      {
        name: "description",
        content:
          "Create, assign and review ambassador tasks: track progress, deadlines, points and pending reviews.",
      },
      { property: "og:title", content: "Task Management | IEEE Ambassador Admin" },
      {
        property: "og:description",
        content: "Manage ambassador tasks, deadlines, progress and reviews in one place.",
      },
    ],
  }),
});

const CATEGORY_LABELS: Record<string, string> = {
  event_organization: "Event",
  content_creation: "Content",
  mentorship: "Mentorship",
  outreach: "Outreach",
};

const CATEGORY_STYLES: Record<string, string> = {
  event_organization: "text-primary bg-primary-fixed",
  content_creation: "text-on-secondary-container bg-secondary-container",
  mentorship: "text-on-surface-variant bg-surface-container",
  outreach: "text-primary bg-primary/10",
};

function AdminTasksPage() {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { tab } = Route.useSearch();
  const [reviewTab, setReviewTab] = useState(tab === "reviews");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("outreach");
  const [formPoints, setFormPoints] = useState("50");
  const [formDueDate, setFormDueDate] = useState("");
  const [formMaxClaim, setFormMaxClaim] = useState("1");
  const [formTargetDept, setFormTargetDept] = useState("all");
  const [formTargetSem, setFormTargetSem] = useState("all");
  const [formTargetRole, setFormTargetRole] = useState<"all" | "class_ambassador" | "dept_ambassador">("all");

  const { data: tasks, isLoading } = useTasks();
  const { data: reviewerApprovedItems } = useAllAssignments("reviewer_approved");
  const submissions = reviewerApprovedItems ?? [];
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reviewAssignment = useReviewAssignment();

  const filteredTasks = tasks?.filter(
    (t) => !search || t.title.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormCategory("outreach");
    setFormPoints("50");
    setFormDueDate("");
    setFormMaxClaim("1");
    setFormTargetDept("all");
    setFormTargetSem("all");
    setFormTargetRole("all");
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormCategory(task.category);
    setFormPoints(String(task.points_reward));
    setFormDueDate(task.due_date || "");
    setFormMaxClaim(String(task.max_claimants));
    setFormTargetDept(task.target_department || "all");
    setFormTargetSem(task.target_semester ? String(task.target_semester) : "all");
    setFormTargetRole((task.target_role as any) || "all");
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          title: formTitle.trim(),
          description: formDesc.trim(),
          category: formCategory as any,
          points_reward: parseInt(formPoints, 10) || 0,
          due_date: formDueDate || null,
          max_claimants: parseInt(formMaxClaim, 10) || 1,
          target_department: formTargetDept === "all" ? null : formTargetDept,
          target_semester: formTargetSem === "all" ? null : parseInt(formTargetSem, 10),
        });
        toast.success("Task updated!");
      } else {
        await createTask.mutateAsync({
          title: formTitle.trim(),
          description: formDesc.trim(),
          category: formCategory as any,
          points_reward: parseInt(formPoints, 10) || 0,
          due_date: formDueDate || null,
          status: "open",
          max_claimants: parseInt(formMaxClaim, 10) || 1,
          target_role: formTargetRole,
          target_department: formTargetDept === "all" ? null : formTargetDept,
          target_semester: formTargetRole === "dept_ambassador" ? null : (formTargetSem === "all" ? null : parseInt(formTargetSem, 10)),
        });
        toast.success("Task created!");
      }
      setShowCreateModal(false);
      setEditingTask(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleReview = async (assignmentId: string, decision: "approved" | "rejected") => {
    try {
      await reviewAssignment.mutateAsync({ assignmentId, decision });
      toast.success(decision === "approved" ? "Task approved — points awarded!" : "Submission rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to review");
    }
  };

  const activeTasks = filteredTasks.filter((t) => t.status !== "archived");
  const pendingSubmissions = submissions ?? [];

  return (
    <AdminShell title="Task Management">
      <div className="flex flex-col gap-6">
        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              aria-label="Search tasks"
              className="w-full h-12 pl-11 pr-3 rounded-xl bg-surface-container-highest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-shadow"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1 px-4 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-md active:scale-95 transition-transform whitespace-nowrap shrink-0"
          >
            <Icon name="add" className="text-[18px]" />
            New Task
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center gap-4 border-b border-surface-variant pb-1">
          <button
            onClick={() => setReviewTab(false)}
            className={cn(
              "px-4 py-3 font-label-md text-label-md transition-colors rounded-t-lg",
              !reviewTab
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            All Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setReviewTab(true)}
            className={cn(
              "px-4 py-3 font-label-md text-label-md transition-colors rounded-t-lg flex items-center gap-2",
              reviewTab
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            Reviewer Approved
            {pendingSubmissions.length > 0 && (
              <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-4 animate-pulse h-44" />
            ))}
          </div>
        ) : reviewTab ? (
          /* Pending review submissions */
          pendingSubmissions.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <Icon name="check_circle" className="text-[48px] opacity-30 mb-3" />
              <p className="text-body-md">All caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingSubmissions.map((sub: any) => (
                <article
                  key={sub.id}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-body-lg font-semibold text-on-surface">{sub.task?.title || "Unknown Task"}</h3>
                        <span className="font-label-sm text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Icon name="verified" className="text-[12px]" />
                          {sub.reviewer?.full_name ? `Reviewed by ${sub.reviewer.full_name}` : "Reviewer ✓"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {sub.user?.avatar_url ? (
                          <img className="w-6 h-6 rounded-full object-cover" src={sub.user.avatar_url} alt="" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-[10px] font-bold">
                            {(sub.user?.full_name || "?")[0]}
                          </div>
                        )}
                        <span className="text-body-sm text-on-surface-variant">{sub.user?.full_name || "Unknown"}</span>
                      </div>
                    </div>
                    <span className="font-label-md text-label-md text-primary font-bold whitespace-nowrap">
                      +{sub.task?.points_reward ?? 0} pts
                    </span>
                  </div>
                  {sub.proof_text && (
                    <div className="bg-surface-container rounded-lg p-3">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                        Submitted Proof
                      </p>
                      <p className="text-body-sm text-on-surface">{sub.proof_text}</p>
                    </div>
                  )}
                  {sub.reviewer_remarks && (
                    <div className="bg-secondary-container/30 rounded-lg p-3 border-l-2 border-secondary">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                          Reviewer Notes
                        </p>
                        {sub.reviewer_points_suggested != null && (
                          <span className="font-label-sm text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">
                            Suggests {sub.reviewer_points_suggested} pts
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface">{sub.reviewer_remarks}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {sub.submitted_at
                        ? format(new Date(sub.submitted_at), "MMM d, yyyy")
                        : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(sub.id, "rejected")}
                        disabled={reviewAssignment.isPending}
                        className="px-4 py-2 border border-error text-error font-label-md text-label-md rounded-lg hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReview(sub.id, "approved")}
                        disabled={reviewAssignment.isPending}
                        className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : activeTasks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="assignment" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          /* All tasks grid */
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {activeTasks.map((t) => (
              <article
                key={t.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span
                      className={`font-label-sm text-label-sm px-2 py-1 rounded inline-block ${CATEGORY_STYLES[t.category] || "bg-surface-container text-on-surface-variant"}`}
                    >
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    <h2 className="text-body-lg font-semibold text-on-surface mt-2 leading-snug">
                      {t.title}
                    </h2>
                  </div>
                  <span className="font-label-md text-label-md font-bold whitespace-nowrap text-primary">
                    +{t.points_reward} pts
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-on-surface-variant mt-auto">
                  <div className="flex items-center gap-1">
                    <Icon name="calendar_today" className="text-[16px]" />
                    <span className="font-label-sm text-label-sm whitespace-nowrap">
                      {t.due_date ? format(new Date(t.due_date), "MMM d") : "No deadline"}
                    </span>
                  </div>
                  <span
                    className={`font-label-sm text-label-sm capitalize ${t.status === "open" ? "text-secondary" : t.status === "completed" ? "text-on-surface-variant" : "text-primary"}`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
                  <button
                    onClick={() => openEdit(t)}
                    className="flex-1 px-3 py-2 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
                  >
                    <Icon name="edit" className="text-[16px]" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t.id)}
                    className="px-3 py-2 text-error hover:bg-error/10 font-label-sm text-label-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Icon name="delete" className="text-[16px]" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-headline-md text-on-surface mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Title</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Task title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Description</label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the task..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">Category</label>
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="event_organization">Event Organization</option>
                    <option value="content_creation">Content Creation</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="outreach">Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">Points Reward</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">Max Claimants</label>
                  <input
                    type="number"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formMaxClaim}
                    onChange={(e) => setFormMaxClaim(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Target Audience</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formTargetRole}
                  onChange={(e) => setFormTargetRole(e.target.value as TargetRole)}
                >
                  <option value="all">All Ambassadors</option>
                  <option value="class_ambassador">Class Ambassadors Only</option>
                  <option value="dept_ambassador">Dept Ambassadors Only</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">Target Department</label>
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formTargetDept}
                    onChange={(e) => setFormTargetDept(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                {formTargetRole !== "dept_ambassador" && (
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">Target Semester</label>
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formTargetSem}
                      onChange={(e) => setFormTargetSem(e.target.value)}
                    >
                      <option value="all">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={String(sem)}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || createTask.isPending || updateTask.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {createTask.isPending || updateTask.isPending
                  ? "Saving..."
                  : editingTask
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <Icon name="delete" className="text-error text-[28px]" />
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">Delete Task?</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">
              This action cannot be undone. All assignments for this task will also be removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteTask.isPending}
                className="px-6 py-2 bg-error text-on-error font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {deleteTask.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
