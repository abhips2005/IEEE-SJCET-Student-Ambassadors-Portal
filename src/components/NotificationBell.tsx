import { Icon } from "./Icon";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data: announcements, isLoading: loadingAnnouncements } = useAnnouncements();
  const { data: notifications, isLoading: loadingNotifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const [tab, setTab] = useState<"notifications" | "announcements">("notifications");

  const unreadNotices = notifications?.filter(n => !n.read) ?? [];
  const hasUnread = unreadNotices.length > 0;

  const notices = tab === "notifications" ? (notifications ?? []) : (announcements ?? []);
  const isLoading = tab === "notifications" ? loadingNotifications : loadingAnnouncements;

  const handleOpenChange = (open: boolean) => {
    if (open && hasUnread && tab === "notifications") {
      markAllRead.mutate();
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2.5 hover:bg-surface-container rounded-full transition-colors"
        >
          <Icon name="notifications" className="text-on-surface-variant" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden shadow-lg border border-outline-variant bg-surface-container-lowest">
        <div className="bg-surface px-4 py-3 border-b border-outline-variant flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-label-lg text-label-lg text-on-surface">Updates</span>
            {hasUnread && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold">
                {unreadNotices.length} New
              </span>
            )}
          </div>
          <div className="flex gap-4 border-b border-outline-variant/30 pb-0">
            <button
              onClick={() => {
                setTab("notifications");
                if (hasUnread) markAllRead.mutate();
              }}
              className={cn(
                "pb-2 font-label-sm text-label-sm transition-colors",
                tab === "notifications" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Alerts
            </button>
            <button
              onClick={() => setTab("announcements")}
              className={cn(
                "pb-2 font-label-sm text-label-sm transition-colors",
                tab === "announcements" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Global
            </button>
          </div>
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
              <p className="text-body-sm">No new updates</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notices.map((notice: any) => (
                <div
                  key={notice.id}
                  className={cn(
                    "p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors",
                    tab === "notifications" && !notice.read ? "bg-primary/5" : ""
                  )}
                >
                  <h4 className="font-label-md text-label-md text-on-surface mb-1 flex items-center gap-2">
                    {tab === "notifications" && !notice.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                    {notice.title}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-2">
                    {notice.message || notice.body}
                  </p>
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

