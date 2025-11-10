-- ============================================
-- QUICK FIX: Remove RLS Recursion Error
-- ============================================
-- Copy this entire script and run it in Supabase SQL Editor
-- This will fix the "infinite recursion" error

-- Step 1: Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

DROP POLICY IF EXISTS "Authenticated users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update own incidents" ON incidents;
DROP POLICY IF EXISTS "Admins can update any incident" ON incidents;
DROP POLICY IF EXISTS "Users can delete own incidents" ON incidents;
DROP POLICY IF EXISTS "Admins can delete any incident" ON incidents;

DROP POLICY IF EXISTS "Authenticated users can create feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can delete feedback" ON feedback;

-- Step 2: Create simple policies (NO RECURSION)
-- These policies don't check the users table for roles
-- Admin operations go through Flask backend (bypasses RLS)

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- INCIDENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view all incidents" ON incidents
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incidents" ON incidents
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK TABLE POLICIES
-- ============================================

CREATE POLICY "Authenticated users can create feedback" ON feedback
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT 
  USING (email = auth.email());

-- ============================================
-- DONE! ✅
-- ============================================
-- Your app should now work without recursion errors
-- Admin operations work through Flask backend (bypasses RLS)
-- RLS protects against unauthorized direct database access
