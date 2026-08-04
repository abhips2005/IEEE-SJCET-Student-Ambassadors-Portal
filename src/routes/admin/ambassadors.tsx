import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AdminShell } from "@/components/AdminShell";
import { useAllProfiles, useUpdateProfileStatus, useAdjustPoints } from "@/hooks/use-profiles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/ambassadors")({
  component: AdminAmbassadorsPage,
  head: () => ({
    meta: [
      { title: "Ambassadors | IEEE Ambassador Admin" },
      {
        name: "description",
        content: "Manage ambassador accounts: approve pending users, suspend accounts, and adjust points.",
      },
      { property: "og:title", content: "Ambassadors | IEEE Ambassador Admin" },
      {
        property: "og:description",
        content: "Approve, suspend, and manage ambassador accounts and points.",
      },
    ],
  }),
});

const DEPT_LABELS: Record<string, string> = {
  cs: "Computer Science",
  ee: "Electrical Engineering",
  me: "Mechanical Eng.",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-tertiary-container text-on-tertiary-container",
  active: "bg-secondary-container text-on-secondary-container",
  suspended: "bg-error-container text-on-error-container",
};

function AdminAmbassadorsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [pointsModal, setPointsModal] = useState<{ userId: string; userName: string } | null>(null);
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");

  const { data: profiles, isLoading } = useAllProfiles(statusFilter || undefined);
  const updateStatus = useUpdateProfileStatus();
  const adjustPoints = useAdjustPoints();

  const filteredProfiles = profiles?.filter((p) => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.ieee_member_id.includes(search)) {
      return false;
    }
    return true;
  }) ?? [];

  const pendingCount = profiles?.filter((p) => p.status === "pending").length ?? 0;
  const activeCount = profiles?.filter((p) => p.status === "active").length ?? 0;

  const handleApprove = async (userId: string) => {
    try {
      await updateStatus.mutateAsync({ userId, status: "active" });
      toast.success("Ambassador approved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await updateStatus.mutateAsync({ userId, status: "suspended" });
      toast.success("Ambassador suspended");
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend");
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await updateStatus.mutateAsync({ userId, status: "active" });
      toast.success("Ambassador reactivated");
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate");
    }
  };

  const handleAdjustPoints = async () => {
    if (!pointsModal || !pointAmount || !pointReason.trim()) return;
    try {
      await adjustPoints.mutateAsync({
        userId: pointsModal.userId,
        amount: parseInt(pointAmount, 10),
        reason: pointReason.trim(),
      });
      toast.success("Points adjusted!");
      setPointsModal(null);
      setPointAmount("");
      setPointReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust points");
    }
  };

  return (
    <AdminShell title="Ambassadors">
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50 shadow-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Total</p>
            <span className="text-headline-md text-on-surface font-bold">
              {profiles?.length ?? 0}
            </span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50 shadow-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Active</p>
            <span className="text-headline-md text-secondary font-bold">{activeCount}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50 shadow-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Pending Approval</p>
            <span className="text-headline-md text-error font-bold">{pendingCount}</span>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              aria-label="Search ambassadors"
              className="w-full h-12 pl-11 pr-3 rounded-xl bg-surface-container-highest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-shadow"
              placeholder="Search by name or IEEE ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-12 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 font-label-md text-label-md text-on-surface outline-none focus:ring-2 ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Ambassador list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="group" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">No ambassadors found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
            {filteredProfiles.map((p) => {
              const initials = (p.full_name || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 sm:gap-4 px-4 py-3 border-b border-outline-variant/40 last:border-b-0 hover:bg-surface-container-low/50 transition-colors"
                >
                  {/* Avatar */}
                  {p.avatar_url ? (
                    <img
                      alt={p.full_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      src={p.avatar_url}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold shrink-0">
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body-md text-on-surface font-semibold truncate">
                        {p.full_name || "Unnamed"}
                      </span>
                      <span
                        className={cn(
                          "font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                          STATUS_STYLES[p.status],
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-on-surface-variant">
                      <span className="font-label-sm text-label-sm">
                        {DEPT_LABELS[p.department] || p.department}
                      </span>
                      <span className="font-label-sm text-label-sm">
                        ID: {p.ieee_member_id || "—"}
                      </span>
                      <span className="font-label-sm text-label-sm">
                        Joined {format(new Date(p.created_at), "MMM yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <span className="text-headline-md text-primary font-bold flex items-center gap-1">
                      <Icon name="stars" className="text-[16px]" />
                      {p.points.toLocaleString()}
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">points</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {p.status === "pending" && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={updateStatus.isPending}
                        className="px-3 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {p.status === "active" && (
                      <>
                        <button
                          onClick={() => setPointsModal({ userId: p.id, userName: p.full_name })}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Adjust Points"
                        >
                          <Icon name="toll" className="text-[20px]" />
                        </button>
                        <button
                          onClick={() => handleSuspend(p.id)}
                          disabled={updateStatus.isPending}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Suspend"
                        >
                          <Icon name="block" className="text-[20px]" />
                        </button>
                      </>
                    )}
                    {p.status === "suspended" && (
                      <button
                        onClick={() => handleReactivate(p.id)}
                        disabled={updateStatus.isPending}
                        className="px-3 py-1.5 bg-secondary text-on-secondary font-label-sm text-label-sm rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Points adjustment modal */}
      {pointsModal && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-headline-md text-on-surface mb-1">Adjust Points</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Manually adjust points for <span className="font-semibold text-on-surface">{pointsModal.userName}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Amount (use negative to deduct)
                </label>
                <input
                  type="number"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 50 or -25"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Reason</label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Why are you adjusting points?"
                  value={pointReason}
                  onChange={(e) => setPointReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setPointsModal(null);
                  setPointAmount("");
                  setPointReason("");
                }}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustPoints}
                disabled={!pointAmount || !pointReason.trim() || adjustPoints.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {adjustPoints.isPending ? "Saving..." : "Apply Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
