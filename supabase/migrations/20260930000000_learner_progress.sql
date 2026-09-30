-- One row per learner: their progress, exactly as the app stores it in the
-- browser ({ "progress": {...}, "activity": ["2024-07-01", ...] }).
-- The app merges this with the browser's copy on every sync, so nothing done
-- on one device is lost on another.

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: a learner can only ever see or change their own row.
alter table public.learner_progress enable row level security;

create policy "Learners can read their own progress"
  on public.learner_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own progress"
  on public.learner_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own progress"
  on public.learner_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
