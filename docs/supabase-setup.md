# Supabase Integration Guide

## Environment Setup

Required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Database Schema

### Properties Table
```sql
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

-- Enable Row Level Security
alter table properties enable row level security;

-- Policies
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
```

### Profiles Table
```sql
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

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

## Authentication

Authentication is handled through middleware and protected routes. The following routes are public:
- / (home)
- /auth/login
- /auth/register
- /about

All other routes require authentication. Unauthenticated users will be redirected to the login page.

## Usage Examples

### Client-side Data Fetching
```typescript
import { createBrowserClient } from '@/lib/supabase'

// In your component
const supabase = createBrowserClient()

// Fetch properties
const { data: properties, error } = await supabase
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false })

if (error) {
  handleSupabaseError(error)
}
```

### Server-side Data Fetching
```typescript
import { createServerClient } from '@/lib/supabase'

// In your Server Component
const supabase = createServerClient()

// Fetch properties
const { data: properties } = await supabase
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false })
```

### Admin Operations
```typescript
import { supabaseAdmin } from '@/lib/supabase'

// Admin-only operations (backend)
const { data, error } = await supabaseAdmin
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)
```

### Error Handling
```typescript
import { handleSupabaseError } from '@/lib/supabase'

try {
  const { error } = await supabase
    .from('properties')
    .insert(newProperty)
  
  if (error) {
    handleSupabaseError(error)
  }
} catch (error) {
  // Handle other errors
  console.error('Failed to insert property:', error)
}
```

## Type Safety

The project includes TypeScript types for all database tables. These types are automatically generated from the database schema and can be found in `types/supabase.ts`.

To use these types in your queries:

```typescript
import type { Database } from '@/types/supabase'

type Property = Database['public']['Tables']['properties']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
```

## Next Steps

1. Run database migrations to create tables and policies
2. Set up authentication providers in Supabase dashboard
3. Configure email templates for auth
4. Set up storage buckets for property images
5. Configure real-time subscriptions if needed
