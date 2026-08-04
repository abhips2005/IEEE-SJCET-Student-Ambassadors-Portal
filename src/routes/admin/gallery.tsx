import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Icon } from "@/components/Icon";
import { useGallery, useUploadGalleryImage, useToggleGalleryImage, useDeleteGalleryImage } from "@/hooks/use-extras";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGalleryPage,
  head: () => ({
    meta: [{ title: "Gallery Management | Admin | IEEE Ambassador Portal" }],
  }),
});

function AdminGalleryPage() {
  const { data: images, isLoading } = useGallery(true); // include inactive
  const uploadImage = useUploadGalleryImage();
  const toggleImage = useToggleGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      await uploadImage.mutateAsync({ file, title: uploadTitle, caption: uploadCaption });
      toast.success("Image uploaded successfully!");
      setUploadTitle("");
      setUploadCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage.mutateAsync(id);
      toast.success("Image deleted");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const inputClass = "w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <AdminShell title="Gallery Management">
      <div className="flex flex-col gap-6">

        {/* Upload section */}
        <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-outline-variant/50 shadow-sm">
          <h2 className="text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <Icon name="add_photo_alternate" className="text-primary" />
            Upload Image
          </h2>
          <div className="space-y-3 max-w-lg">
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Title (Optional)</label>
              <input className={inputClass} placeholder="Event name or photo title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-1">Caption (Optional)</label>
              <input className={inputClass} placeholder="Short description..." value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {uploading ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : <Icon name="upload" className="text-[18px]" />}
              {uploading ? "Uploading..." : "Choose & Upload Image"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>
        </div>

        {/* Images grid */}
        <div>
          <h2 className="text-headline-md text-on-surface mb-4">All Images ({images?.length ?? 0})</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-surface-container rounded-xl" />
              ))}
            </div>
          ) : !images || images.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <Icon name="photo_library" className="text-[48px] opacity-30 mb-3" />
              <p className="text-body-md">No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img) => (
                <div key={img.id} className={`relative rounded-xl overflow-hidden border-2 transition-all ${img.active ? "border-transparent" : "border-error/40 opacity-60"}`}>
                  <img src={img.image_url} alt={img.title || ""} className="w-full aspect-square object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 to-transparent flex flex-col justify-end p-2 gap-1">
                    {img.title && <p className="text-on-primary font-label-sm text-label-sm font-semibold truncate">{img.title}</p>}
                    {img.caption && <p className="text-on-primary/70 text-[10px] truncate">{img.caption}</p>}
                    <p className="text-on-primary/50 text-[10px]">{format(new Date(img.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleImage.mutate({ id: img.id, active: !img.active })}
                      className={`p-1.5 rounded-lg text-[14px] shadow-sm transition-colors ${img.active ? "bg-surface text-on-surface" : "bg-secondary text-on-secondary"}`}
                      title={img.active ? "Hide image" : "Show image"}
                    >
                      <Icon name={img.active ? "visibility" : "visibility_off"} className="text-[14px]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(img.id)}
                      className="p-1.5 rounded-lg bg-error text-on-error text-[14px] shadow-sm"
                      title="Delete"
                    >
                      <Icon name="delete" className="text-[14px]" />
                    </button>
                  </div>
                  {!img.active && (
                    <div className="absolute top-2 left-2 bg-error text-on-error text-[10px] font-label-sm px-1.5 py-0.5 rounded">HIDDEN</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-on-surface/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <Icon name="delete" className="text-error text-[28px]" />
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">Delete Image?</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">This cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-6 py-2 bg-error text-on-error font-label-md text-label-md rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
