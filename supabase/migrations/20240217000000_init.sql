
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Teams table
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Team Members table
create table public.team_members (
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed', 'archived', 'paused')),
  team_id uuid references public.teams on delete cascade,
  owner_id uuid references public.profiles on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  assignee_id uuid references public.profiles on delete set null,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Learning Sessions table
create table public.learning_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  topic text not null,
  duration_minutes integer,
  notes text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Reflections table
create table public.reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  type text default 'daily' check (type in ('daily', 'weekly', 'monthly')),
  created_at timestamptz default now()
);

-- Skills table
create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  current_level integer default 1,
  target_level integer default 10,
  category text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.reflections enable row level security;
alter table public.skills enable row level security;

-- RLS Policies
-- Profiles: View all, Edit own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- Teams: View if member
create policy "Teams viewable by members" on public.teams for select using (
  exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid())
);

-- Team Members: View if member of team
create policy "Team members viewable by team members" on public.team_members for select using (
  exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
);

-- Projects: View if member of team (or public projects if we had them, restricting to team for now)
-- Simplifying for prototype: Authenticated users can create projects.
-- Ideally: Projects belong to teams. Access is checked via team membership.
create policy "Projects viewable by team members" on public.projects for select using (
  exists (select 1 from public.team_members where team_id = projects.team_id and user_id = auth.uid())
  or owner_id = auth.uid()
);
create policy "Projects insertable by authenticated users" on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Projects updatable by team members" on public.projects for update using (
  exists (select 1 from public.team_members where team_id = projects.team_id and user_id = auth.uid())
  or owner_id = auth.uid()
);

-- Tasks: Similar to projects
create policy "Tasks viewable by project team members" on public.tasks for select using (
  exists (select 1 from public.projects p
          join public.team_members tm on p.team_id = tm.team_id
          where p.id = tasks.project_id and tm.user_id = auth.uid())
  or assignee_id = auth.uid()
);
create policy "Tasks insertable by project team members" on public.tasks for insert with check (auth.role() = 'authenticated');

-- Learning/Skills/Reflections: Own data only (mostly)
create policy "Users can view own learning sessions" on public.learning_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own learning sessions" on public.learning_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own learning sessions" on public.learning_sessions for update using (auth.uid() = user_id);

create policy "Users can view own reflections" on public.reflections for select using (auth.uid() = user_id);
create policy "Users can insert own reflections" on public.reflections for insert with check (auth.uid() = user_id);

create policy "Users can view own skills" on public.skills for select using (auth.uid() = user_id);
create policy "Users can insert own skills" on public.skills for insert with check (auth.uid() = user_id);
create policy "Users can update own skills" on public.skills for update using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

