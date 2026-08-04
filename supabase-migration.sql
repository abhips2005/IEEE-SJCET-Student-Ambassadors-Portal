-- ============================================================
-- IEEE Student Ambassador Portal — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  department text not null default 'other',
  semester int not null default 1,
  ieee_member_id text not null default '',
  role text not null default 'ambassador' check (role in ('ambassador', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  avatar_url text,
  points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles RLS
create policy "Anyone authenticated can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile (limited fields)"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "System can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2. TASKS TABLE
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'outreach' check (category in ('event_organization', 'content_creation', 'mentorship', 'outreach')),
  points_reward int not null default 0,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'archived')),
  max_claimants int not null default 1,
  target_department text,
  target_semester int,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Authenticated users can read tasks"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Admins can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update tasks"
  on public.tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete tasks"
  on public.tasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. TASK ASSIGNMENTS TABLE
create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'claimed' check (status in ('claimed', 'submitted', 'approved', 'rejected')),
  proof_text text,
  claimed_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  unique (task_id, user_id)
);

alter table public.task_assignments enable row level security;

create policy "Users can read own assignments"
  on public.task_assignments for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can read all assignments"
  on public.task_assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Active users can claim tasks"
  on public.task_assignments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'active'
    )
  );

create policy "Users can update own assignments"
  on public.task_assignments for update
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can update any assignment"
  on public.task_assignments for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. POINT ADJUSTMENTS TABLE
create table if not exists public.point_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null,
  reason text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.point_adjustments enable row level security;

create policy "Users can read own point adjustments"
  on public.point_adjustments for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can read all point adjustments"
  on public.point_adjustments for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert point adjustments"
  on public.point_adjustments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  created_by uuid references public.profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Authenticated users can read active announcements"
  on public.announcements for select
  to authenticated
  using (active = true);

create policy "Admins can read all announcements"
  on public.announcements for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert announcements"
  on public.announcements for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update announcements"
  on public.announcements for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, department, semester, ieee_member_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'department', 'other'),
    coalesce((new.raw_user_meta_data ->> 'semester')::int, 1),
    coalesce(new.raw_user_meta_data ->> 'ieee_member_id', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. TRIGGER: Auto-award points when assignment is approved
create or replace function public.handle_assignment_approved()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    update public.profiles
    set points = points + (
      select points_reward from public.tasks where id = new.task_id
    ),
    updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create or replace trigger on_assignment_status_change
  after update of status on public.task_assignments
  for each row execute procedure public.handle_assignment_approved();

-- 8. TRIGGER: Apply manual point adjustments
create or replace function public.handle_point_adjustment()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
  set points = points + new.amount,
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create or replace trigger on_point_adjustment_created
  after insert on public.point_adjustments
  for each row execute procedure public.handle_point_adjustment();

-- 9. TRIGGER: Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create or replace trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.update_updated_at();

-- 10. INDEXES for performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_points on public.profiles(points desc);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_category on public.tasks(category);
create index if not exists idx_task_assignments_user on public.task_assignments(user_id);
create index if not exists idx_task_assignments_task on public.task_assignments(task_id);
create index if not exists idx_task_assignments_status on public.task_assignments(status);
create index if not exists idx_announcements_active on public.announcements(active);

-- 11. STORAGE BUCKETS
insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 204800)
on conflict (id) do update set file_size_limit = 204800;

create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and 
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and 
    (storage.foldername(name))[1] = auth.uid()::text
  );
