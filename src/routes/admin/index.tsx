import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AdminShell } from "@/components/AdminShell";
import { useAdminStats, useDeptDistribution, useActivityFeed, usePendingCount } from "@/hooks/use-admin-stats";
import { useCreateAnnouncement } from "@/hooks/use-announcements";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
  head: () => ({
    meta: [
      { title: "Admin Overview | IEEE Ambassador Portal" },
      {
        name: "description",
        content:
          "Admin command center: ambassador growth, task completion analytics, pending reviews and live ambassador activity.",
      },
      { property: "og:title", content: "Admin Overview | IEEE Ambassador Portal" },
      {
        property: "og:description",
        content: "Monitor ambassadors, tasks, points and live activity from the admin command center.",
      },
    ],
  }),
});

function AdminOverviewPage() {
  const { profile } = useAuth();
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: depts, isLoading: loadingDepts } = useDeptDistribution();
  const { data: feed, isLoading: loadingFeed } = useActivityFeed();
  const { data: pendingCount } = usePendingCount();

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const createAnnouncement = useCreateAnnouncement();

  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) return;
    try {
      await createAnnouncement.mutateAsync({ title: annTitle.trim(), body: annBody.trim() });
      toast.success("Announcement published!");
      setShowAnnouncementModal(false);
      setAnnTitle("");
      setAnnBody("");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    }
  };

  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <AdminShell title="Overview">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
            Command Center
          </p>
          <h1 className="text-headline-lg text-on-surface text-balance">
            Hello, {profile?.full_name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-body-md text-on-surface-variant">{today}</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link
            to="/admin/tasks"
            className="col-span-2 bg-primary text-on-primary rounded-xl p-4 flex items-center justify-between shadow-md active:scale-[0.98] transition-transform"
          >
            <span className="flex flex-col items-start gap-1">
              <Icon name="add_task" className="text-primary-fixed" />
              <span className="text-body-lg font-semibold">Create Task</span>
            </span>
            <Icon name="arrow_forward" className="opacity-50" />
          </Link>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="bg-secondary-container text-on-secondary-container rounded-xl p-4 flex flex-col items-start gap-3 shadow-sm active:scale-[0.98] transition-transform"
          >
            <Icon name="campaign" className="text-secondary" />
            <span className="font-label-md text-label-md">Blast Notice</span>
          </button>
          <Link
            to="/admin/tasks"
            search={{ tab: "reviews" }}
            className="bg-tertiary-container text-on-tertiary-container rounded-xl p-4 flex flex-col items-start gap-3 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {(stats?.pendingReviews ?? 0) > 0 && (
              <span className="absolute -right-4 -top-4 w-16 h-16 bg-error/10 rounded-full animate-pulse" />
            )}
            <Icon name="rate_review" className="text-error" />
            <span className="flex items-center gap-1">
              <span className="font-label-md text-label-md">Review</span>
              {(stats?.pendingReviews ?? 0) > 0 && (
                <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-sm text-[10px]">
                  {stats?.pendingReviews}
                </span>
              )}
            </span>
          </Link>
        </div>

        {/* Platform health */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface">Platform Health</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="col-span-2 bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col gap-1">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <Icon name="group" className="text-[16px]" />
                Total Ambassadors
              </p>
              <div className="flex items-end justify-between gap-2">
                {loadingStats ? (
                  <span className="text-display-lg text-on-surface animate-pulse">—</span>
                ) : (
                  <span className="text-display-lg text-on-surface">
                    {stats?.totalVolunteers ?? 0}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col gap-1">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Active Tasks</p>
              <span className="text-headline-md text-primary">
                {loadingStats ? "—" : stats?.activeTasks ?? 0}
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col gap-1">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Pending Reviews</p>
              <span className="text-headline-md text-error">
                {loadingStats ? "—" : stats?.pendingReviews ?? 0}
              </span>
            </div>
          </div>
        </section>

        {/* Analytics — Dept distribution */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface">Ambassador Departments</h2>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/50 flex flex-col gap-4">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Distribution</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Active ambassadors by department
              </p>
            </div>
            {loadingDepts ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-surface-container rounded" />
                ))}
              </div>
            ) : !depts || depts.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No data yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {depts.map((d) => (
                  <div key={d.name} className="flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-on-surface">{d.name}</span>
                      <span className="text-on-surface-variant">{d.pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                      <div
                        className={`${d.bar} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Live activity */}
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface flex items-center gap-2">
            Live Activity
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
            </span>
          </h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/50 overflow-hidden">
            {loadingFeed ? (
              <div className="animate-pulse space-y-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 h-16 border-b border-outline-variant/50" />
                ))}
              </div>
            ) : !feed || feed.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-body-sm">
                No recent activity
              </div>
            ) : (
              feed.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 flex gap-4 items-start border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/60 transition-colors"
                >
                  {item.avatar ? (
                    <img
                      alt={`${item.name} avatar`}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      src={item.avatar}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                      <Icon
                        name={item.type === "new_user" ? "person_add" : "task_alt"}
                        className="text-[20px]"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-body-sm text-on-surface">
                      <span className="font-semibold">{item.name}</span> {item.text}{" "}
                      {item.highlight && (
                        <span className="text-primary font-medium">{item.highlight}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-label-sm text-[10px] text-on-surface-variant">
                        {item.time}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-surface-container-high" />
                      <span className={`font-label-sm text-[10px] font-medium ${item.metaClass}`}>
                        {item.meta}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Announcement modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-headline-md text-on-surface mb-1">Publish Announcement</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              This will be visible to all ambassadors on their dashboard.
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Title
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Announcement title..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Message
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write the announcement body..."
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnTitle("");
                  setAnnBody("");
                }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={!annTitle.trim() || !annBody.trim() || createAnnouncement.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {createAnnouncement.isPending ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
