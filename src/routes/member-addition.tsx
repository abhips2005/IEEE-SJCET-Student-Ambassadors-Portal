import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Icon } from "@/components/Icon";
import { useMyMemberAdditions, useSubmitMemberAddition } from "@/hooks/use-extras";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/member-addition")({
  component: MemberAdditionPage,
  head: () => ({
    meta: [{ title: "Add Member | IEEE Ambassador Portal" }],
  }),
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-secondary/10 text-secondary",
  rejected: "bg-error/10 text-error",
};

function MemberAdditionPage() {
  const { data: submissions, isLoading } = useMyMemberAdditions();
  const submitMember = useSubmitMemberAddition();
  const [memberName, setMemberName] = useState("");
  const [ieeeId, setIeeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !ieeeId.trim()) return;
    setSubmitting(true);
    try {
      await submitMember.mutateAsync({ memberName: memberName.trim(), ieeeId: ieeeId.trim() });
      toast.success("Member addition submitted for admin review!");
      setMemberName("");
      setIeeeId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <PortalShell eyebrow="Ambassador Portal">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">Add New Member</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Submit a new IEEE member you've recruited. Admin will review and award points upon approval.
          </p>
        </header>

        {/* Submit form */}
        <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/50 shadow-sm max-w-2xl">
          <h2 className="text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <Icon name="person_add" className="text-primary" />
            New Member Details
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Member Full Name</label>
              <input
                className={inputClass}
                placeholder="Jane Doe"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">IEEE Membership ID</label>
              <input
                className={`${inputClass} font-mono tracking-wider`}
                placeholder="12345678"
                required
                value={ieeeId}
                onChange={(e) => setIeeeId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !memberName.trim() || !ieeeId.trim()}
              className="px-6 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
              Submit for Review
            </button>
          </form>
        </div>

        {/* Past submissions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-headline-md text-on-surface">My Submissions</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => <div key={i} className="h-20 bg-surface-container rounded-xl" />)}
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <Icon name="group_add" className="text-[40px] opacity-30 mb-2" />
              <p className="text-body-md">No submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/40 last:border-0">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-body-md text-on-surface font-semibold">{s.member_name}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                      {s.ieee_id} · {format(new Date(s.created_at), "MMM d, yyyy")}
                    </span>
                    {s.admin_remarks && (
                      <span className="text-label-sm text-on-surface-variant/70 mt-0.5">Admin: {s.admin_remarks}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${STATUS_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                    {s.status === "approved" && (
                      <span className="font-label-sm text-label-sm text-secondary font-bold">
                        +{s.points_to_award} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
