# PhantomOps - Quick Summary

## 🎯 What Does PhantomOps Do?

**In One Sentence:**
PhantomOps is a safety incident reporting platform where users report emergencies and admins validate them using real-time data from social media, weather, and news.

---

## 👥 Two Types of Users

### 1. Regular User (Reporter)
- Reports incidents (fire, medical, accident, etc.)
- Provides location, description, severity
- Views their own reports
- Submits feedback

### 2. Admin (Operations Team)
- Views ALL incidents from all users
- Clicks incident to see enrichment data:
  - 🐦 Social media posts nearby
  - 🌤️ Weather conditions
  - 📰 Local news
- Resolves incidents after validation

---

## 🔄 How It Works

### User Reports Incident
```
1. User logs in
2. Fills form: "Fire at Main St, Severity 5"
3. Submits with location (GPS coordinates)
4. Incident saved to database
```

### Admin Validates Incident
```
1. Admin sees incident in dashboard
2. Clicks on incident row
3. Modal opens with enrichment data:
   - Reddit posts mentioning "fire" near location
   - Current weather (hot, dry = fire risk)
   - News about fires in area
4. Admin decides: Real or False alarm?
5. Admin clicks "Resolve" if handled
```

---

## 🏗️ Technical Stack

**Frontend:** React + Vite  
**Backend:** Flask (Python)  
**Database:** Supabase (PostgreSQL)  
**Auth:** Supabase Auth + JWT  
**External APIs:** Reddit, OpenWeatherMap, RSS Feeds

---

## 🔐 Security Flow

```
User Login
  ↓
Supabase generates JWT token
  ↓
Frontend stores token
  ↓
Every API call includes token
  ↓
Backend verifies token
  ↓
Backend uses service role key
  ↓
Database (RLS protects direct access)
```

**Key Point:** Backend uses service role key → Bypasses RLS → Full access

---

## 📊 Database Tables

### 1. users
- Stores user profiles
- Fields: id, name, email, role (user/admin)

### 2. incidents
- Stores incident reports
- Fields: id, user_id, name, type, description, lat, long, severity, status

### 3. feedback
- Stores user feedback
- Fields: id, name, email, rating, message

---

## 🎨 Main Components

### Frontend
1. **Login.jsx** - Login form
2. **Signup.jsx** - Registration form
3. **UserDashboard.jsx** - User's main page (report incidents)
4. **AdminDashboard.jsx** - Admin's main page (view all incidents)
5. **EnrichmentPanel.jsx** - Modal showing enrichment data

### Backend
1. **incidents_routes.py** - CRUD for incidents
2. **feedback_routes.py** - CRUD for feedback
3. **enrichment_routes.py** - Fetch external data
4. **auth_utils.py** - JWT verification

---

## 🌐 Enrichment Feature (Hackathon "Frankenstein")

**What It Does:**
When admin clicks an incident, the system fetches data from 3 sources:

1. **Reddit API** (Social Media)
   - Searches for posts near incident location
   - Returns recent posts mentioning keywords

2. **OpenWeatherMap API** (Weather)
   - Gets current weather at location
   - Helps validate (e.g., fire more likely in hot, dry weather)

3. **RSS News Feed** (Local News)
   - Parses news feed for recent articles
   - Shows if incident is already in news

**Why "Frankenstein"?**
- Stitches together multiple data sources
- Combines live APIs + "dead" tech (RSS)
- Creates intelligent validation system

---

## 🔑 Key Design Decisions

### Why Flask Backend?
- Centralized business logic
- Hides API keys from frontend
- Can call multiple external APIs
- Better error handling

### Why Service Role Key?
- Backend is trusted
- Bypasses RLS for full access
- Simpler backend code
- Better performance

### Why RLS if Backend Bypasses It?
- Defense in depth (extra security)
- Protects against direct database access
- Best practice
- Future-proof

---

## 📈 Typical User Journey

### New User Signs Up
```
1. Visit website → Login page
2. Click "Sign Up"
3. Enter name, email, password
4. Receive verification email
5. Click link in email
6. Email verified → Can now login
7. Login → Redirected to UserDashboard
```

### User Reports Incident
```
1. Click "Report New Incident"
2. Fill form:
   - Name: "John Doe"
   - Type: "Fire"
   - Description: "Building on fire"
   - Location: (GPS coordinates)
   - Severity: 5
3. Submit
4. Incident appears in list
```

### Admin Handles Incident
```
1. Login as admin → AdminDashboard
2. See table of all incidents
3. Filter by type/severity/status
4. Click incident row
5. EnrichmentPanel opens
6. Review enrichment data:
   - Social media posts
   - Weather conditions
   - Local news
7. Decide if real or false alarm
8. Click "Resolve" if handled
9. Incident marked as resolved
```

---

## 🎯 The Value Proposition

**For Users:**
- Easy way to report safety incidents
- Track status of their reports
- Know their report is being handled

**For Admins:**
- Centralized incident management
- Real-time validation data
- Faster decision-making
- Reduce false alarms

**For Organization:**
- Better situational awareness
- Data-driven decisions
- Improved response times
- Audit trail of all incidents

---

## 🚀 What Makes It Special?

1. **Multi-source Validation**
   - Not just user reports
   - Cross-references with social media, weather, news
   - Reduces false positives

2. **Role-Based Access**
   - Users see their own data
   - Admins see everything
   - Proper security boundaries

3. **Real-time Enrichment**
   - Fetches data on-demand
   - Parallel API calls (fast)
   - Graceful error handling

4. **Production-Ready**
   - JWT authentication
   - RLS security
   - Error handling
   - Responsive design

---

## 📝 Quick Reference

**Frontend URL:** http://localhost:5173  
**Backend URL:** http://localhost:5000  
**Database:** Supabase PostgreSQL  

**Test Accounts:**
- User: user@test.com
- Admin: admin@test.com

**Main Features:**
- ✅ User signup/login
- ✅ Incident reporting
- ✅ Admin dashboard
- ✅ Incident enrichment
- ✅ Feedback system
- ✅ Role-based access

---

## 🎉 Summary

PhantomOps is a **complete, production-ready safety incident management platform** with:
- Secure authentication
- Role-based access control
- Real-time data enrichment
- Clean, responsive UI
- Robust error handling

**Perfect for the Kiroween Hackathon "Frankenstein" category!** 🎃

---

**For detailed explanation, see:** `PHANTOMOPS_COMPLETE_LOGIC.md`
