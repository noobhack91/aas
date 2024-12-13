-- Drop the user_role type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Alter the users table to change role to roles
ALTER TABLE users 
DROP COLUMN IF EXISTS role,
ADD COLUMN roles VARCHAR(255)[] DEFAULT ARRAY['user']::VARCHAR(255)[];

-- Update existing users to have appropriate roles
UPDATE users 
SET roles = ARRAY[role]::VARCHAR(255)[] 
WHERE roles IS NULL; 