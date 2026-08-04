import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/lib/database.types";
import { useAuth } from "@/lib/auth-context";

/** Fetch active announcements */
export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

/** Create announcement (admin) */
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      const { error } = await supabase.from("announcements").insert({
        title,
        body,
        created_by: user?.id ?? null,
        active: true,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

/** Toggle announcement active status (admin) */
export function useToggleAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase
        .from("announcements") as any)
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
