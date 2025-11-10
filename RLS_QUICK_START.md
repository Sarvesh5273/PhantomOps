# RLS Quick Start - 5 Minute Setup

## TL;DR

Your app is working great! Enable RLS for extra security without breaking anything.

---

## Quick Decision Guide

### Should I enable RLS now?

**YES, if:**
- ✅ You want best practices
- ✅ You have 5 minutes
- ✅ You want defense in depth
- ✅ You're preparing for production

**NO, if:**
- ⏰ Demo is in 10 minutes
- 🐛 You're debugging other issues
- 🎯 You want to focus on features first

---

## 5-Minute Setup

### Step 1: Open Supabase Dashboard (1 min)

1. Go to https://supabase.com/dashboard
2. Select your project: `hvwqwysccbnlbqsmluji`
3. Click "SQL Editor" in left sidebar

### Step 2: Run This Script (2 min)

Copy and paste this entire script, then click "Run":

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users table policies
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

-- Incidents table policies
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

-- Feedback table policies
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
```

### Step 3: Test Your App (2 min)

1. **Backend:** Should work unchanged (uses service role)
2. **Login:** Should work
3. **Create incident:** Should work
4. **Admin dashboard:** Should work
5. **Resolve incident:** Should work

If everything works → You're done! 🎉

---

## What Just Happened?

### Before RLS:
```
Frontend → Flask → Supabase
                      ↓
                 No protection
```

### After RLS:
```
Frontend → Flask → Supabase (Service Role)
                      ↓
                 Bypasses RLS ✅
                      ↓
                 Works as before

Frontend → Supabase (Direct - Future)
                ↓
           RLS Policies ✅
                ↓
           Protected access
```

**Your backend still works exactly the same!**

---

## Verification Checklist

After running the script, verify:

- [ ] Backend server still starts
- [ ] Can login as user
- [ ] Can login as admin
- [ ] Can create incident
- [ ] Can view incidents
- [ ] Admin can resolve incidents
- [ ] Can submit feedback
- [ ] No console errors

If all checked → Success! ✅

---

## Troubleshooting

### "Policy already exists"
**Solution:** Policies were already created. You're good!

### "Backend queries fail"
**Solution:** Check that `backend/.env` has `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_ANON_KEY`

### "Frontend can't read data"
**Solution:** This shouldn't happen since your frontend goes through Flask. If it does, check the policies.

---

## What You Get

✅ **Extra security layer**  
✅ **Best practice implementation**  
✅ **Ready for direct frontend queries**  
✅ **Production-ready database**  
✅ **No changes to existing code**

---

## Next Steps (Optional)

After enabling RLS, you can:

1. **Make direct Supabase queries from frontend** (if needed)
2. **Add more granular policies** (if needed)
3. **Add audit logging** (future enhancement)
4. **Add rate limiting** (future enhancement)

---

## Summary

**Time:** 5 minutes  
**Risk:** Very low  
**Benefit:** High  
**Recommendation:** Do it now! ✅

Your app will work exactly the same, but with an extra security layer.

---

## Quick Reference

**Your Supabase Project:** `hvwqwysccbnlbqsmluji`  
**Backend Key:** Service Role (bypasses RLS)  
**Frontend Key:** Anon Key (subject to RLS)  

**Tables:**
- `users` - User profiles with roles
- `incidents` - Incident reports
- `feedback` - User feedback

**Policies Created:**
- Users can view/update own data
- Admins can view/update all data
- Authenticated users can create incidents
- Service role bypasses everything

---

**Ready? Copy the SQL script and run it in Supabase SQL Editor!** 🚀
