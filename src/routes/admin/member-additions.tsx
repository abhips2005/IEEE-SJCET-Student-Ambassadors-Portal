import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Icon } from "@/components/Icon";
import { useAllMemberAdditions, useApproveMemberAddition, useRejectMemberAddition } from "@/hooks/use-extras";
import { toast } from "sonner";
import { format } from "date-fns";
import type { MemberAddition } from "@/lib/database.types";

export const Route = createFileRoute("/admin/member-additions")({
  component: AdminMemberAdditionsPage,
  head: () => ({
    meta: [{ title: "Member Additions | Admin | IEEE Ambassador Portal" }],
  }),
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-secondary/10 text-secondary",
  rejected: "bg-error/10 text-error",
};

function AdminMemberAdditionsPage() {
  const { data: submissions, isLoading } = useAllMemberAdditions();
  const approveSubmission = useApproveMemberAddition();
  const rejectSubmission = useRejectMemberAddition();
  const [selected, setSelected] = useState<MemberAddition | null>(null);
  const [points, setPoints] = useState("50");
  const [remarks, setRemarks] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "approved" | "rejected">("");

  const filtered = submissions?.filter((s) => !statusFilter || s.status === statusFilter) ?? [];
  const pendingCount = submissions?.filter((s) => s.status === "pending").length ?? 0;

  const handleApprove = async () => {
    if (!selected) return;
    try {
      await approveSubmission.mutateAsync({
        id: selected.id,
        pointsToAward: parseInt(points, 10) || 50,
        adminRemarks: remarks,
        submittedBy: selected.submitted_by,
      });
      toast.success("Member addition approved! Points awarded.");
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    try {
      await rejectSubmission.mutateAsync({ id: selected.id, adminRemarks: remarks });
      toast.success("Submission rejected.");
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
  };

  return (
    <AdminShell title="Member Additions">
      <div className="flex flex-col gap-4">
        {/* Stats + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-3 flex-wrap">
            <div className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 font-label-md text-label-md">
              {pendingCount} Pending
            </div>
            <div className="bg-surface-container text-on-surface-variant rounded-lg px-3 py-1.5 font-label-md text-label-md">
              {submissions?.filter((s) => s.status === "approved").length ?? 0} Approved
            </div>
          </div>
          <select
            className="bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="group_add" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">No submissions found.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden shadow-sm">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelected(s); setPoints(String(s.points_to_award)); setRemarks(s.admin_remarks || ""); }}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/40 last:border-0 hover:bg-surface-container/50 transition-colors text-left"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{s.member_name}</span>
                    <span className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                  <span className="text-body-sm text-on-surface-variant font-mono">{s.ieee_id}</span>
                  <span className="text-[11px] text-on-surface-variant/50 mt-0.5">
                    By: {(s as any).submitter?.full_name || "?"} · {(s as any).submitter?.ambassador_id} · {format(new Date(s.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                {s.status === "pending" && <Icon name="chevron_right" className="text-outline shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-start sm:items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md text-on-surface">Review Submission</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-surface-container rounded-lg">
                <Icon name="close" />
              </button>
            </div>
            <div className="bg-surface-container rounded-lg p-3 mb-4 space-y-1">
              <p className="font-label-md text-label-md text-on-surface font-semibold">{selected.member_name}</p>
              <p className="text-body-sm text-on-surface-variant font-mono">IEEE ID: {selected.ieee_id}</p>
              <p className="text-[11px] text-on-surface-variant/60">
                Submitted by: {(selected as any).submitter?.full_name} ({(selected as any).submitter?.ambassador_id})
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Points to Award</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Remarks (Optional)</label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              {selected.status === "pending" && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={approveSubmission.isPending || rejectSubmission.isPending}
                    className="px-4 py-2 bg-error/10 text-error font-label-md text-label-md rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approveSubmission.isPending || rejectSubmission.isPending}
                    className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {approveSubmission.isPending ? "Approving..." : `Approve & Award ${points} pts`}
                  </button>
                </>
              )}
              {selected.status !== "pending" && (
                <button onClick={() => setSelected(null)} className="px-4 py-2 bg-surface-container text-on-surface font-label-md text-label-md rounded-lg">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
