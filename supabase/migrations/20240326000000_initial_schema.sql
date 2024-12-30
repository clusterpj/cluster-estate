-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create properties table
create table properties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  price numeric not null,
  location text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  square_feet numeric not null,
  images text[] default '{}',
  features text[] default '{}',
  status text default 'available' check (status in ('available', 'sold', 'pending')),
  user_id uuid references auth.users not null
);

-- Enable RLS on properties
alter table properties enable row level security;

-- Properties policies
create policy "Public properties are viewable by everyone"
  on properties for select
  using (true);

create policy "Users can insert their own properties"
  on properties for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own properties"
  on properties for update
  using (auth.uid() = user_id);

create policy "Users can delete their own properties"
  on properties for delete
  using (auth.uid() = user_id);

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text not null,
  avatar_url text,
  role text default 'user' check (role in ('user', 'agent', 'admin')),
  phone text,
  bio text
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Function to handle profile updates
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updating updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();

-- Function to handle new user creation
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
end;
$$ language plpgsql;

-- Trigger for creating profile on signup
create trigger handle_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
