-- ============================================================
-- APPROVAL EMAIL TRIGGER
-- Creates a DB trigger that fires when a task_assignment is approved.
-- The trigger inserts a notification record. 
-- For actual email sending, deploy the Edge Function in supabase/functions/send-approval-email.
-- ============================================================

-- Notifications table for in-app + email queue
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'task_approved',
  title text not null,
  message text not null,
  read boolean not null default false,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

-- System can insert notifications
create policy "System can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Index for fast lookups
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- Trigger function: create notification when task is approved
create or replace function public.handle_task_approved()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  task_title text;
  points_awarded int;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    select title, points_reward into task_title, points_awarded
    from public.tasks where id = new.task_id;

    insert into public.notifications (user_id, type, title, message, metadata)
    values (
      new.user_id,
      'task_approved',
      'Task Approved! 🎉',
      'Your submission for "' || coalesce(task_title, 'Unknown Task') || '" has been approved. You earned ' || coalesce(new.admin_points_awarded, points_awarded, 0)::text || ' points!',
      jsonb_build_object(
        'task_id', new.task_id,
        'assignment_id', new.id,
        'points', coalesce(new.admin_points_awarded, points_awarded, 0)
      )
    );
  end if;
  return new;
end;
$$;

create or replace trigger on_task_approved
  after update of status on public.task_assignments
  for each row execute procedure public.handle_task_approved();
