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
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, department, avatar_url, points")
        .eq("status", "active")
        .order("points", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Pick<Profile, "id" | "full_name" | "department" | "avatar_url" | "points">[];
    },
  });
}

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
