-- ============================================================
-- REVIEWER WORKFLOW MIGRATION v4
-- Run this in the Supabase SQL Editor AFTER v3 (notifications)
-- ============================================================

-- 1. NOTIFICATION: when reviewer approves (forwards to admin)
--    Notify the ambassador that their submission is now with admin
create or replace function public.handle_reviewer_approved()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  task_title text;
begin
  if new.status = 'reviewer_approved' and old.status is distinct from 'reviewer_approved' then
    select title into task_title
    from public.tasks where id = new.task_id;

    insert into public.notifications (user_id, type, title, message, metadata)
    values (
      new.user_id,
      'reviewer_approved',
      'Submission Forwarded to Admin ✅',
      'Your submission for "' || coalesce(task_title, 'Unknown Task') || '" has been reviewed and forwarded to admin for final approval.',
      jsonb_build_object(
        'task_id', new.task_id,
        'assignment_id', new.id,
        'reviewer_id', new.reviewer_id
      )
    );
  end if;
  return new;
end;
$$;

create or replace trigger on_reviewer_approved
  after update of status on public.task_assignments
  for each row execute procedure public.handle_reviewer_approved();


-- 2. UPDATE the points-award trigger to use admin_points_awarded if set,
--    fallback to reviewer_points_suggested, fallback to task points_reward
create or replace function public.handle_assignment_approved()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base_points int;
  final_points int;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    select points_reward into base_points from public.tasks where id = new.task_id;
    
    -- Priority: admin override > reviewer suggestion > task default
    final_points := coalesce(new.admin_points_awarded, new.reviewer_points_suggested, base_points, 0);
    
    update public.profiles
    set points = points + final_points,
        updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;
-- The trigger on_assignment_status_change already exists and fires this function


-- 3. NOTIFICATION: when reviewer rejects a submission
--    Notify the ambassador that their submission was rejected (they can re-submit)
create or replace function public.handle_reviewer_rejected()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  task_title text;
begin
  -- Only fire when a reviewer (not admin) rejects: reviewer_id is set in the same update
  if new.status = 'rejected' and old.status = 'submitted' and new.reviewer_id is not null then
    select title into task_title
    from public.tasks where id = new.task_id;

    insert into public.notifications (user_id, type, title, message, metadata)
    values (
      new.user_id,
      'submission_rejected',
      'Submission Needs Revision 📝',
      'Your submission for "' || coalesce(task_title, 'Unknown Task') || '" was not approved by the reviewer. You can revise and re-submit.',
      jsonb_build_object(
        'task_id', new.task_id,
        'assignment_id', new.id,
        'reviewer_remarks', coalesce(new.reviewer_remarks, '')
      )
    );
  end if;
  return new;
end;
$$;

create or replace trigger on_reviewer_rejected
  after update of status on public.task_assignments
  for each row execute procedure public.handle_reviewer_rejected();
