import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { GalleryImage, Query, MemberAddition } from "@/lib/database.types";
import { useAuth } from "@/lib/auth-context";

// ─── GALLERY ────────────────────────────────────────────────────────────────

export function useGallery(includeInactive = false) {
  return useQuery({
    queryKey: ["gallery", includeInactive],
    queryFn: async () => {
      let q = supabase.from("gallery").select("*").order("created_at", { ascending: false });
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as GalleryImage[];
    },
  });
}

export function useUploadGalleryImage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ file, title, caption }: { file: File; title?: string; caption?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fileName);
      const { error: insertError } = await (supabase.from("gallery") as any).insert({
        image_url: urlData.publicUrl,
        title: title || null,
        caption: caption || null,
        created_by: user.id,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useToggleGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase.from("gallery") as any).update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("gallery") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

// ─── QUERIES ─────────────────────────────────────────────────────────────────

export function useMyQueries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["queries", "my", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Query[];
    },
    enabled: !!user,
  });
}

export function useSubmitQuery() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("queries") as any).insert({
        user_id: user.id,
        subject,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queries"] }),
  });
}

export function useAllQueries() {
  return useQuery({
    queryKey: ["queries", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("queries")
        .select("*, profile:profiles!queries_user_id_fkey(full_name, department, ambassador_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Query[];
    },
  });
}

export function useReplyQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reply, close }: { id: string; reply: string; close: boolean }) => {
      const { error } = await (supabase.from("queries") as any)
        .update({ admin_reply: reply, status: close ? "closed" : "open" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queries"] }),
  });
}

// ─── MEMBER ADDITIONS ────────────────────────────────────────────────────────

export function useMyMemberAdditions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["member-additions", "my", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_additions")
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MemberAddition[];
    },
    enabled: !!user,
  });
}

export function useSubmitMemberAddition() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ memberName, ieeeId }: { memberName: string; ieeeId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from("member_additions") as any).insert({
        submitted_by: user.id,
        member_name: memberName,
        ieee_id: ieeeId,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-additions"] }),
  });
}

export function useAllMemberAdditions() {
  return useQuery({
    queryKey: ["member-additions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_additions")
        .select("*, submitter:profiles!member_additions_submitted_by_fkey(full_name, department, ambassador_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MemberAddition[];
    },
  });
}

export function useApproveMemberAddition() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      pointsToAward,
      adminRemarks,
      submittedBy,
    }: {
      id: string;
      pointsToAward: number;
      adminRemarks?: string;
      submittedBy: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error: updateErr } = await (supabase.from("member_additions") as any)
        .update({ status: "approved", points_to_award: pointsToAward, admin_remarks: adminRemarks || null })
        .eq("id", id);
      if (updateErr) throw updateErr;
      // Award points via point_adjustments
      const { error: ptErr } = await (supabase.from("point_adjustments") as any).insert({
        user_id: submittedBy,
        amount: pointsToAward,
        reason: `Member addition approved (ID: ${id})`,
        created_by: user.id,
      });
      if (ptErr) throw ptErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-additions"] }),
  });
}

export function useRejectMemberAddition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adminRemarks }: { id: string; adminRemarks?: string }) => {
      const { error } = await (supabase.from("member_additions") as any)
        .update({ status: "rejected", admin_remarks: adminRemarks || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member-additions"] }),
  });
}
