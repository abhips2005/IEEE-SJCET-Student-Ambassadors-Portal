import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task, TaskAssignment } from "@/lib/database.types";
import { useAuth } from "@/lib/auth-context";

/** Fetch all tasks, optionally filtering by status and category */
export function useTasks(filters?: { status?: string; category?: string; target_department?: string | null; target_semester?: number | null }) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.category) q = q.eq("category", filters.category);
      if (filters?.target_department) q = q.eq("target_department", filters.target_department);
      if (filters?.target_department === null) q = q.is("target_department", null);
      if (filters?.target_semester) q = q.eq("target_semester", filters.target_semester);
      if (filters?.target_semester === null) q = q.is("target_semester", null);
      const { data, error } = await q;
      if (error) throw error;
      return data as Task[];
    },
  });
}

/** Fetch a single task */
export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!taskId,
  });
}

/** Fetch current user's task assignments with joined task data */
export function useMyAssignments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-assignments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*, task:tasks(*)")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false });
      if (error) throw error;
      return data as (TaskAssignment & { task: Task })[];
    },
    enabled: !!user,
  });
}

/** Fetch all assignments for a specific task (admin) */
export function useTaskAssignments(taskId?: string) {
  return useQuery({
    queryKey: ["task-assignments", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*, user:profiles!task_assignments_user_id_fkey(id, full_name, avatar_url, department)")
        .eq("task_id", taskId)
        .order("claimed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

/** Fetch all assignments (admin — for reviews) */
export function useAllAssignments(statusFilter?: string) {
  return useQuery({
    queryKey: ["all-assignments", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("task_assignments")
        .select("*, task:tasks(*), user:profiles!task_assignments_user_id_fkey(id, full_name, avatar_url, department), reviewer:profiles!task_assignments_reviewer_id_fkey(full_name, ambassador_id)")
        .order("claimed_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

/** Claim a task */
export function useClaimTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("task_assignments") as any).insert({
        task_id: taskId,
        user_id: user.id,
        status: "claimed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}

/** Submit proof for a claimed task */
export function useSubmitProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, proofText }: { assignmentId: string; proofText: string }) => {
      const { error } = await (supabase
        .from("task_assignments") as any)
        .update({ status: "submitted", proof_text: proofText, submitted_at: new Date().toISOString() })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
      qc.invalidateQueries({ queryKey: ["all-assignments"] });
    },
  });
}

/** Re-submit proof for a rejected task (reset to submitted, clear reviewer fields) */
export function useResubmitProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, proofText }: { assignmentId: string; proofText: string }) => {
      const { error } = await (supabase
        .from("task_assignments") as any)
        .update({
          status: "submitted",
          proof_text: proofText,
          submitted_at: new Date().toISOString(),
          reviewer_id: null,
          reviewer_remarks: null,
          reviewer_points_suggested: null,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
      qc.invalidateQueries({ queryKey: ["all-assignments"] });
      qc.invalidateQueries({ queryKey: ["reviewer-submissions"] });
    },
  });
}

/** Create a task (admin) */
export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (
      task: Omit<Task, "id" | "created_at" | "updated_at" | "created_by">,
    ) => {
      const { error } = await (supabase.from("tasks") as any).insert({
        ...task,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/** Update a task (admin) */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { error } = await (supabase.from("tasks") as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/** Delete a task (admin) */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

/** Review an assignment — approve or reject (admin) */
export function useReviewAssignment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      decision,
    }: {
      assignmentId: string;
      decision: "approved" | "rejected";
    }) => {
      const { error } = await (supabase
        .from("task_assignments") as any)
        .update({
          status: decision,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-assignments"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
