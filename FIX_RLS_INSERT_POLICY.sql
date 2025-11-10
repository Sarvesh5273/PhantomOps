-- ============================================
-- FIX: RLS Policy Blocking Backend Inserts
-- ============================================
-- The issue: Backend uses service role key, but INSERT policy checks auth.uid()
-- Solution: Update INSERT policy to allow service role OR matching user_id

-- Step 1: Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;

-- Step 2: Create new INSERT policy that works with service role
-- This policy allows:
-- 1. Service role (backend) to insert any incident
-- 2. Authenticated users to insert incidents with their own user_id
CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT 
  WITH CHECK (
    -- Allow if using service role (backend)
    auth.jwt()->>'role' = 'service_role'
    OR
    -- Allow if authenticated user and user_id matches
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );

-- Done! Backend can now insert incidents
