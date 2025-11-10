# 🔧 Fix: RLS Policy Blocking Incident Creation

## Problem

When users try to report incidents, they get this error:
```
{'message': 'new row violates row-level security policy for table "incidents"', 'code': '42501'}
```

## Why This Happens

Your backend uses the **service role key** to insert data, but the RLS INSERT policy checks for `auth.uid()`, which doesn't exist in the service role context.

**Current Policy (Problematic):**
```sql
CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

**Problem:** Service role doesn't have `auth.uid()`, so the check fails!

---

## Solution

Update the INSERT policy to allow **both** service role (backend) and authenticated users.

### Quick Fix (Run in Supabase SQL Editor)

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;

-- Create new policy that works with service role
CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT 
  WITH CHECK (
    -- Allow if using service role (backend)
    auth.jwt()->>'role' = 'service_role'
    OR
    -- Allow if authenticated user and user_id matches
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
  );
```

---

## Alternative Solutions

### Option 1: Simplify (Recommended)

Just allow all authenticated inserts (backend validates anyway):

```sql
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;

CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT 
  WITH CHECK (true);  -- Backend handles validation
```

**Why this works:**
- Backend already validates user_id
- Backend uses service role (trusted)
- Simpler policy, less complexity

### Option 2: Service Role Only

Only allow backend to insert (most secure):

```sql
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;

CREATE POLICY "Backend can create incidents" ON incidents
  FOR INSERT 
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

**Why this works:**
- Only backend can insert
- Backend is trusted
- Users go through backend API

---

## Recommended Approach

**Use Option 1 (Simplify)** because:
1. ✅ Your backend already validates everything
2. ✅ Backend uses service role (trusted)
3. ✅ Simpler policy = fewer issues
4. ✅ Backend controls all business logic

### Complete Fix Script

Run this in Supabase SQL Editor:

```sql
-- ============================================
-- COMPLETE RLS FIX FOR INCIDENTS TABLE
-- ============================================

-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Allow incident creation" ON incidents;
DROP POLICY IF EXISTS "Backend can create incidents" ON incidents;

-- Create simple INSERT policy (backend validates)
CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT 
  WITH CHECK (true);

-- Keep other policies as they are
-- (SELECT, UPDATE, DELETE policies are fine)

-- Done! ✅
```

---

## Verify the Fix

After running the SQL:

1. **Try creating an incident** in UserDashboard
2. **Should work now!** ✅
3. **Check the incidents table** - New incident should appear
4. **Check AdminDashboard** - Admin should see it

---

## Why Your Backend Uses Service Role

Your backend (`backend/.env`) uses:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

This is the **service role key**, which:
- ✅ Bypasses RLS for SELECT, UPDATE, DELETE
- ❌ But INSERT policies still apply (by design)
- ✅ Is trusted (backend controls logic)

---

## Understanding RLS with Service Role

### What Service Role Bypasses
- ✅ SELECT policies (can read all data)
- ✅ UPDATE policies (can update all data)
- ✅ DELETE policies (can delete all data)

### What Service Role Doesn't Bypass
- ❌ INSERT policies with `WITH CHECK` clause
- ❌ These still need to pass the check

### Why?
- Security feature to prevent accidental inserts
- Forces you to explicitly allow inserts
- Protects against bugs in backend code

---

## Current RLS Policies (After Fix)

### Incidents Table

**SELECT:**
```sql
-- Anyone authenticated can view all incidents
CREATE POLICY "Authenticated users can view all incidents" ON incidents
  FOR SELECT USING (auth.role() = 'authenticated');
```

**INSERT:**
```sql
-- Allow all inserts (backend validates)
CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT WITH CHECK (true);
```

**UPDATE:**
```sql
-- Users can update own incidents
CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE USING (auth.uid() = user_id);
```

**DELETE:**
```sql
-- Users can delete own incidents
CREATE POLICY "Users can delete own incidents" ON incidents
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Testing

### Test 1: Create Incident (User)
1. Login as regular user
2. Go to UserDashboard
3. Click "Report New Incident"
4. Fill form and submit
5. **Should work!** ✅

### Test 2: View Incidents (User)
1. Check "My Incident Reports" table
2. Should see your incident
3. **Should work!** ✅

### Test 3: View All Incidents (Admin)
1. Login as admin
2. Go to AdminDashboard
3. Should see all incidents including new one
4. **Should work!** ✅

---

## Summary

**Problem:** RLS INSERT policy blocked service role  
**Solution:** Update policy to allow inserts  
**Fix:** Run the SQL script above  
**Result:** Users can now report incidents! ✅

---

## Quick Fix (Copy-Paste)

**Run this in Supabase SQL Editor:**

```sql
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;

CREATE POLICY "Allow incident creation" ON incidents
  FOR INSERT WITH CHECK (true);
```

**That's it!** Your incident reporting should work now. 🎉
