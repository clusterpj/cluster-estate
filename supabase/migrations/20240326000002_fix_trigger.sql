-- Drop existing triggers and functions
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Create the function with better error handling and logging
create or replace function handle_new_user()
returns trigger
security definer -- Run with elevated privileges
set search_path = public -- Ensure we're using public schema
language plpgsql
as $$
declare
  profile_exists boolean;
begin
  -- Check if profile already exists
  select exists(
    select 1 from public.profiles where id = new.id
  ) into profile_exists;

  -- Only create profile if it doesn't exist
  if not profile_exists then
    insert into public.profiles (
      id,
      email,
      full_name,
      created_at,
      updated_at
    ) values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      now(),
      now()
    );
  end if;

  return new;
exception when others then
  -- Log the error details
  raise warning 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
  return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Verify trigger exists
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    raise exception 'Trigger creation failed';
  end if;
end;
$$;
