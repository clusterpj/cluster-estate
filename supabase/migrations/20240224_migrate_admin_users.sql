-- Migrate existing admin users from user_metadata to profiles table
UPDATE profiles 
SET role = 'admin'
FROM auth.users
WHERE profiles.id = auth.users.id 
AND auth.users.raw_user_meta_data->>'role' = 'admin';

-- Set role to 'user' for any remaining profiles without a role
UPDATE profiles 
SET role = 'user'
WHERE role IS NULL;
