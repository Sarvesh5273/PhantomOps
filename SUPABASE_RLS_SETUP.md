# Supabase Row Level Security (RLS) Setup Guide

## Overview

Your PhantomOps application has 3 main tables that need RLS policies:
1. **users** - User profiles with roles
2. **incidents** - Incident reports
3. **feedback** - User feedback submissions

## Current Authentication Flow

✅ **Working:**
- Supabase Auth handles user authentication
- JWT tokens are generated and verified
- Roles are stored in the `users` table
- Backend uses service role key (bypasses RLS)
- Frontend uses anon key (subject to RLS)

## Why Implement RLS?

**Current State:** Your backend uses the `SUPABASE_SERVICE_ROLE_KEY`, which **bypasses RLS entirely**. This is fine for a backend-controlled API.

**However, if you want to:**
1. Make direct Supabase calls from the frontend (without going through Flask)
2. Add an extra layer of security
3. Follow Supabase best practices

**Then you should implement RLS.**

---

## Decision: Do You Need RLS?

### ✅ Keep Current Architecture (Recommended for Hackathon)
**Pros:**
- Already working
- Backend controls all data access
- Simpler to debug
- No RLS complexity

**Cons:**
- All security depends on Flask backend
- Can't make direct Supabase queries from frontend

### 🔄 Add RLS (Better for Production)
**Pros:**
- Defense in depth (multiple security layers)
- Can make direct Supabase queries from frontend
- Follows Supabase best practices
- Better for scaling

**Cons:**
- More complex setup
- Need to test policies carefully
- May need to refactor some code

---

## Recommended Approach: Hybrid (Best of Both Worlds)

1. **Keep backend using service role key** (bypasses RLS)
2. **Enable RLS on tables** (protects direct frontend access)
3. **Add policies for future direct frontend queries**

This way:
- Your current Flask API continues to work unchanged
- You add security for any future direct Supabase calls
- You follow best practices

---

## RLS Implementation

### Step 1: Enable RLS on All Tables

Go to Supabase Dashboard → Table Editor → Select each table → Enable RLS

Or run this SQL:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
```

⚠️ **Important:** Once RLS is enabled, **all queries using the anon key will be blocked** unless you create policies.

---

### Step 2: Create RLS Policies

#### A. Users Table Policies

```sql
-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile (name, etc.)
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Admins can view all users
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 4. Service role can do anything (for backend)
-- This is automatic - service role bypasses RLS

-- 5. New users can insert their own record (during signup)
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);
```

#### B. Incidents Table Policies

```sql
-- ============================================
-- INCIDENTS TABLE POLICIES
-- ============================================

-- 1. Anyone authenticated can view all incidents
CREATE POLICY "Authenticated users can view all incidents"
ON incidents
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2. Users can create incidents
CREATE POLICY "Users can create incidents"
ON incidents
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND auth.role() = 'authenticated'
);

-- 3. Users can update their own incidents
CREATE POLICY "Users can update own incidents"
ON incidents
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Admins can update any incident (for resolving)
CREATE POLICY "Admins can update any incident"
ON incidents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 5. Users can delete their own incidents
CREATE POLICY "Users can delete own incidents"
ON incidents
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Admins can delete any incident
CREATE POLICY "Admins can delete any incident"
ON incidents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### C. Feedback Table Policies

```sql
-- ============================================
-- FEEDBACK TABLE POLICIES
-- ============================================

-- 1. Authenticated users can create feedback
CREATE POLICY "Authenticated users can create feedback"
ON feedback
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 2. Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 3. Users can view their own feedback (optional)
CREATE POLICY "Users can view own feedback"
ON feedback
FOR SELECT
USING (email = auth.email());

-- 4. Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
ON feedback
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

### Step 3: Test Your Policies

After creating policies, test them:

#### Test 1: User Can View Own Profile
```javascript
// In browser console (logged in as user)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', (await supabase.auth.getUser()).data.user.id);

console.log(data); // Should return your profile
```

#### Test 2: User Can Create Incident
```javascript
const { data, error } = await supabase
  .from('incidents')
  .insert({
    user_id: (await supabase.auth.getUser()).data.user.id,
    name: 'Test Incident',
    type: 'other',
    description: 'Testing RLS',
    latitude: 40.7128,
    longitude: -74.0060,
    severity: 3,
    status: 'active'
  });

console.log(data); // Should succeed
```

#### Test 3: User Cannot Update Other's Incident
```javascript
// Try to update incident with different user_id
const { data, error } = await supabase
  .from('incidents')
  .update({ status: 'resolved' })
  .eq('id', 1) // Some incident you don't own
  .eq('user_id', 'different-user-id');

console.log(error); // Should fail with RLS error
```

---

## Migration Strategy

### Option 1: Enable RLS Now (Recommended)

1. **Enable RLS on all tables**
2. **Create all policies** (using SQL above)
3. **Test your Flask backend** - Should work unchanged (uses service role)
4. **Test frontend** - Should work if you're not making direct Supabase calls

### Option 2: Enable RLS Later (After Hackathon)

1. **Keep RLS disabled for now**
2. **Focus on demo and features**
3. **Enable RLS before production deployment**

---

## Important Notes

### 🔑 Service Role vs Anon Key

**Service Role Key (Backend):**
- Bypasses ALL RLS policies
- Full admin access
- Used in `backend/.env`
- Never expose to frontend

**Anon Key (Frontend):**
- Subject to RLS policies
- Limited by policies
- Used in `frontend/.env`
- Safe to expose publicly

### 🧪 Testing RLS

After enabling RLS, test these scenarios:

1. ✅ **Backend API still works** (uses service role)
2. ✅ **Users can login and view their data**
3. ✅ **Users can create incidents**
4. ✅ **Admins can resolve incidents**
5. ✅ **Users cannot access other users' data**

### 🐛 Troubleshooting

**Problem:** "Row level security policy violation"
**Solution:** Check if:
- User is authenticated
- Policy exists for the operation
- Policy conditions are met

**Problem:** Backend queries fail after enabling RLS
**Solution:** Verify backend is using `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_ANON_KEY`

**Problem:** Frontend can't read data
**Solution:** Create appropriate SELECT policies

---

## Quick Setup Script

Run this in Supabase SQL Editor to set up everything:

```sql
-- ============================================
-- PHANTOMOPS RLS SETUP - COMPLETE SCRIPT
-- ============================================

-- Step 1: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Step 2: Users Table Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 3: Incidents Table Policies
CREATE POLICY "Authenticated users can view all incidents" ON incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any incident" ON incidents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can delete own incidents" ON incidents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any incident" ON incidents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Step 4: Feedback Table Policies
CREATE POLICY "Authenticated users can create feedback" ON feedback
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (email = auth.email());

CREATE POLICY "Admins can delete feedback" ON feedback
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Done! 🎉
```

---

## Recommendation for Your Hackathon

### ✅ DO THIS NOW:

1. **Keep your current setup** - It's working!
2. **Enable RLS** - Run the quick setup script above
3. **Test your app** - Everything should still work
4. **You now have defense in depth** - Extra security layer

### ⏰ DO THIS LATER (After Hackathon):

1. Consider making some direct Supabase calls from frontend
2. Add more granular policies if needed
3. Add audit logging
4. Add rate limiting

---

## Summary

**Your Current Setup:**
- ✅ Backend uses service role (bypasses RLS)
- ✅ JWT authentication working
- ✅ Role-based access control in Flask

**After Enabling RLS:**
- ✅ Backend still works (service role bypasses RLS)
- ✅ Extra security layer added
- ✅ Ready for direct frontend queries if needed
- ✅ Following Supabase best practices

**Action Items:**
1. Copy the "Quick Setup Script" above
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the script
4. Test your app - should work unchanged
5. You're done! 🎉

---

**Questions?**
- RLS is enabled but backend uses service role = Backend works unchanged
- RLS protects against unauthorized direct database access
- Policies define who can do what with the data
- Service role bypasses all policies (for trusted backend)
