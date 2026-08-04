import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Icon } from "@/components/Icon";
import { useMyQueries, useSubmitQuery } from "@/hooks/use-extras";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/queries")({
  component: QueriesPage,
  head: () => ({
    meta: [{ title: "My Queries | IEEE Ambassador Portal" }],
  }),
});

function QueriesPage() {
  const { data: queries, isLoading } = useMyQueries();
  const submitQuery = useSubmitQuery();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await submitQuery.mutateAsync({ subject: subject.trim(), message: message.trim() });
      toast.success("Query submitted! Admin will get back to you.");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit query");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <PortalShell eyebrow="Volunteer Portal">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-lg-mobile lg:text-headline-lg text-on-surface">My Queries</h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Have a question or concern? Send it here and an admin will respond.
          </p>
        </header>

        {/* Submit form */}
        <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/50 shadow-sm max-w-2xl">
          <h2 className="text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <Icon name="help" className="text-primary" />
            New Query
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Subject</label>
              <input
                className={inputClass}
                placeholder="What is your question about?"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Message</label>
              <textarea
                className={`${inputClass} min-h-[120px] resize-none`}
                placeholder="Describe your query in detail..."
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !message.trim()}
              className="px-6 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
              Send Query
            </button>
          </form>
        </div>

        {/* Past queries */}
        <div className="flex flex-col gap-3">
          <h2 className="text-headline-md text-on-surface">Past Queries</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => <div key={i} className="h-24 bg-surface-container rounded-xl" />)}
            </div>
          ) : !queries || queries.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <Icon name="inbox" className="text-[40px] opacity-30 mb-2" />
              <p className="text-body-md">No queries yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queries.map((q) => (
                <div key={q.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{q.subject}</span>
                    <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${q.status === "closed" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-2 whitespace-pre-line">{q.message}</p>
                  {q.admin_reply && (
                    <div className="mt-3 bg-secondary-container/30 rounded-lg p-3 border-l-2 border-secondary">
                      <p className="font-label-sm text-label-sm text-secondary mb-1">Admin Reply</p>
                      <p className="text-body-sm text-on-surface whitespace-pre-line">{q.admin_reply}</p>
                    </div>
                  )}
                  <p className="text-label-sm text-on-surface-variant/60 mt-2 text-[11px]">
                    {format(new Date(q.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
