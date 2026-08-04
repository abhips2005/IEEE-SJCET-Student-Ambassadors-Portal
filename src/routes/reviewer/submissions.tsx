import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ReviewerShell } from "@/components/ReviewerShell";
import { ReviewerGuard } from "@/components/AuthGuard";
import { Icon } from "@/components/Icon";
import { useReviewerSubmissions, useSubmitReview } from "@/hooks/use-profiles";
import { DEPT_MAP } from "@/lib/constants";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviewer/submissions")({
  component: ReviewerSubmissionsPage,
  head: () => ({
    meta: [{ title: "Submissions | Reviewer | IEEE Ambassador Portal" }],
  }),
});

function ReviewerSubmissionsPage() {
  return (
    <ReviewerGuard>
      <ReviewerSubmissionsInner />
    </ReviewerGuard>
  );
}

function ReviewerSubmissionsInner() {
  const { data: submissions, isLoading } = useReviewerSubmissions();
  const submitReview = useSubmitReview();
  const [selected, setSelected] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [suggestedPoints, setSuggestedPoints] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!selected || !remarks.trim()) return;
    setSubmitting(true);
    try {
      await submitReview.mutateAsync({
        assignmentId: selected.id,
        reviewerRemarks: remarks,
        reviewerPointsSuggested: parseInt(suggestedPoints, 10) || selected.task?.points_reward || 0,
      });
      toast.success("Review submitted to admin for final approval.");
      setSelected(null);
      setRemarks("");
      setSuggestedPoints("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReviewerShell title="Task Submissions">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">Task Submissions</h1>
          <p className="text-body-md text-on-surface-variant">
            Review submissions from ambassadors in your assigned department(s).
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-container rounded-xl" />)}
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <Icon name="task_alt" className="text-[64px] opacity-20 mb-4" />
            <p className="text-headline-md">No pending submissions</p>
            <p className="text-body-md mt-2 opacity-70">All submissions in your department are reviewed.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden shadow-sm">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelected(s);
                  setSuggestedPoints(String(s.task?.points_reward || 0));
                  setRemarks("");
                }}
                className="w-full flex items-start sm:items-center gap-3 px-4 py-4 border-b border-outline-variant/40 last:border-0 hover:bg-surface-container/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold shrink-0">
                  {(s.user?.full_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{s.user?.full_name}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      {DEPT_MAP[s.user?.department] || s.user?.department}
                    </span>
                  </div>
                  <span className="text-body-sm text-on-surface font-medium">{s.task?.title}</span>
                  <span className="text-body-sm text-on-surface-variant truncate mt-0.5">{s.proof_text}</span>
                  <span className="text-[11px] text-on-surface-variant/50 mt-1">
                    Submitted: {s.submitted_at ? format(new Date(s.submitted_at), "MMM d, yyyy") : "—"}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-headline-md text-primary font-bold">{s.task?.points_reward}</span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">max pts</span>
                </div>
                <Icon name="chevron_right" className="text-outline shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-start sm:items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md text-on-surface">Review Submission</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-surface-container rounded-lg">
                <Icon name="close" />
              </button>
            </div>

            <div className="bg-surface-container rounded-lg p-3 mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="person" className="text-on-surface-variant text-[18px]" />
                <span className="text-body-md text-on-surface font-semibold">{selected.user?.full_name}</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">{selected.user?.ambassador_id}</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">{selected.task?.title}</p>
                <p className="text-body-sm text-on-surface-variant">{selected.task?.description}</p>
              </div>
              <div className="border-t border-outline-variant/50 pt-2">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Proof Submitted</p>
                <p className="text-body-sm text-on-surface whitespace-pre-line">{selected.proof_text || "—"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Points to Award</label>
                <input
                  type="number"
                  min="0"
                  max={selected.task?.points_reward * 2 || 500}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={suggestedPoints}
                  onChange={(e) => setSuggestedPoints(e.target.value)}
                />
                <p className="text-[11px] text-on-surface-variant mt-1">Max: {selected.task?.points_reward} pts (admin may override)</p>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Reviewer Remarks <span className="text-error">*</span></label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your assessment of this submission..."
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-label-md text-label-md transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !remarks.trim()}
                className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
                Submit to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </ReviewerShell>
  );
}
