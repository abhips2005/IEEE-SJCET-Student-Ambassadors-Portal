-- ============================================================
-- NEW FEATURES MIGRATION v2
-- Run this in the Supabase SQL Editor AFTER the original migration
-- ============================================================

-- 1. PROFILES TABLE — add new columns
alter table public.profiles
  add column if not exists mobile_number text,
  add column if not exists section text check (section in ('A', 'B', 'C')),
  add column if not exists ambassador_id text unique,
  add column if not exists assigned_departments text[] default '{}';

-- Make ieee_member_id optional (allow empty string or null — it already allows '' from the trigger)
-- The column exists; no type change needed, just remove any NOT NULL if present:
alter table public.profiles alter column ieee_member_id drop not null;

-- Update role check constraint to include new roles
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('ambassador', 'admin', 'dept_ambassador', 'reviewer'));

-- 2. TASKS TABLE — add target_role
alter table public.tasks
  add column if not exists target_role text not null default 'all'
    check (target_role in ('all', 'class_ambassador', 'dept_ambassador'));

-- 3. TASK ASSIGNMENTS TABLE — add reviewer workflow columns
alter table public.task_assignments
  add column if not exists reviewer_id uuid references public.profiles(id),
  add column if not exists reviewer_remarks text,
  add column if not exists reviewer_points_suggested int,
  add column if not exists admin_remarks text,
  add column if not exists admin_points_awarded int;

-- Update assignment status check to include reviewer_approved
alter table public.task_assignments drop constraint if exists task_assignments_status_check;
alter table public.task_assignments add constraint task_assignments_status_check
  check (status in ('claimed', 'submitted', 'reviewer_approved', 'approved', 'rejected'));

-- 4. GALLERY TABLE (new)
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  caption text,
  created_by uuid references public.profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery enable row level security;

create policy "Gallery is publicly readable"
  on public.gallery for select
  using (active = true);

create policy "Admins can manage gallery"
  on public.gallery for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. QUERIES TABLE (new)
create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.queries enable row level security;

create policy "Users can read own queries"
  on public.queries for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own queries"
  on public.queries for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Admins can read all queries"
  on public.queries for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update queries"
  on public.queries for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 6. MEMBER ADDITIONS TABLE (new)
create table if not exists public.member_additions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  member_name text not null,
  ieee_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  points_to_award int not null default 50,
  admin_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_additions enable row level security;

create policy "Users can read own member additions"
  on public.member_additions for select
  to authenticated
  using (submitted_by = auth.uid());

create policy "Active users can submit member additions"
  on public.member_additions for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

create policy "Admins can read all member additions"
  on public.member_additions for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update member additions"
  on public.member_additions for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 7. SEQUENCES for ambassador IDs
create sequence if not exists public.class_ambassador_id_seq start 1;
create sequence if not exists public.dept_ambassador_id_seq start 1;

-- 8. FUNCTION: Auto-generate ambassador_id on activation
create or replace function public.handle_profile_activation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Only when status changes to 'active' and ambassador_id is not yet set
  if new.status = 'active' and old.status is distinct from 'active' and new.ambassador_id is null then
    if new.role = 'dept_ambassador' then
      new.ambassador_id := 'SBA-D-' || lpad(nextval('public.dept_ambassador_id_seq')::text, 3, '0');
    else
      -- class_ambassador, ambassador (default), reviewer all get class ID
      new.ambassador_id := 'SBA-C-' || lpad(nextval('public.class_ambassador_id_seq')::text, 3, '0');
    end if;
  end if;
  return new;
end;
$$;

create or replace trigger on_profile_activated
  before update of status on public.profiles
  for each row execute procedure public.handle_profile_activation();

-- 9. UPDATE handle_new_user to accept new fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, department, semester, ieee_member_id, mobile_number, section)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'department', 'cs'),
    coalesce((new.raw_user_meta_data ->> 'semester')::int, 1),
    coalesce(new.raw_user_meta_data ->> 'ieee_member_id', null),
    coalesce(new.raw_user_meta_data ->> 'mobile_number', null),
    coalesce(new.raw_user_meta_data ->> 'section', null)
  );
  return new;
end;
$$;

-- 10. GALLERY storage bucket
insert into storage.buckets (id, name, public, file_size_limit)
values ('gallery', 'gallery', true, 5242880)  -- 5MB limit for gallery images
on conflict (id) do nothing;

create policy "Gallery images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Admins can upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 11. Reviewer can read submissions from their assigned departments
create policy "Reviewers can read submissions from their departments"
  on public.task_assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles reviewer
      join public.profiles submitter on submitter.id = task_assignments.user_id
      where reviewer.id = auth.uid()
        and reviewer.role = 'reviewer'
        and submitter.department = any(reviewer.assigned_departments)
    )
  );

create policy "Reviewers can update submissions from their departments"
  on public.task_assignments for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles reviewer
      join public.profiles submitter on submitter.id = task_assignments.user_id
      where reviewer.id = auth.uid()
        and reviewer.role = 'reviewer'
        and submitter.department = any(reviewer.assigned_departments)
    )
  );

-- 12. INDEXES
create index if not exists idx_profiles_ambassador_id on public.profiles(ambassador_id);
create index if not exists idx_profiles_section on public.profiles(section);
create index if not exists idx_tasks_target_role on public.tasks(target_role);
create index if not exists idx_task_assignments_reviewer on public.task_assignments(reviewer_id);
create index if not exists idx_gallery_active on public.gallery(active);
create index if not exists idx_queries_user on public.queries(user_id);
create index if not exists idx_queries_status on public.queries(status);
create index if not exists idx_member_additions_submitted_by on public.member_additions(submitted_by);
create index if not exists idx_member_additions_status on public.member_additions(status);
