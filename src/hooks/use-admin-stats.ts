import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Aggregated platform health stats for admin overview */
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [volunteers, tasks, pointsResult, pendingReviews] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("tasks").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("profiles").select("points").eq("status", "active"),
        supabase
          .from("task_assignments")
          .select("id", { count: "exact", head: true })
          .eq("status", "submitted"),
      ]);

      const totalPoints =
        pointsResult.data?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) ?? 0;

      return {
        totalVolunteers: volunteers.count ?? 0,
        activeTasks: tasks.count ?? 0,
        totalPointsAwarded: totalPoints,
        pendingReviews: pendingReviews.count ?? 0,
      };
    },
  });
}

/** Department distribution for admin chart */
export function useDeptDistribution() {
  return useQuery({
    queryKey: ["dept-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("department")
        .eq("status", "active");
      if (error) throw error;

      const deptMap: Record<string, number> = {};
      data?.forEach((p: any) => {
        const dept = p.department || "other";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });

      const total = data?.length || 1;
      const LABELS: Record<string, string> = {
        cs: "Computer Science",
        ee: "Electrical Engineering",
        me: "Mechanical Eng.",
        other: "Other",
      };
      const COLORS: Record<string, string> = {
        cs: "bg-primary",
        ee: "bg-secondary",
        me: "bg-tertiary-container",
        other: "bg-surface-container-highest",
      };

      return Object.entries(deptMap)
        .map(([key, count]) => ({
          name: LABELS[key] || key,
          pct: Math.round((count / total) * 100),
          bar: COLORS[key] || "bg-surface-container-highest",
        }))
        .sort((a, b) => b.pct - a.pct);
    },
  });
}

/** Recent activity feed for admin */
export function useActivityFeed() {
  return useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      // Recent assignments (claimed, submitted, approved)
      const { data: assignments, error: aErr } = await supabase
        .from("task_assignments")
        .select("*, user:profiles!task_assignments_user_id_fkey(id, full_name, avatar_url), task:tasks(title)")
        .order("claimed_at", { ascending: false })
        .limit(10);
      if (aErr) throw aErr;

      // Recent new users
      const { data: newUsers, error: uErr } = await supabase
        .from("profiles")
        .select("id, full_name, department, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (uErr) throw uErr;

      type FeedItem = {
        type: "assignment" | "new_user";
        name: string;
        avatar?: string | null;
        text: string;
        highlight?: string;
        time: string;
        meta: string;
        metaClass: string;
      };

      const feed: FeedItem[] = [];

      assignments?.forEach((a: any) => {
        const statusText: Record<string, string> = {
          claimed: "claimed task",
          submitted: "submitted proof for",
          approved: "completed task",
          rejected: "was rejected for",
        };
        const metaText: Record<string, { text: string; cls: string }> = {
          claimed: { text: "Claimed", cls: "text-primary" },
          submitted: { text: "Needs Review", cls: "text-error" },
          approved: {
            text: `+${a.task?.points_reward ?? 0} pts`,
            cls: "text-secondary",
          },
          rejected: { text: "Rejected", cls: "text-on-surface-variant" },
        };
        feed.push({
          type: "assignment",
          name: a.user?.full_name || "Unknown",
          avatar: a.user?.avatar_url,
          text: statusText[a.status] || a.status,
          highlight: a.task?.title,
          time: timeAgo(a.claimed_at),
          meta: metaText[a.status]?.text || a.status,
          metaClass: metaText[a.status]?.cls || "",
        });
      });

      newUsers?.forEach((u: any) => {
        feed.push({
          type: "new_user",
          name: u.full_name || "Unknown",
          avatar: u.avatar_url,
          text: "joined as a new ambassador",
          time: timeAgo(u.created_at),
          meta: deptLabel(u.department),
          metaClass: "text-on-surface-variant",
        });
      });

      // Sort by recency (rough)
      return feed.slice(0, 10);
    },
  });
}

/** Pending ambassador count */
export function usePendingCount() {
  return useQuery({
    queryKey: ["pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function deptLabel(dept: string): string {
  const map: Record<string, string> = {
    cs: "CS Dept",
    ee: "EE Dept",
    me: "ME Dept",
    other: "Other",
  };
  return map[dept] || dept;
}
