-- Enable RLS on the tables
alter table public.restaurants enable row level security;
alter table public.user_profiles enable row level security;

-- Policy for Restaurants: Allow any authenticated user to view restaurants
-- This is necessary so they can select their location upon login/dashboard
create policy "Allow read access for all authenticated users"
on public.restaurants
for select
to authenticated
using (true);

-- Optional: If managers need to add/edit restaurants, we can add a write policy later.
-- For now, if you need to insert via SQL Editor, you are a superuser so it bypasses RLS.

-- Policy for User Profiles: Allow users to view and edit their OWN profile
create policy "Users can view own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

-- If managers need to view OTHER profiles, we might need a broader select policy:
-- create policy "Allow authenticated to view all profiles" 
-- on public.user_profiles for select to authenticated using (true);
