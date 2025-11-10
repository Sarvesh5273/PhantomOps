# Fix: Infinite Recursion in RLS Policies

## Problem

The error "infinite recursion detected in policy for relation 'users'" occurs because the admin policies are checking the `users` table while evaluating policies ON the `users` table.

```sql
-- ❌ THIS CAUSES RECURSION:
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
    --            ^^^^^ Checking users table while ON users table = recursion!
  );
```

---

## Solution: Use JWT Claims Instead

Store the role in the JWT token's metadata, not in a database lookup.

---

## Step 1: Drop Existing Policies

Run this in Supabase SQL Editor:

```sql
-- Drop all existing policies
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
```

---

## Step 2: Create Fixed Policies (Without Recursion)

### Option A: Simple Policies (Recommended for Now)

These policies don't check roles - they just ensure users can only access their own data:

```sql
-- ============================================
-- USERS TABLE - SIMPLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own record (during signup)
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- INCIDENTS TABLE - SIMPLE POLICIES
-- ============================================

-- Anyone authenticated can view all incidents
CREATE POLICY "Authenticated users can view all incidents" ON incidents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create incidents
CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own incidents
CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own incidents
CREATE POLICY "Users can delete own incidents" ON incidents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FEEDBACK TABLE - SIMPLE POLICIES
-- ============================================

-- Authenticated users can create feedback
CREATE POLICY "Authenticated users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (email = auth.email());
```

---

### Option B: Use JWT Custom Claims (Advanced)

If you need admin-specific policies, use JWT custom claims instead of database lookups.

First, add role to JWT claims using a Supabase function:

```sql
-- Create function to add role to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the user role from the users table
  SELECT role INTO user_role FROM public.users WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    -- Set the claim
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null');
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

Then configure the hook in Supabase Dashboard:
1. Go to Authentication → Hooks
2. Enable "Custom Access Token Hook"
3. Select the function `custom_access_token_hook`

Then use this in policies:

```sql
-- Admin can view all users (using JWT claim)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role')::text = 'admin'
  );

-- Admin can update any incident (using JWT claim)
CREATE POLICY "Admins can update any incident" ON incidents
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_role')::text = 'admin'
  );
```

---

## Step 3: Recommended Approach for Your App

**Since your backend uses service role key (bypasses RLS), I recommend:**

### Simple Solution: Keep RLS Simple

Use **Option A** (simple policies) because:
1. Your backend handles admin logic (bypasses RLS anyway)
2. RLS just protects against unauthorized direct access
3. No recursion issues
4. Simpler to maintain

**Admin operations go through Flask backend → Service role → Bypasses RLS ✅**

---

## Step 4: Quick Fix Script

Run this complete script to fix the issue:

```sql
-- ============================================
-- COMPLETE FIX FOR RLS RECURSION
-- ============================================

-- Step 1: Drop all existing policies
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

-- Step 2: Keep RLS enabled
-- (Already enabled, no need to run again)

-- Step 3: Create simple policies (no recursion)

-- USERS TABLE
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- INCIDENTS TABLE
CREATE POLICY "Authenticated users can view all incidents" ON incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE USING (auth.uid() = user_id);


-- FEEDBACK TABLE
CREATE POLICY "Authenticated users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (email = auth.email());

-- Done! No more recursion ✅
```

---

## Step 5: Test Your App

After running the fix script:

1. **Login as user** → Should work ✅
2. **Login as admin** → Should work ✅
3. **Create incident** → Should work ✅
4. **View incidents** → Should work ✅
5. **Admin resolve incident** → Should work ✅ (via Flask backend)

---

## Why This Works

### Before (Recursion):
```
Policy on users table
  ↓
Checks users table for role
  ↓
Triggers policy on users table
  ↓
Checks users table for role
  ↓
INFINITE LOOP ❌
```

### After (No Recursion):
```
Policy on users table
  ↓
Checks auth.uid() (from JWT, not database)
  ↓
No database lookup needed
  ↓
WORKS ✅
```

### Admin Operations:
```
Admin action in frontend
  ↓
Flask backend (JWT verified)
  ↓
Supabase with service role key
  ↓
BYPASSES RLS ENTIRELY ✅
```

---

## Important Notes

1. **Your backend still works** - Service role bypasses all RLS
2. **Admin operations work** - They go through Flask backend
3. **RLS only affects direct Supabase calls** - Which you're not making
4. **No admin policies needed** - Backend handles admin logic

---

## Summary

**Problem:** Admin policies caused recursion by checking users table  
**Solution:** Remove admin policies from RLS (backend handles admin logic)  
**Result:** Simple policies, no recursion, everything works ✅

**Run the "Complete Fix Script" above and you're good to go!** 🚀
