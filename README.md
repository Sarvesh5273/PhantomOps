# 🎃 PhantomOps

[![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro%20AI-blueviolet?style=for-the-badge&logo=robot)](https://kiro.ai)
[![Kiroween 2025](https://img.shields.io/badge/Kiroween-2025-orange?style=for-the-badge&logo=halloween)](https://kiro.ai/kiroween)
[![Category](https://img.shields.io/badge/Category-Frankenstein-green?style=for-the-badge)](https://kiro.ai/kiroween)

**A full-stack public safety incident reporting and management platform.**

Built for the **Kiroween Hackathon** - "Frankenstein" Category

**🤖 Built entirely with Kiro AI** - Showcasing AI-assisted development from concept to deployment

> **See [KIRO_SHOWCASE.md](KIRO_SHOWCASE.md) for a detailed look at how Kiro built this project!**

---

## 🤖 Built with Kiro

This entire project was developed using **Kiro AI**, demonstrating the power of AI-assisted development:

### How Kiro Was Used

**1. Spec-Driven Development**
- Created detailed requirements, design, and implementation plans using Kiro's spec workflow
- See `.kiro/specs/` for complete feature specifications:
  - `incident-enrichment-panel/` - The "Frankenstein" feature
  - `escape-routes-integration/` - Safety resources finder

**2. Full-Stack Implementation**
- **Backend:** Flask API with JWT authentication, Supabase integration, external API orchestration
- **Frontend:** React components with routing, state management, and responsive design
- **Database:** Supabase setup with Row Level Security (RLS) policies

**3. External API Integration**
- Integrated 4 external APIs (Reddit, OpenWeatherMap, OpenStreetMap, RSS)
- Implemented parallel API calls with error handling
- Created enrichment panel that combines disparate data sources

**4. Security & Best Practices**
- JWT authentication implementation
- Environment variable management
- CORS configuration
- Security headers
- Input validation

**5. Testing & Debugging**
- Comprehensive testing of all features
- Error handling for GPS, network, and API failures
- Responsive design testing

### Development Stats
- **Time:** ~2 days with Kiro
- **Lines of Code:** ~3,000+ (backend + frontend)
- **Features:** 2 major features (Enrichment Panel + Escape Routes)
- **APIs Integrated:** 4 external services
- **Components:** 10+ React components

### Why This Showcases Kiro
1. **Speed** - Full-stack app in 2 days
2. **Quality** - Production-ready code with proper architecture
3. **Complexity** - Multi-API integration, authentication, real-time data
4. **Best Practices** - Security, error handling, responsive design
5. **Documentation** - Complete specs and implementation plans

---

## 🚀 Features

### Core Features
- **Secure Authentication** - User signup, login, and email verification via Supabase
- **Role-Based Access Control** - Separate dashboards for Users and Admins
- **Incident Reporting** - Users can report safety incidents with geolocation
- **Admin Management** - Admins can view, filter, and resolve all incidents
- **Feedback System** - Users can submit app feedback and ratings

### Hackathon Features ("Frankenstein")
- **Incident Enrichment Panel** - Stitches together data from multiple sources:
  - Reddit API (social media posts about emergencies)
  - OpenWeatherMap API (live weather at incident location)
  - RSS Feeds (news from BBC World News)
- **Escape Routes** - Find nearby hospitals, police stations, and fire stations using OpenStreetMap

---

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- Vite 7.2.2
- React Router DOM 7.9.5
- Axios 1.13.2
- Supabase JS Client 2.80.0
- SweetAlert2 11.26.3

### Backend
- Flask (Python)
- Supabase (PostgreSQL)
- JWT Authentication (PyJWT)
- Flask-CORS
- External APIs: Reddit (praw), OpenWeatherMap, RSS (feedparser)

---

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Supabase account

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret

# External API Keys (for enrichment feature)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT="PhantomOps v0.1"
OPENWEATHERMAP_API_KEY=your_openweathermap_key
RSS_FEED_URL="https://feeds.bbci.co.uk/news/world/rss.xml"
```

---

## 🚀 Running the Application

### Start Backend
```bash
cd backend
venv\Scripts\activate
python app.py
```
Backend runs on: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📁 Project Structure

```
PhantomOps/
├── backend/
│   ├── config/          # Flask app factory, Supabase client
│   ├── routes/          # API blueprints (incidents, feedback, enrichment, escape routes)
│   ├── auth_utils.py    # JWT verification
│   ├── app.py           # Main Flask application
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (Login, Signup, Dashboards)
│   │   ├── styles/      # CSS files
│   │   └── utils/       # API client, Supabase client
│   ├── index.html
│   └── package.json
│
└── .kiro/
    └── specs/           # Feature specifications and tasks
```

---

## 🔐 Security

- All API routes are protected with JWT authentication
- Supabase Row Level Security (RLS) enabled
- Environment variables for sensitive data
- CORS configured for frontend origin only
- Security headers applied to all responses

---

## 🎯 API Endpoints

### Authentication
- Uses Supabase Auth (handled by frontend)

### Incidents
- `GET /api/incidents` - Get all incidents (admin) or user's incidents
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident status (admin only)

### Feedback
- `POST /api/feedback` - Submit feedback

### Enrichment (Admin Only)
- `GET /api/incidents/:id/enrich` - Get enrichment data for incident

### Escape Routes
- `GET /api/escape-routes?latitude=X&longitude=Y` - Find nearby safety resources

---

## 🎃 Hackathon "Frankenstein" Feature

The **Incident Enrichment Panel** combines:
1. **Live APIs** - Reddit, OpenWeatherMap
2. **"Dead" Tech** - RSS feeds (1999 technology)
3. **Our App** - PhantomOps incident data

This creates a "Frankenstein" by stitching together disparate data sources to validate incidents and provide context for admins.

---

## 👥 User Roles

### User
- Report incidents
- View own incidents
- Submit feedback
- Find escape routes

### Admin
- View all incidents
- Resolve incidents
- Access enrichment panel
- View all feedback

---

## 🌐 External APIs Used

- **OpenStreetMap Overpass API** - Free, no key required (escape routes)
- **Reddit API** - Social media posts (requires credentials)
- **OpenWeatherMap API** - Weather data (requires API key)
- **RSS Feeds** - News items (no key required)

---

## 📝 License

This project was created for the Kiroween Hackathon.

---

## 🏆 Hackathon Category

**Frankenstein** - Combining live APIs, dead technologies, and our application to create something new and useful.

---

## 🎯 Kiroween Hackathon Submission

### Project Highlights

**Category:** Frankenstein  
**Built With:** Kiro AI  
**Development Time:** ~2 days  
**Team Size:** 1 developer + Kiro AI

### What Makes This "Frankenstein"?

Our **Incident Enrichment Panel** stitches together:
1. **Modern Live APIs**
   - Reddit API (2005) - Social media posts
   - OpenWeatherMap API (2012) - Real-time weather
   
2. **"Dead" Technology**
   - RSS Feeds (1999) - Classic web syndication
   
3. **Our Application**
   - PhantomOps incident database
   - Real-time geolocation
   - Admin validation workflow

Like Dr. Frankenstein's creation, we've taken parts from different eras and sources to create something new and alive - an intelligent incident validation system.

### Kiro's Role

This project demonstrates Kiro's capabilities:
- ✅ **Spec-driven development** - Requirements → Design → Implementation
- ✅ **Full-stack code generation** - Backend + Frontend + Database
- ✅ **Complex integrations** - Multiple external APIs working in harmony
- ✅ **Production-ready code** - Security, error handling, best practices
- ✅ **Rapid iteration** - From concept to working app in 2 days

### Project Files Showing Kiro Usage

```
.kiro/specs/
├── incident-enrichment-panel/
│   ├── requirements.md    # EARS-compliant requirements
│   ├── design.md          # Architecture and technical design
│   └── tasks.md           # Step-by-step implementation plan
│
└── escape-routes-integration/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

Each spec shows:
- User stories and acceptance criteria
- Technical architecture decisions
- Implementation tasks with requirement traceability
- Testing strategies

---

## 🤝 Contributing

This is a Kiroween Hackathon project showcasing AI-assisted development with Kiro.

**Want to see how it was built?** Check out the `.kiro/specs/` directory for complete feature specifications and implementation plans.

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get the app running in 5 minutes
- **[KIRO_SHOWCASE.md](KIRO_SHOWCASE.md)** - Detailed look at how Kiro built this project
- **[KIRO_WORKFLOW.md](KIRO_WORKFLOW.md)** - Visual workflow and development process
- **[.kiro/specs/](/.kiro/specs/)** - Complete feature specifications (requirements, design, tasks)
