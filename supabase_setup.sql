-- Create a table for restaurants
create table public.restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  theme_color text not null default 'blue', -- e.g., 'blue', 'green', 'orange'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert the 3 restaurants
insert into public.restaurants (name, location, theme_color)
values
  ('Fridas Collierville', 'Collierville', 'rose'),
  ('Fridas Midtown', 'Midtown', 'amber'),
  ('Guac Downtown', 'Downtown', 'emerald');

-- Add restaurant_id to employees table
alter table public.employees 
add column restaurant_id uuid references public.restaurants(id);

-- Optional: Create a mapping for users to restaurants if needed
-- For now, we might handle this via roles or metadata in the auth.users table, 
-- or a separate profiles table.
create table public.user_profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  role text default 'manager', -- 'admin', 'manager'
  assigned_restaurant_id uuid references public.restaurants(id)
);
