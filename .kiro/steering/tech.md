# 🧭 Technology Stack & Rules

## 1. Frontend Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Auth**: Supabase JS Client 2.80.0
- **UI Alerts**: SweetAlert2 11.26.3

## 2. Backend Stack
- **Framework**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (PyJWT) with Supabase tokens (HS256)
- **CORS**: Flask-CORS
- **Environment**: python-dotenv

## 3. Authentication Pattern
- Supabase handles user authentication and session management.
- JWT tokens are stored in `sessionStorage` (frontend).
- Backend verifies Supabase JWT tokens using the `SUPABASE_JWT_SECRET`.
- Tokens are attached to API requests via `Authorization: Bearer <token>`.
- Role-based access control is managed via custom claims in the JWT.

---

## 4. ⚙️ Technical Guardrails (Rules)
* **Rule:** All generated code must be compatible with the versions listed above.
* **Rule:** Do **NOT** add any new libraries or dependencies (npm, pip) to the project *unless* it is explicitly for the "Frankenstein" feature's external APIs. We must keep the core stack lean.
* **Rule:** All Python code must be standard Flask and use the existing libraries. Do not introduce new frameworks.
* **Rule:** All React code must use functional components with Hooks. Do not use class components.

## 5. 🧟 Hackathon Feature Context (External APIs)
* **Context:** Our "Frankenstein" feature requires integrating new, external APIs.
* **Action:** We will need to add new Python libraries to the backend for this. Kiro should recommend and use standard libraries for:
    * **Twitter/X:** e.g., `tweepy` or `requests-oauthlib`
    * **Google Maps:** e.g., `googlemaps`
    * **RSS Feeds:** e.g., `feedparser`
* **Action:** This will also require adding new API keys to the `.env` files for both frontend (Google Maps JS key) and backend (Twitter/Google private keys).

---

## 6. 📚 Reference: Common Commands

#### Frontend (from `frontend/` directory)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
Backend (from backend/ directory)
Bash

python -m venv venv           # Create virtual environment
venv\Scripts\activate         # Activate venv (Windows)
pip install -r requirements.txt # Install dependencies
python app.py                 # Start Flask server (http://localhost:5000)
7. 📚 Reference: Environment Variables
Frontend (/frontend/.env): VITE_SUPABASE_URL, VITE_SUPABASE_KEY

Backend (/backend/.env): SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET


---

### Mentor's Analysis (Why this is better):

1.  **Prioritization:** I've re-numbered the sections to put the **Rules (Guardrails)** and **Hackathon Context** *before* the reference material (commands, env vars). Kiro needs to process the rules first.
2.  **Explicit Rules:** Section 4 ("Technical Guardrails") adds hard rules that prevent Kiro from making mistakes, like adding random libraries or using outdated React patterns.
3.  **Hackathon Context:** Section 5 ("Hackathon Feature Context") is crucial. It connects this file to `product.md`. It explicitly tells Kiro *why* we will be adding new libraries, so it doesn't get blocked by the rule in Section 4. It pre-authorizes the *exact* changes we need for our winning feature.

All three steering documents (`product.md`, `tech.md`, `structure.md`) are now complete, reconciled, and aligned with our strategy.

**Step 3 is officially done.**

Confirm, and we will proceed to **Step 4: Create the Spec.**