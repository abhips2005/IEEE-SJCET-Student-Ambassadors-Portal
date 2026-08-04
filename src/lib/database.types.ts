export type UserRole = "ambassador" | "admin";
export type UserStatus = "pending" | "active" | "suspended";
export type TaskCategory = "event_organization" | "content_creation" | "mentorship" | "outreach";
export type TaskStatus = "open" | "in_progress" | "completed" | "archived";
export type AssignmentStatus = "claimed" | "submitted" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  department: string;
  semester: number;
  ieee_member_id: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  points_reward: number;
  due_date: string | null;
  status: TaskStatus;
  max_claimants: number;
  target_department?: string | null;
  target_semester?: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  status: AssignmentStatus;
  proof_text: string | null;
  claimed_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface PointAdjustment {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_by: string | null;
  active: boolean;
  created_at: string;
}

/** Joined types used in UI */
export interface TaskWithAssignment extends Task {
  assignment?: TaskAssignment | null;
}

export interface AssignmentWithTask extends TaskAssignment {
  task?: Task;
  user?: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Omit<Task, "id" | "created_at" | "updated_at">> & { title: string };
        Update: Partial<Omit<Task, "id" | "created_at">>;
        Relationships: [];
      };
      task_assignments: {
        Row: TaskAssignment;
        Insert: Partial<Omit<TaskAssignment, "id" | "claimed_at">> & { task_id: string; user_id: string };
        Update: Partial<Omit<TaskAssignment, "id" | "claimed_at">>;
        Relationships: [];
      };
      point_adjustments: {
        Row: PointAdjustment;
        Insert: Omit<PointAdjustment, "id" | "created_at">;
        Update: Partial<Omit<PointAdjustment, "id" | "created_at">>;
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Omit<Announcement, "id" | "created_at">> & { title: string };
        Update: Partial<Omit<Announcement, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
