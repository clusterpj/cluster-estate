-- Enable auth schema if not exists
create schema if not exists auth;

-- Enable auth extensions
create extension if not exists "uuid-ossp";

-- Drop existing triggers and functions with proper order
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Recreate the function with proper error handling
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
exception when others then
  -- Log the error (will appear in Supabase logs)
  raise warning 'Error in handle_new_user: %', SQLERRM;
  return new;
end;
$$ language plpgsql;

-- Recreate the trigger with proper error handling
create trigger handle_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Verify RLS is enabled on profiles
alter table if exists public.profiles enable row level security;

-- Recreate profile policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Add proper indexes
create index if not exists profiles_user_id_idx on profiles(id);

-- Grant necessary permissions
grant usage on schema public to authenticated, anon;
grant all on public.profiles to authenticated, anon;
grant all on public.properties to authenticated, anon;
