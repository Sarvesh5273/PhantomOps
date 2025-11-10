# PhantomOps - Complete Application Logic Explained

## 🎯 What is PhantomOps?

**PhantomOps** is a **public safety incident reporting and management platform** that allows:
- **Users** to report safety incidents (fires, medical emergencies, accidents, etc.)
- **Admins** to manage, validate, and resolve reported incidents
- **Enrichment** of incidents with real-time data from external sources (social media, traffic, news)

Think of it as: **"Waze for Safety Incidents" + "Admin Dashboard" + "AI-powered Validation"**

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Citizens/Staff)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                         │
│              http://localhost:5173                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login/     │  │    User      │  │    Admin     │     │
│  │   Signup     │  │  Dashboard   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Authentication: Supabase Auth (Direct)                     │
│  Data Operations: Flask Backend (API Calls)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP + JWT Token
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Flask + Python)                        │
│              http://localhost:5000                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Incidents   │  │   Feedback   │  │  Enrichment  │     │
│  │   Routes     │  │    Routes    │  │    Routes    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  JWT Verification: auth_utils.py                            │
│  Database Access: Service Role Key (Bypasses RLS)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Service Role Key
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    users     │  │  incidents   │  │   feedback   │     │
│  │  (profiles)  │  │  (reports)   │  │  (ratings)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  RLS Enabled: Protects direct access                        │
│  Service Role: Bypasses RLS (backend uses this)             │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Reddit     │  │    Weather   │  │   RSS News   │     │
│  │     API      │  │     API      │  │    Feeds     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Used for: Incident Enrichment (Validation)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

### 1. **Regular User (Citizen/Staff)**
**Can:**
- ✅ Sign up and login
- ✅ Report new incidents (with location, type, severity, description)
- ✅ View their own incidents
- ✅ Update their own incidents
- ✅ Submit feedback about the app

**Cannot:**
- ❌ View other users' personal data
- ❌ Resolve incidents
- ❌ Access admin dashboard
- ❌ View all feedback

### 2. **Admin (Operations/Security Team)**
**Can:**
- ✅ Everything a regular user can do, PLUS:
- ✅ View ALL incidents from all users
- ✅ Filter incidents by type, severity, status
- ✅ Click on incidents to see enrichment data
- ✅ Resolve incidents (mark as handled)
- ✅ View all feedback from users

**Cannot:**
- ❌ Delete users (not implemented)
- ❌ Modify other users' profiles

---

## 🔐 Authentication Flow (Step-by-Step)

### Signup Process

```
1. User fills signup form (name, email, password)
   ↓
2. Frontend calls: supabase.auth.signUp()
   ↓
3. Supabase creates auth user (but NOT verified yet)
   ↓
4. Supabase sends verification email
   ↓
5. User clicks link in email
   ↓
6. Supabase marks email as verified
   ↓
7. User redirected to /auth/callback
   ↓
8. Callback creates user record in 'users' table
   ↓
9. User can now login
```

**Key Point:** User cannot login until email is verified!

### Login Process

```
1. User enters email + password
   ↓
2. Frontend calls: supabase.auth.signInWithPassword()
   ↓
3. Supabase validates credentials
   ↓
4. Supabase checks if email is verified
   ↓
5. If verified: Supabase generates JWT token
   ↓
6. Frontend stores JWT in sessionStorage
   ↓
7. Frontend fetches user role from 'users' table
   ↓
8. Frontend redirects based on role:
   - Admin → /admin (AdminDashboard)
   - User → /user (UserDashboard)
```

**Key Point:** JWT token is used for ALL subsequent API calls!

### JWT Token Structure

```json
{
  "sub": "user-uuid-here",           // User ID
  "email": "user@example.com",       // User email
  "role": "authenticated",           // Supabase role
  "iat": 1234567890,                 // Issued at
  "exp": 1234571490                  // Expires at
}
```

**Note:** The user's app role (admin/user) is stored in the database, not in JWT!

---

## 📊 Database Schema

### Table 1: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,              -- Matches Supabase auth.users.id
  name TEXT,                        -- User's full name
  email TEXT UNIQUE,                -- User's email
  role TEXT DEFAULT 'user',         -- 'user' or 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Store user profiles and roles

**RLS Policy:**
- Users can view/update their own profile
- Users can insert their own record (during signup)

### Table 2: `incidents`

```sql
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,            -- Auto-incrementing ID
  user_id UUID REFERENCES users(id), -- Who reported it
  name TEXT NOT NULL,               -- Reporter's name
  type TEXT NOT NULL,               -- 'fire', 'medical', 'accident', etc.
  description TEXT NOT NULL,        -- What happened
  latitude DECIMAL,                 -- Location (lat)
  longitude DECIMAL,                -- Location (long)
  severity INTEGER DEFAULT 3,       -- 1-5 scale
  status TEXT DEFAULT 'active',     -- 'active', 'acknowledged', 'resolved'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Store incident reports

**RLS Policy:**
- Authenticated users can view all incidents
- Users can create incidents (with their user_id)
- Users can update/delete their own incidents

### Table 3: `feedback`

```sql
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,            -- Auto-incrementing ID
  name TEXT NOT NULL,               -- Feedback submitter name
  email TEXT NOT NULL,              -- Feedback submitter email
  rating INTEGER NOT NULL,          -- 1-5 stars
  message TEXT NOT NULL,            -- Feedback message
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Store user feedback about the app

**RLS Policy:**
- Authenticated users can create feedback
- Users can view their own feedback (by email)

---

## 🔄 Core Workflows

### Workflow 1: User Reports an Incident

```
1. User logs in → Redirected to UserDashboard
   ↓
2. User clicks "Report New Incident" button
   ↓
3. User fills form:
   - Name
   - Type (fire, medical, harassment, accident, other)
   - Description
   - Location (latitude, longitude)
   - Severity (1-5)
   ↓
4. User clicks "Submit"
   ↓
5. Frontend calls: apiClient.post('/api/incidents', data)
   ↓
6. apiClient automatically adds JWT token to request
   ↓
7. Flask backend receives request
   ↓
8. Flask verifies JWT token (auth_utils.py)
   ↓
9. Flask inserts incident into database (service role)
   ↓
10. Flask returns success response
   ↓
11. Frontend shows success message (SweetAlert2)
   ↓
12. Incident appears in user's incident list
```

**Key Point:** User's ID is automatically attached to the incident!

### Workflow 2: Admin Views and Resolves Incident

```
1. Admin logs in → Redirected to AdminDashboard
   ↓
2. Admin sees table of ALL incidents
   ↓
3. Admin can filter by:
   - Type (fire, medical, etc.)
   - Severity (1-5)
   - Status (active, acknowledged, resolved)
   ↓
4. Admin clicks on incident row
   ↓
5. EnrichmentPanel modal opens
   ↓
6. Frontend calls: apiClient.get('/api/incidents/{id}/enrich')
   ↓
7. Flask backend fetches incident location
   ↓
8. Flask calls 3 external APIs in parallel:
   - Reddit API (social media posts near location)
   - OpenWeatherMap API (weather conditions)
   - RSS Feed (local news)
   ↓
9. Flask returns enrichment data
   ↓
10. Frontend displays 3 sections:
    - 🐦 Social Media Posts
    - 🌤️ Weather Conditions
    - 📰 Local News
   ↓
11. Admin reviews enrichment data
   ↓
12. Admin closes modal
   ↓
13. Admin clicks "Resolve" button
   ↓
14. Frontend calls: apiClient.patch('/api/incidents/{id}/resolve')
   ↓
15. Flask updates incident status to 'resolved'
   ↓
16. Incident row turns green in table
```

**Key Point:** Enrichment helps admin validate if incident is real!

### Workflow 3: User Submits Feedback

```
1. User navigates to /feedback
   ↓
2. User fills feedback form:
   - Name
   - Email
   - Rating (1-5 stars)
   - Message
   ↓
3. User clicks "Submit"
   ↓
4. Frontend calls: apiClient.post('/api/feedback', data)
   ↓
5. Flask verifies JWT token
   ↓
6. Flask inserts feedback into database
   ↓
7. Frontend shows success message
   ↓
8. Admin can view feedback in AdminDashboard
```

---

## 🔒 Security Architecture

### Layer 1: Frontend Validation
```
- Form validation (required fields, email format, etc.)
- Client-side checks (user must be logged in)
- UI-level access control (hide admin features from users)
```

### Layer 2: JWT Authentication
```
- Every API request includes JWT token
- Token is verified by Flask backend
- Token contains user ID and email
- Token expires after set time
```

### Layer 3: Backend Authorization
```
- Flask verifies JWT before processing request
- Flask checks user role from database
- Flask enforces business logic
- Flask sanitizes input data
```

### Layer 4: Database RLS (Row Level Security)
```
- Protects against unauthorized direct database access
- Users can only access their own data
- Service role (backend) bypasses RLS
- Policies enforce data isolation
```

### Layer 5: Environment Variables
```
- API keys stored in .env files
- Never exposed to frontend
- Service role key only in backend
- Anon key only in frontend
```

---

## 🎨 Frontend Components Explained

### 1. **App.jsx** (Main Router)
**Purpose:** Handle routing and authentication state

**Logic:**
```javascript
- Check if user is logged in (session exists)
- Fetch user role from database
- Redirect based on role:
  - No session → Login page
  - User role → UserDashboard
  - Admin role → AdminDashboard
- Protect routes (ProtectedRoute component)
```

### 2. **Login.jsx**
**Purpose:** User login form

**Logic:**
```javascript
- User enters email + password
- Call Supabase auth API
- Check if email is verified
- Fetch user role from database
- Store JWT in sessionStorage
- Redirect to appropriate dashboard
```

### 3. **Signup.jsx**
**Purpose:** User registration form

**Logic:**
```javascript
- User enters name, email, password
- Call Supabase auth API (signUp)
- Store name temporarily (until email verified)
- Show "check your email" message
- Redirect to login page
```

### 4. **UserDashboard.jsx**
**Purpose:** Regular user's main page

**Features:**
- Report new incident (form)
- View own incidents (list)
- Update own incidents
- Navigate to feedback page

### 5. **AdminDashboard.jsx**
**Purpose:** Admin's main page

**Features:**
- View ALL incidents (table)
- Filter incidents (type, severity, status)
- Click incident to see enrichment data
- Resolve incidents
- View feedback

### 6. **EnrichmentPanel.jsx**
**Purpose:** Modal showing enrichment data

**Logic:**
```javascript
- Receives incident ID as prop
- Calls enrichment API endpoint
- Shows loading state
- Displays 3 sections:
  - Social Media Posts (Reddit)
  - Weather Conditions (OpenWeatherMap)
  - Local News (RSS)
- Handles errors gracefully
- Can be closed with X button, overlay click, or Escape key
```

### 7. **FeedbackForm.jsx**
**Purpose:** Collect user feedback

**Features:**
- Name, email, rating, message fields
- Submit feedback to backend
- Show success message

---

## 🔧 Backend Routes Explained

### 1. **Incidents Routes** (`/api/incidents`)

#### POST `/api/incidents` - Create Incident
```python
- Receives: user_id, name, type, description, lat, long, severity
- Validates: Required fields present
- Inserts: New incident into database
- Returns: Success message + incident data
```

#### GET `/api/incidents` - Get All Incidents
```python
- Fetches: All incidents from database
- Orders: By created_at (newest first)
- Returns: Array of incidents
```

#### PATCH `/api/incidents/{id}/resolve` - Resolve Incident
```python
- Receives: Incident ID
- Updates: Status to 'resolved'
- Returns: Success message + updated incident
```

### 2. **Feedback Routes** (`/api/feedback`)

#### POST `/api/feedback` - Submit Feedback
```python
- Receives: name, email, rating, message
- Validates: All fields present
- Inserts: New feedback into database
- Returns: Success message
```

#### GET `/api/feedback` - Get All Feedback
```python
- Fetches: All feedback from database
- Orders: By created_at (newest first)
- Returns: Array of feedback
```

### 3. **Enrichment Routes** (`/api/incidents/{id}/enrich`)

#### GET `/api/incidents/{id}/enrich` - Enrich Incident
```python
- Receives: Incident ID
- Verifies: JWT token
- Fetches: Incident location from database
- Calls 3 external APIs in parallel:
  1. fetch_reddit_posts(lat, long)
  2. fetch_weather_data(lat, long)
  3. fetch_news_items()
- Returns: {
    incident_id,
    reddit_posts: [...],
    weather_data: {...},
    news_items: [...]
  }
```

**Parallel Execution:**
```python
with ThreadPoolExecutor(max_workers=3) as executor:
    reddit_future = executor.submit(fetch_reddit_posts, lat, long)
    weather_future = executor.submit(fetch_weather_data, lat, long)
    news_future = executor.submit(fetch_news_items)
    
    # Wait for all to complete (max 10 seconds each)
    reddit_posts = reddit_future.result(timeout=10)
    weather_data = weather_future.result(timeout=10)
    news_items = news_future.result(timeout=10)
```

---

## 🌐 External API Integration

### 1. **Reddit API**
**Purpose:** Find social media posts near incident location

**Logic:**
```python
- Search Reddit for posts mentioning location
- Filter by time (last 24 hours)
- Return up to 5 posts
- Include: username, text, timestamp
```

### 2. **OpenWeatherMap API**
**Purpose:** Get current weather at incident location

**Logic:**
```python
- Query weather API with lat/long
- Get: temperature, conditions, wind, humidity
- Return weather data object
```

### 3. **RSS News Feed**
**Purpose:** Get recent local news

**Logic:**
```python
- Parse RSS feed (BBC News or local news)
- Extract: title, link, published date
- Return up to 5 news items
```

**Why Enrichment?**
- Helps admin validate if incident is real
- Provides context (weather, social media, news)
- Enables faster decision-making
- Reduces false reports

---

## 🔑 Key Design Decisions

### 1. **Why Flask Backend Instead of Direct Supabase?**
**Reasons:**
- ✅ Centralized business logic
- ✅ Better security (API keys hidden)
- ✅ Easier to add complex operations
- ✅ Can call multiple external APIs
- ✅ Better error handling

### 2. **Why Service Role Key in Backend?**
**Reasons:**
- ✅ Bypasses RLS (backend is trusted)
- ✅ Full database access
- ✅ Simpler backend code
- ✅ Better performance (no policy checks)

### 3. **Why RLS if Backend Bypasses It?**
**Reasons:**
- ✅ Defense in depth (extra security layer)
- ✅ Protects against direct database access
- ✅ Best practice
- ✅ Ready for future direct frontend queries

### 4. **Why JWT Instead of Session Cookies?**
**Reasons:**
- ✅ Stateless (no server-side session storage)
- ✅ Works with Supabase Auth
- ✅ Can be verified independently
- ✅ Includes user info in token

---

## 📈 Data Flow Examples

### Example 1: User Creates Incident

```
User fills form
  ↓
{
  user_id: "abc-123",
  name: "John Doe",
  type: "fire",
  description: "Building on fire at Main St",
  latitude: 40.7128,
  longitude: -74.0060,
  severity: 5
}
  ↓
Frontend: apiClient.post('/api/incidents', data)
  ↓
Interceptor adds: Authorization: Bearer eyJhbGc...
  ↓
Backend: verify_jwt_from_request()
  ↓
Backend: supabase.table('incidents').insert(data)
  ↓
Database: INSERT INTO incidents VALUES (...)
  ↓
Backend: return { message: "Success", data: {...} }
  ↓
Frontend: Swal.fire("Incident reported!")
```

### Example 2: Admin Enriches Incident

```
Admin clicks incident row (ID: 42)
  ↓
Frontend: apiClient.get('/api/incidents/42/enrich')
  ↓
Backend: Fetch incident location
  ↓
{
  latitude: 40.7128,
  longitude: -74.0060
}
  ↓
Backend: Call 3 APIs in parallel
  ↓
Reddit API → 3 posts found
Weather API → 72°F, Sunny
RSS Feed → 2 news items
  ↓
Backend: return {
  incident_id: 42,
  reddit_posts: [...],
  weather_data: {...},
  news_items: [...]
}
  ↓
Frontend: Display in EnrichmentPanel modal
```

---

## 🎯 Summary: The Big Picture

**PhantomOps is a 3-tier application:**

1. **Frontend (React)**
   - User interface
   - Authentication (Supabase Auth)
   - API calls (with JWT)

2. **Backend (Flask)**
   - Business logic
   - JWT verification
   - Database operations
   - External API integration

3. **Database (Supabase)**
   - Data storage
   - RLS for security
   - Auth management

**The Flow:**
```
User → Frontend → Backend → Database
                    ↓
              External APIs
```

**The Security:**
```
Frontend Validation
  ↓
JWT Authentication
  ↓
Backend Authorization
  ↓
Database RLS
```

**The Purpose:**
- Users report safety incidents
- Admins validate and resolve incidents
- Enrichment provides context for validation
- Everyone stays safer!

---

## 🚀 Your Hackathon "Frankenstein" Feature

**The Enrichment Panel is your "Frankenstein" feature because:**

1. **Stitches together multiple data sources:**
   - Reddit (social media)
   - OpenWeatherMap (live weather)
   - RSS feeds (news)

2. **Combines "live" and "dead" tech:**
   - Live APIs (Reddit, Weather)
   - "Dead" tech (RSS feeds)

3. **Creates something new:**
   - Incident validation platform
   - Context-aware decision making
   - Multi-source intelligence

**This is exactly what the Kiroween Hackathon asked for!** 🎃

---

**That's the complete logic of PhantomOps!** 🎉
