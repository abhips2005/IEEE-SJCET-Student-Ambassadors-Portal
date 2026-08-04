import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { useGallery } from "@/hooks/use-extras";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery | IEEE SJCET Student Ambassadors" },
      { name: "description", content: "Photo gallery of IEEE SJCET Student Ambassador events and activities." },
    ],
  }),
});

function GalleryPage() {
  const { data: images, isLoading } = useGallery(false);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-container-low border-b border-outline-variant px-4 sm:px-6 lg:px-[40px] py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-headline-lg text-on-surface">Gallery</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Moments from our events, workshops, and community activities.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px] py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="photo_library" className="text-[64px] text-on-surface-variant/30 mb-4" />
            <p className="text-headline-md text-on-surface-variant">No photos yet</p>
            <p className="text-body-md text-on-surface-variant/70 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {images.map((img) => (
              <div key={img.id} className="break-inside-avoid group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <img
                  src={img.image_url}
                  alt={img.title || "Gallery image"}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {(img.title || img.caption) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-on-surface/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {img.title && (
                      <p className="text-on-primary font-label-md text-label-md font-semibold leading-snug">{img.title}</p>
                    )}
                    {img.caption && (
                      <p className="text-on-primary/80 font-label-sm text-label-sm mt-0.5">{img.caption}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
