# 🔧 Fix: Correct Way to Pass JWT to Supabase Python Client

## The Issue

The Supabase Python client doesn't accept `options` parameter the same way as the JavaScript client.

### What Was Wrong

```python
# ❌ This doesn't work in Python client
create_client(url, key, options={"headers": {...}})
```

**Error:** `'dict' object has no attribute 'headers'`

### What's Fixed

```python
# ✅ Correct way for Python client
client = create_client(url, key)
client.postgrest.auth(jwt_token)  # Set JWT for RLS
```

---

## The Solution

### Updated Function

```python
def get_supabase_with_jwt():
    """Create a Supabase client with the user's JWT token for RLS"""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        jwt_token = auth_header.split(" ")[1]
        
        # Create client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        client = create_client(url, key)
        
        # Set JWT token for RLS context
        client.postgrest.auth(jwt_token)
        
        return client
    return supabase
```

**Key:** `client.postgrest.auth(jwt_token)` sets the JWT for RLS!

---

## How It Works

### Flow

```
1. User sends request with JWT
   ↓
2. Backend extracts JWT from Authorization header
   ↓
3. Backend creates Supabase client
   ↓
4. Backend calls client.postgrest.auth(jwt_token)
   ↓
5. Postgrest client includes JWT in database requests
   ↓
6. Supabase sees authenticated user
   ↓
7. RLS policies work correctly
   ↓
8. Success! ✅
```

---

## What to Do

### 1. Restart Backend

```bash
cd backend
python app.py
```

### 2. Test

- Go to UserDashboard
- Click "Report New Incident"
- Fill and submit
- **Should work now!** ✅

---

## Why This Works

### Postgrest Client

The Supabase Python client uses `postgrest-py` under the hood. The `auth()` method:

```python
client.postgrest.auth(token)
```

**Does:**
- Sets the `Authorization: Bearer <token>` header
- Applies to all subsequent database operations
- Provides user context for RLS
- Allows RLS policies to work correctly

---

## Summary

**Problem:** Wrong syntax for passing JWT to Python client  
**Solution:** Use `client.postgrest.auth(jwt_token)`  
**Result:** RLS now has user context  
**Action:** Restart backend and test  

---

**Restart your backend - it will work now!** 🎉
