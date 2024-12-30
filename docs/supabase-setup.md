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

## Schema Verification

### Running Database Tests

The project includes automated tests to verify the database schema, relationships, and RLS policies. To run the tests:

1. Ensure your environment variables are set in `.env.local`
2. Run the database tests:
```bash
npm run test-db
```

The tests verify:
- Table creation and constraints
- Foreign key relationships
- Automatic profile creation on user signup
- Row Level Security policies
- Data integrity

### Test Coverage

The automated tests check:

1. User Management:
   - User creation
   - Automatic profile creation
   - Profile-user relationship

2. Property Management:
   - Property creation
   - Foreign key constraints
   - Data validation

3. RLS Policies:
   - Public read access
   - Owner-only write access
   - Unauthorized access prevention

4. Data Integrity:
   - Constraint enforcement
   - Default values
   - Timestamps
   - Cascading deletes

### Manual Verification

After running migrations, you can manually verify the setup:

1. Check Tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. Check RLS:
```sql
SELECT tablename, hasrls 
FROM pg_tables 
WHERE schemaname = 'public';
```

3. Check Policies:
```sql
SELECT * 
FROM pg_policies 
WHERE schemaname = 'public';
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

1. Run database migrations:
```bash
supabase db reset
```

2. Run schema verification tests:
```bash
npm run test-db
```

3. Set up authentication providers in Supabase dashboard
4. Configure email templates for auth
5. Set up storage buckets for property images
6. Configure real-time subscriptions if needed

## Troubleshooting

### Common Issues

1. Migration Failures:
   - Check for existing tables/conflicts
   - Verify database permissions
   - Check syntax errors in migration files

2. RLS Policy Issues:
   - Verify user authentication
   - Check policy definitions
   - Test with different user roles

3. Foreign Key Errors:
   - Ensure referenced records exist
   - Check cascade settings
   - Verify constraint names

### Debug Queries

To debug RLS policies:

```sql
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = 'user-id-here';

-- Then run your query
SELECT * FROM properties;
