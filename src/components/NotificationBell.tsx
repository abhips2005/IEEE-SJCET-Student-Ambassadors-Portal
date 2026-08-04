import { Icon } from "./Icon";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAnnouncements } from "@/hooks/use-announcements";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";

export function NotificationBell() {
  const { data: announcements, isLoading } = useAnnouncements();

  // Optionally filter out the very latest one if we only want to show "old" ones,
  // but showing all is usually better for a dedicated panel.
  // For now, we'll show all active announcements.
  const notices = announcements || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2.5 hover:bg-surface-container rounded-full transition-colors"
        >
          <Icon name="notifications" className="text-on-surface-variant" />
          {notices.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden shadow-lg border border-outline-variant bg-surface-container-lowest">
        <div className="bg-surface px-4 py-3 border-b border-outline-variant flex justify-between items-center">
          <span className="font-label-lg text-label-lg text-on-surface">Announcements</span>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold">
            {notices.length} New
          </span>
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              <div className="h-16 bg-surface-container rounded animate-pulse" />
              <div className="h-16 bg-surface-container rounded animate-pulse" />
            </div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <Icon name="notifications_off" className="text-[32px] opacity-30 mb-2 mx-auto" />
              <p className="text-body-sm">No new announcements</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors"
                >
                  <h4 className="font-label-md text-label-md text-on-surface mb-1">{notice.title}</h4>
                  <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-2">{notice.body}</p>
                  <p className="font-label-sm text-[10px] text-on-surface-variant opacity-70">
                    {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
