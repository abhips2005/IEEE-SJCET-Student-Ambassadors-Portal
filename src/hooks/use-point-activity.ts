import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export type ActivityItem = {
  id: string;
  date: string;
  source: "Task" | "Member Addition" | "Manual Adjustment";
  title: string;
  status: "pending" | "approved" | "rejected";
  points: number;
  remarks: string | null;
};

export function useMyPointActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["point-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // 1. Fetch Task Assignments
      const { data: assignments, error: err1 } = await supabase
        .from("task_assignments")
        .select("*, task:tasks(*)")
        .eq("user_id", user.id)
        .in("status", ["submitted", "reviewer_approved", "approved", "rejected"]);
      if (err1) throw err1;

      // 2. Fetch Manual Adjustments
      const { data: adjustments, error: err2 } = await supabase
        .from("point_adjustments")
        .select("*")
        .eq("user_id", user.id);
      if (err2) throw err2;

      // 3. Fetch Member Additions
      const { data: memberAdditions, error: err3 } = await supabase
        .from("member_additions")
        .select("*")
        .eq("submitted_by", user.id);
      if (err3) throw err3;

      const activities: ActivityItem[] = [];

      // Map Task Assignments
      for (const rawA of assignments || []) {
        const a = rawA as any;
        const t = a.task;
        const statusMap: any = {
          submitted: "pending",
          reviewer_approved: "pending",
          approved: "approved",
          rejected: "rejected",
        };
        const status = statusMap[a.status] || "pending";
        // If approved, show awarded points, else show original reward as pending
        const points = status === "approved" ? (a.admin_points_awarded ?? t.points_reward) : t.points_reward;
        
        // Combine remarks
        let remarks = "";
        if (a.reviewer_remarks) remarks += `Reviewer: ${a.reviewer_remarks}\n`;
        if (a.admin_remarks) remarks += `Admin: ${a.admin_remarks}`;

        activities.push({
          id: a.id,
          date: a.submitted_at || a.claimed_at,
          source: "Task",
          title: t?.title || "Unknown Task",
          status,
          points,
          remarks: remarks.trim() || null,
        });
      }

      // Map Manual Adjustments
      for (const rawAdj of adjustments || []) {
        const adj = rawAdj as any;
        // Skip point adjustments that were created by the member addition approval logic,
        // because we already map the member addition itself below.
        if (typeof adj.reason === "string" && adj.reason.startsWith("Member addition approved")) {
          continue;
        }

        activities.push({
          id: adj.id,
          date: adj.created_at,
          source: "Manual Adjustment",
          title: adj.reason || "Point Adjustment",
          status: "approved", // manual adjustments are instantly approved
          points: adj.amount,
          remarks: null,
        });
      }

      // Map Member Additions
      for (const rawM of memberAdditions || []) {
        const m = rawM as any;
        activities.push({
          id: m.id,
          date: m.created_at,
          source: "Member Addition",
          title: `Added IEEE Member: ${m.member_name}`,
          status: m.status as "pending" | "approved" | "rejected",
          points: m.points_to_award,
          remarks: m.admin_remarks || null,
        });
      }

      // Sort by date descending
      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!user,
  });
}
