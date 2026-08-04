# IEEE Ambassador Portal — New Features Implementation Plan

## Overview

15 features requested, grouped into logical phases based on dependencies.

---

## ✅ Clarifications Resolved

- **Reviewer assignment**: Reviewers can be assigned to **multiple departments**. They see submissions from all their assigned departments.
- **Task targeting**: `target_role` = `class_ambassador` | `dept_ambassador` | `all`. For Dept Ambassador tasks, `target_semester` is ignored.
- **Admin queue**: Two separate queues — **Reviewer-Approved** (needs admin final approval) and **Unverified** (not yet reviewed).
- **Ambassador ID**: Auto-generated on approval. `SBA-C-{n}` for class, `SBA-D-{n}` for dept.
- **Gallery**: Captions + titles, both optional.
- **Email**: SMTP via Supabase Edge Function (nodemailer). User configures SMTP credentials in `.env.local`.
- **Mobile responsiveness**: All new pages must be fully responsive.

---

## Phase 1 — Database Schema Changes (Migration SQL)

All subsequent phases depend on the schema being updated first.

### Changes Required

| Table | Change |
|---|---|
| `profiles` | Add: `mobile_number`, `section`, `ambassador_id`, change `ieee_member_id` to nullable, add role values `dept_ambassador` \| `reviewer`, add `assigned_department` (for reviewer/dept-amb) |
| `tasks` | Add: `target_role` field (`all` \| `class_ambassador` \| `dept_ambassador`) |
| `task_assignments` | Add: `reviewer_remarks`, `reviewer_id`, `reviewer_points_suggested`, `admin_remarks`, `admin_points_awarded` |
| `gallery` | **NEW TABLE**: `id`, `image_url`, `caption`, `created_by`, `created_at`, `active` |
| `queries` | **NEW TABLE**: `id`, `user_id`, `subject`, `message`, `status` (`open`\|`closed`), `admin_reply`, `created_at` |
| `member_additions` | **NEW TABLE**: `id`, `submitted_by`, `member_name`, `ieee_id`, `status` (`pending`\|`approved`), `points_to_award`, `admin_remarks`, `created_at` |

### Trigger Changes
- `handle_new_user` — also save `mobile_number`, `section`
- New trigger to auto-generate `ambassador_id` on profile approval (`SBA-C-{seq}` or `SBA-D-{seq}`)

---

## Phase 2 — TypeScript Types & Constants

### Files Changed
#### [MODIFY] database.types.ts
- Update `UserRole` to add `"dept_ambassador" | "reviewer"`
- Update `Profile` to add `mobile_number`, `section`, `ambassador_id`, `assigned_department`
- Add `Gallery`, `Query`, `MemberAddition` interfaces
- Update `Task` to add `target_role`
- Update `TaskAssignment` to add reviewer/admin remark fields

#### [NEW] constants.ts
- `DEPARTMENTS` — new list: CS, CS-AI, CS-CY, AD, EC, ER, EEE, ME, CE
- `SECTIONS` — A, B, C
- `ROLES` — all four roles with labels

---

## Phase 3 — Registration & Profile Updates (Features 5, 6, 7)

#### [MODIFY] register.tsx
- Update department list to new 9 departments
- Add **Mobile Number** field (required)
- Add **Section** field (A/B/C, required)
- Make **IEEE Membership ID** optional (no `required` attribute)

#### [MODIFY] profile.tsx
- Show and allow editing of `mobile_number`, `section`, `ieee_member_id` (still optional)
- Show read-only `ambassador_id` if assigned

#### [MODIFY] auth-context.tsx
- Update `signUp` meta to include `mobile_number`, `section`, optional `ieee_member_id`

---

## Phase 4 — Department List Sync (Feature 3)

Update all department dropdowns to the 9 new departments: `cs`, `cs-ai`, `cs-cy`, `ad`, `ec`, `er`, `eee`, `me`, `ce`.

#### Files to update
- `register.tsx` (done in Phase 3)
- `profile.tsx` (done in Phase 3)
- `admin/tasks.tsx` (create/edit task department target)
- `LeaderboardView.tsx`
- `admin/ambassadors.tsx` (filter + display labels)
- `constants.ts` (single source of truth)

---

## Phase 5 — Roles & Reviewer Workflow (Feature 4)

This is the largest feature.

### New Role: dept_ambassador
- Sees tasks targeted at `target_role = "dept_ambassador"` or `"all"` for their department
- Has own leaderboard section (Feature 12)

### New Role: reviewer
- Assigned a department via `assigned_department`
- Can see task submissions from their assigned department
- Can edit `reviewer_points_suggested` and add `reviewer_remarks`
- Can change submission status to `"reviewer_approved"` (passes to admin queue)
- **New page**: `/reviewer/submissions`

### Admin changes for roles
- Task creation: add `target_role` field
- Submission review: show reviewer remarks / reviewer name, admin can override points & add remarks before final approval

#### New Files
- [NEW] `src/routes/reviewer/submissions.tsx`
- [NEW] `src/components/ReviewerShell.tsx`
- [NEW] `src/routes/reviewer/index.tsx`

#### Modified Files
- `admin/tasks.tsx` — add `target_role` field
- `admin/ambassadors.tsx` — add "Change Role" button
- `use-tasks.ts` — filter by `target_role`
- `use-profiles.ts` — add `useUpdateRole()`, `useReviewerSubmissions()`
- `AuthGuard.tsx` — add `ReviewerGuard`

---

## Phase 6 — Gallery (Feature 2)

#### [NEW] `src/routes/gallery.tsx` — Public page (no auth needed)
#### [NEW] `src/routes/admin/gallery.tsx` — Admin gallery management

#### Modified Files
- `index.tsx` — Add Gallery link in homepage nav
- `AdminShell.tsx` — Add Gallery to admin nav
- `__root.tsx` — Ensure gallery route is public

---

## Phase 7 — Leaderboard Split (Features 1, 12, 13)

#### [MODIFY] `src/routes/leaderboard.tsx`
- Two tabs: **Class Ambassadors** | **Dept Ambassadors**
- Show semester in each row (Feature 1)

#### [MODIFY] `src/routes/admin/leaderboard.tsx`
- Same two-tab split

#### [MODIFY] `src/routes/index.tsx` (homepage — Feature 13)
- Add public leaderboard section: Top 5 class volunteers + Top 1 dept volunteer

#### [MODIFY] `src/hooks/use-profiles.ts`
- Split `useLeaderboard()` into `useClassLeaderboard()` and `useDeptLeaderboard()`

---

## Phase 8 — Ambassador Filters (Feature 8)

#### [MODIFY] `src/routes/admin/ambassadors.tsx`
- Multi-filter bar: Department, Semester, Role, Status (all combinable simultaneously)

---

## Phase 9 — Ambassador ID (Feature 11)

- SQL sequence for auto-increment
- Trigger assigns `SBA-C-{n}` (class) or `SBA-D-{n}` (dept) on approval
- Show ID badge in admin ambassadors list and in profile

---

## Phase 10 — Query Form (Feature 10)

#### [NEW] `src/routes/queries.tsx` — Ambassador query submission
#### [NEW] `src/routes/admin/queries.tsx` — Admin query inbox with reply

---

## Phase 11 — Member Addition (Feature 14)

#### [NEW] `src/routes/member-addition.tsx` — Ambassador submits Name + IEEE ID
#### [NEW] `src/routes/admin/member-additions.tsx` — Admin approves, edits points

---

## Phase 12 — Email on Approval (Feature 9)

> [!CAUTION]
> Requires a Resend/SendGrid API key. Will create Supabase Edge Function with placeholder if not available.

---

## Phase 13 — Admin Role Management (Feature 15)

#### [MODIFY] `src/routes/admin/ambassadors.tsx`
- "Change Role" dropdown per ambassador row

---

## Execution Order

1. SQL migration (Phase 1) — **YOU run this in Supabase SQL Editor**
2. Types & constants (Phase 2)
3. Registration/Profile (Phases 3 & 4)
4. Roles & Reviewer (Phase 5)
5. Gallery (Phase 6)
6. Leaderboard split (Phase 7)
7. Ambassador filters (Phase 8)
8. Ambassador ID (Phase 9)
9. Query form (Phase 10)
10. Member addition (Phase 11)
11. Email (Phase 12)
12. Admin role management (Phase 13)
