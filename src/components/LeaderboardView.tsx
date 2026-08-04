import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { useClassLeaderboard, useDeptLeaderboard } from "@/hooks/use-profiles";
import { useAuth } from "@/lib/auth-context";
import { DEPT_MAP } from "@/lib/constants";
import { useState } from "react";
import type { Profile } from "@/lib/database.types";

type LeaderboardEntry = Pick<Profile, "id" | "full_name" | "department" | "semester" | "avatar_url" | "points" | "ambassador_id">;

function RankList({ ranks, currentUserId }: { ranks: LeaderboardEntry[]; currentUserId?: string | undefined }) {
  if (ranks.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <Icon name="leaderboard" className="text-[48px] opacity-30 mb-3" />
        <p className="text-body-md">No ambassadors yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
      {ranks.map((r, i) => {
        const isMe = r.id === currentUserId;
        const initials = (r.full_name || "?")
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div
            key={r.id}
            className={cn(
              "flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-outline-variant/40 last:border-b-0",
              isMe && "bg-primary-fixed/50",
            )}
          >
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md shrink-0 text-xs",
                i < 3
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant",
              )}
            >
              {i + 1}
            </span>
            {r.avatar_url ? (
              <img
                alt={r.full_name}
                className="w-9 h-9 shrink-0 rounded-full object-cover"
                src={r.avatar_url}
              />
            ) : (
              <div className="w-9 h-9 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold">
                {initials}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-body-md text-on-surface font-semibold truncate">
                {r.full_name}
                {isMe && (
                  <span className="ml-2 text-primary font-label-sm text-label-sm">(You)</span>
                )}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {DEPT_MAP[r.department] || r.department}
                {r.semester ? ` · Sem ${r.semester}` : ""}
                {r.ambassador_id ? ` · ${r.ambassador_id}` : ""}
              </span>
            </div>
            <span className="text-headline-md text-primary font-bold flex shrink-0 items-center gap-1">
              <Icon name="stars" className="text-[18px]" />
              {r.points.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-surface-container rounded-lg" />
      ))}
    </div>
  );
}

export function LeaderboardView() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"class" | "dept">("class");
  const { data: classRanks, isLoading: classLoading } = useClassLeaderboard();
  const { data: deptRanks, isLoading: deptLoading } = useDeptLeaderboard();

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-surface-container rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("class")}
          className={cn(
            "px-4 py-2 rounded-lg font-label-md text-label-md transition-all",
            tab === "class"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          Class Ambassadors
        </button>
        <button
          onClick={() => setTab("dept")}
          className={cn(
            "px-4 py-2 rounded-lg font-label-md text-label-md transition-all",
            tab === "dept"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          Dept Ambassadors
        </button>
      </div>

      {tab === "class" ? (
        classLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <RankList ranks={classRanks ?? []} currentUserId={user?.id} />
        )
      ) : deptLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <RankList ranks={deptRanks ?? []} currentUserId={user?.id} />
      )}
    </div>
  );
}
