import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PortalShell } from "@/components/PortalShell";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile, useUserStats, useUploadAvatar } from "@/hooks/use-profiles";
import { toast } from "sonner";
import { DEPARTMENTS, DEPT_MAP, ROLE_MAP } from "@/lib/constants";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "My Profile | IEEE Student Ambassador Portal" },
      {
        name: "description",
        content:
          "Your ambassador profile: membership details, points earned, badges and completed tasks.",
      },
      { property: "og:title", content: "Ambassador Profile" },
      { property: "og:description", content: "Membership details, points and badges." },
    ],
  }),
});





const compressImage = async (file: File, maxSizeKb: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const maxBytes = maxSizeKb * 1024;
        
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Canvas to Blob failed"));
              if (blob.size <= maxBytes || quality <= 0.1) {
                // Done.
                resolve(
                  new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: "image/jpeg",
                  })
                );
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality
          );
        };
        tryCompress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: stats } = useUserStats(user?.id);
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editSem, setEditSem] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editMobile, setEditMobile] = useState("");
  
  const uploadAvatar = useUploadAvatar();
  
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      toast.info("Processing photo...");
      let finalFile = file;
      
      // Auto compress to 200KB
      if (file.size > 200 * 1024) {
        finalFile = await compressImage(file, 200);
      }
      
      if (finalFile.size > 204800) {
        toast.error("Could not compress photo to under 200KB. Try a smaller image.");
        return;
      }
      
      toast.info("Uploading photo...");
      await uploadAvatar.mutateAsync(finalFile);
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    }
  };

  const startEdit = () => {
    setEditName(profile?.full_name || "");
    setEditDept(profile?.department || "other");
    setEditSem(String(profile?.semester || 1));
    setEditSection(profile?.section || "");
    setEditMobile(profile?.mobile_number || "");
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: editName,
        department: editDept,
        semester: parseInt(editSem, 10),
        section: editSection || undefined,
        mobile_number: editMobile || undefined,
      } as any);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <PortalShell eyebrow="Ambassador Portal">
        <div className="animate-pulse space-y-6">
          <div className="bg-surface-container rounded-xl h-32" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-container rounded-xl h-24" />
            ))}
          </div>
        </div>
      </PortalShell>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const STATS = [
    { label: "Total Points", value: profile.points.toLocaleString(), icon: "stars" },
    { label: "Tasks Completed", value: String(stats?.completedTasks ?? 0), icon: "task_alt" },
    { label: "Events Hosted", value: String(stats?.eventsHosted ?? 0), icon: "campaign" },
    { label: "Member Since", value: new Date(profile.created_at).getFullYear().toString(), icon: "calendar_today" },
  ];

  const DETAILS = [
    { label: "Ambassador ID", value: profile.ambassador_id || "—", icon: "id_card" },
    { label: "IEEE Membership ID", value: profile.ieee_member_id || "—", icon: "badge" },
    { label: "Department", value: DEPT_MAP[profile.department] || profile.department, icon: "account_balance" },
    { label: "Semester", value: `${profile.semester}${profile.semester === 1 ? "st" : profile.semester === 2 ? "nd" : profile.semester === 3 ? "rd" : "th"} Semester`, icon: "date_range" },
    { label: "Section", value: profile.section || "—", icon: "class" },
    { label: "Mobile", value: profile.mobile_number || "—", icon: "phone" },
    { label: "Email", value: user?.email || "—", icon: "mail" },
    { label: "Role", value: ROLE_MAP[profile.role] || profile.role, icon: "shield_person" },
  ];

  return (
    <PortalShell eyebrow="Ambassador Portal">
      <div className="flex flex-col gap-6">
        {/* Profile header */}
        <div className="bg-primary text-on-primary rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-md">
          {profile.avatar_url ? (
            <img
              alt={profile.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full object-cover ring-4 ring-on-primary/30"
              src={profile.avatar_url}
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-on-primary/20 ring-4 ring-on-primary/30 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0 text-center sm:text-left flex-1">
            <h1 className="text-headline-lg break-words">{profile.full_name}</h1>
            <p className="text-body-md text-on-primary/80 capitalize">
              {ROLE_MAP[profile.role] || profile.role} · {DEPT_MAP[profile.department] || profile.department}
            </p>
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-on-primary/20 font-label-sm text-label-sm uppercase tracking-wider">
              <Icon name="verified" className="text-[16px]" />
              {profile.status === "active" ? "Active" : profile.status}
            </span>
          </div>
          <button
            onClick={startEdit}
            className="shrink-0 px-4 py-2 bg-on-primary/20 rounded-lg font-label-md text-label-md hover:bg-on-primary/30 transition-colors flex items-center gap-2"
          >
            <Icon name="edit" className="text-[18px]" />
            Edit
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant shadow-sm flex flex-col gap-1"
            >
              <Icon name={s.icon} className="text-primary" />
              <span className="text-headline-md text-on-surface font-bold">{s.value}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Membership details */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-headline-md text-on-surface">Membership Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DETAILS.map((d) => (
              <div key={d.label} className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name={d.icon} />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {d.label}
                  </span>
                  <span className="text-body-md text-on-surface truncate">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-headline-md text-on-surface mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 mb-6">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-2xl font-bold text-on-surface-variant">
                    {initials}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    disabled={uploadAvatar.isPending}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-4 py-2 bg-surface-container rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors cursor-pointer inline-block"
                  >
                    {uploadAvatar.isPending ? "Uploading..." : "Change Photo"}
                  </label>
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Full Name</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Department</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Semester</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editSem}
                  onChange={(e) => setEditSem(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}{n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Semester
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Section</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. A, B, C"
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+91 XXXXX XXXXX"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
