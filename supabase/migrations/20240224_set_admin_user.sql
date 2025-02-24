-- Set admin role for your user
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- If you're running this in the Supabase dashboard or want to set a specific user as admin,
-- replace auth.uid() with the user's ID in single quotes, like:
-- WHERE id = '1234-5678-9012-3456';
