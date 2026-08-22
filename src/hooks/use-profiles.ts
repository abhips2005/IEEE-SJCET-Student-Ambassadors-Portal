import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";
import { useAuth } from "@/lib/auth-context";

/** Fetch current user's profile */
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
}

/** Update current user's profile */
export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "department" | "semester" | "ieee_member_id" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase
        .from("profiles") as any)
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
    },
  });
}

/** Upload current user's avatar */
export function useUploadAvatar() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
      
      return data.publicUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/** Leaderboard: all active profiles ordered by points */
const LEADERBOARD_SELECT = "id, full_name, department, semester, ambassador_id, avatar_url, points";

/** Class Ambassador leaderboard */
export function useClassLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "class"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(LEADERBOARD_SELECT)
        .eq("status", "active")
        .in("role", ["ambassador", "reviewer"]) // class-side roles
        .order("points", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Pick<Profile, "id" | "full_name" | "department" | "semester" | "ambassador_id" | "avatar_url" | "points">[];
    },
  });
}

/** Dept Ambassador leaderboard */
export function useDeptLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "dept"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(LEADERBOARD_SELECT)
        .eq("status", "active")
        .eq("role", "dept_ambassador")
        .order("points", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Pick<Profile, "id" | "full_name" | "department" | "semester" | "ambassador_id" | "avatar_url" | "points">[];
    },
  });
}

/** Public (no-auth) top 5 class + top 1 dept for homepage */
export function usePublicLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "public"],
    queryFn: async () => {
      const [classRes, deptRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(LEADERBOARD_SELECT)
          .eq("status", "active")
          .in("role", ["ambassador", "reviewer"])
          .order("points", { ascending: false })
          .limit(5),
        supabase
          .from("profiles")
          .select(LEADERBOARD_SELECT)
          .eq("status", "active")
          .eq("role", "dept_ambassador")
          .order("points", { ascending: false })
          .limit(1),
      ]);
      return {
        class: (classRes.data ?? []) as unknown as Pick<Profile, "id" | "full_name" | "department" | "semester" | "ambassador_id" | "avatar_url" | "points">[],
        dept: (deptRes.data ?? []) as unknown as Pick<Profile, "id" | "full_name" | "department" | "semester" | "ambassador_id" | "avatar_url" | "points">[],
      };
    },
  });
}

/** @deprecated use useClassLeaderboard or useDeptLeaderboard */
export function useLeaderboard() { return useClassLeaderboard(); }

/** Admin: fetch all profiles */
export function useAllProfiles(statusFilter?: string) {
  return useQuery({
    queryKey: ["profiles", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Profile[];
    },
  });
}

/** Admin: update a user's profile status (approve/suspend) */
export function useUpdateProfileStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "active" | "suspended" }) => {
      const { error } = await (supabase
        .from("profiles") as any)
        .update({ status })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

/** Admin: manual point adjustment */
export function useAdjustPoints() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      reason,
    }: {
      userId: string;
      amount: number;
      reason: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("point_adjustments") as any).insert({
        user_id: userId,
        amount,
        reason,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

/** Get user stats (completed tasks count, events hosted) */
export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: async () => {
      if (!userId) return { completedTasks: 0, eventsHosted: 0 };
      const { data: assignments, error } = await supabase
        .from("task_assignments")
        .select("id, task:tasks(category)")
        .eq("user_id", userId)
        .eq("status", "approved");
      if (error) throw error;
      const completedTasks = assignments?.length ?? 0;
      const eventsHosted = assignments?.filter(
        (a: any) => a.task?.category === "event_organization",
      ).length ?? 0;
      return { completedTasks, eventsHosted };
    },
    enabled: !!userId,
  });
}

/** Admin: update a user's role */
export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role, assignedDepartments }: { userId: string; role: string; assignedDepartments?: string[] }) => {
      const updates: any = { role };
      if (assignedDepartments !== undefined) updates.assigned_departments = assignedDepartments;
      const { error } = await (supabase.from("profiles") as any).update(updates).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

/** Update current user's full profile (all editable fields) */
export function useUpdateProfileFull() {
  const qc = useQueryClient();
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "full_name" | "department" | "semester" | "section" | "ieee_member_id" | "mobile_number" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("profiles") as any).update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
    },
  });
}

/** Reviewer: fetch submissions from assigned departments */
export function useReviewerSubmissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reviewer-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*, task:tasks(*), user:profiles!task_assignments_user_id_fkey(*)")
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
}

/** Reviewer: submit review for a submission */
export function useSubmitReview() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      reviewerRemarks,
      reviewerPointsSuggested,
    }: {
      assignmentId: string;
      reviewerRemarks: string;
      reviewerPointsSuggested: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("task_assignments") as any)
        .update({
          status: "reviewer_approved",
          reviewer_id: user.id,
          reviewer_remarks: reviewerRemarks,
          reviewer_points_suggested: reviewerPointsSuggested,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviewer-submissions"] });
    },
  });
}

/** Reviewer: reject a submission (ambassador can re-submit) */
export function useReviewerReject() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      reviewerRemarks,
    }: {
      assignmentId: string;
      reviewerRemarks: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("task_assignments") as any)
        .update({
          status: "rejected",
          reviewer_id: user.id,
          reviewer_remarks: reviewerRemarks,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviewer-submissions"] });
    },
  });
}
