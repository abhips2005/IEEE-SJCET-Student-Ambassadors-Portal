import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Icon } from "@/components/Icon";
import { useAllQueries, useReplyQuery } from "@/hooks/use-extras";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Query } from "@/lib/database.types";

export const Route = createFileRoute("/admin/queries")({
  component: AdminQueriesPage,
  head: () => ({
    meta: [{ title: "Queries | Admin | IEEE Ambassador Portal" }],
  }),
});

function AdminQueriesPage() {
  const { data: queries, isLoading } = useAllQueries();
  const replyQuery = useReplyQuery();
  const [selected, setSelected] = useState<Query | null>(null);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "open" | "closed">("");

  const filtered = queries?.filter((q) => !statusFilter || q.status === statusFilter) ?? [];
  const openCount = queries?.filter((q) => q.status === "open").length ?? 0;

  const handleReply = async (close: boolean) => {
    if (!selected) return;
    try {
      await replyQuery.mutateAsync({ id: selected.id, reply, close });
      toast.success(close ? "Query closed with reply." : "Reply sent.");
      setSelected(null);
      setReply("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reply");
    }
  };

  return (
    <AdminShell title="Ambassador Queries">
      <div className="flex flex-col gap-4">
        {/* Stats + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-3">
            <div className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 font-label-md text-label-md">
              {openCount} Open
            </div>
            <div className="bg-surface-container text-on-surface-variant rounded-lg px-3 py-1.5 font-label-md text-label-md">
              {(queries?.length ?? 0) - openCount} Closed
            </div>
          </div>
          <select
            className="bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="">All Queries</option>
            <option value="open">Open Only</option>
            <option value="closed">Closed Only</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Icon name="inbox" className="text-[48px] opacity-30 mb-3" />
            <p className="text-body-md">No queries found.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden shadow-sm">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => { setSelected(q); setReply(q.admin_reply || ""); }}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/40 last:border-0 hover:bg-surface-container/50 transition-colors text-left"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{q.subject}</span>
                    <span className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded-full uppercase shrink-0 ${q.status === "open" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                      {q.status}
                    </span>
                  </div>
                  <span className="text-body-sm text-on-surface-variant truncate">{q.message}</span>
                  <span className="text-[11px] text-on-surface-variant/50 mt-0.5">
                    {(q as any).profile?.full_name || "Unknown"} · {format(new Date(q.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <Icon name="chevron_right" className="text-outline shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-start sm:items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-surface rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md text-on-surface">Reply to Query</h3>
              <button onClick={() => { setSelected(null); setReply(""); }} className="p-2 hover:bg-surface-container rounded-lg">
                <Icon name="close" />
              </button>
            </div>
            <div className="bg-surface-container rounded-lg p-3 mb-4">
              <p className="font-label-md text-label-md text-on-surface font-semibold mb-1">{selected.subject}</p>
              <p className="text-body-sm text-on-surface-variant">{selected.message}</p>
              <p className="text-[11px] text-on-surface-variant/60 mt-2">
                From: {(selected as any).profile?.full_name || "Unknown"} · {(selected as any).profile?.ambassador_id}
              </p>
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Your Reply</label>
              <textarea
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={() => handleReply(false)}
                disabled={!reply.trim() || replyQuery.isPending}
                className="px-4 py-2 bg-surface-container text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Send (Keep Open)
              </button>
              <button
                onClick={() => handleReply(true)}
                disabled={!reply.trim() || replyQuery.isPending}
                className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:shadow-md transition-all disabled:opacity-50"
              >
                {replyQuery.isPending ? "Sending..." : "Send & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
