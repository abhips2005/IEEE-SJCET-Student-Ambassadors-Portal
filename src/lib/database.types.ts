export type UserRole = "ambassador" | "admin" | "dept_ambassador" | "reviewer";
export type UserStatus = "pending" | "active" | "suspended";
export type TaskCategory = "event_organization" | "content_creation" | "mentorship" | "outreach";
export type TaskStatus = "open" | "in_progress" | "completed" | "archived";
export type AssignmentStatus = "claimed" | "submitted" | "reviewer_approved" | "approved" | "rejected";
export type TargetRole = "all" | "class_ambassador" | "dept_ambassador";

export interface Profile {
  id: string;
  full_name: string;
  department: string;
  semester: number;
  section: string | null;
  ieee_member_id: string | null;
  mobile_number: string | null;
  ambassador_id: string | null;
  assigned_departments: string[];
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
  target_role: TargetRole;
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
  reviewer_id: string | null;
  reviewer_remarks: string | null;
  reviewer_points_suggested: number | null;
  admin_remarks: string | null;
  admin_points_awarded: number | null;
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

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  created_by: string | null;
  active: boolean;
  created_at: string;
}

export interface Query {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, "full_name" | "department" | "ambassador_id">;
}

export interface MemberAddition {
  id: string;
  submitted_by: string;
  member_name: string;
  ieee_id: string;
  status: "pending" | "approved" | "rejected";
  points_to_award: number;
  admin_remarks: string | null;
  created_at: string;
  updated_at: string;
  submitter?: Pick<Profile, "full_name" | "department" | "ambassador_id">;
}

/** Joined types used in UI */
export interface TaskWithAssignment extends Task {
  assignment?: TaskAssignment | null;
}

export interface AssignmentWithTask extends TaskAssignment {
  task?: Task;
  user?: Profile;
  reviewer?: Pick<Profile, "full_name" | "ambassador_id"> | null;
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
      gallery: {
        Row: GalleryImage;
        Insert: Partial<Omit<GalleryImage, "id" | "created_at">> & { image_url: string };
        Update: Partial<Omit<GalleryImage, "id" | "created_at">>;
        Relationships: [];
      };
      queries: {
        Row: Query;
        Insert: Partial<Omit<Query, "id" | "created_at" | "updated_at">> & { user_id: string; subject: string; message: string };
        Update: Partial<Omit<Query, "id" | "created_at">>;
        Relationships: [];
      };
      member_additions: {
        Row: MemberAddition;
        Insert: Partial<Omit<MemberAddition, "id" | "created_at" | "updated_at">> & { submitted_by: string; member_name: string; ieee_id: string };
        Update: Partial<Omit<MemberAddition, "id" | "created_at">>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Omit<Notification, "id" | "created_at">> & { user_id: string; title: string; message: string };
        Update: Partial<Omit<Notification, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
