-- Create bookings table
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references properties not null,
  user_id uuid references auth.users not null,
  check_in timestamp with time zone not null,
  check_out timestamp with time zone not null,
  guests integer not null,
  total_price numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_id text, -- PayPal payment ID
  payment_status text check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  special_requests text,
  constraint valid_dates check (check_out > check_in)
);

-- Enable RLS on bookings
alter table bookings enable row level security;

-- Bookings policies
create policy "Users can view their own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "Property owners can view bookings for their properties"
  on bookings for select
  using (
    auth.uid() in (
      select user_id 
      from properties 
      where id = property_id
    )
  );

create policy "Users can insert their own bookings"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on bookings for update
  using (auth.uid() = user_id);

-- Function to handle booking updates
create or replace function handle_booking_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updating updated_at
create trigger handle_bookings_updated_at
  before update on bookings
  for each row
  execute function handle_booking_updated_at();

-- Create index for common queries
create index idx_bookings_property_id on bookings(property_id);
create index idx_bookings_user_id on bookings(user_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_dates on bookings(check_in, check_out);