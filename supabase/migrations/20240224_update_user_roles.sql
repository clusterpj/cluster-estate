-- Update profiles table to include role column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text;
    END IF;
END $$;

-- Create type for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add constraint to profiles.role to only allow valid roles
ALTER TABLE profiles 
    DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'user'));

-- Set default role to 'user' for existing profiles without a role
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Make role column NOT NULL
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;
