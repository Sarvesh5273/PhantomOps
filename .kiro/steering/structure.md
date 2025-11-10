# Project Codebase Structure & Rules
## Root Layout
/backend    → Flask API server  
/frontend   → React application

## Backend Structure (/backend)
app.py                 → Main Flask application entry point (registers blueprints)
auth_utils.py          → CRITICAL AUTH FILE (JWT verification utilities)

/config
│   config.py          → Flask app factory
│   supabase_client.py → Supabase client initialization

/routes
│   incidents_routes.py → Incident CRUD endpoints
│   feedback_routes.py  → Feedback CRUD endpoints

/utils
│   (New utility functions go here)

.env                   → Environment variables (not in git)

## Frontend Structure (/frontend)
index.html             → HTML entry point  
vite.config.js         → Vite configuration  

/src
│   index.jsx          → React entry point  
│   App.jsx            → Main app with routing  

│
├── /components
│     Login.jsx          → Login page  
│     Signup.jsx         → Signup page  
│     AdminDashboard.jsx → Admin role dashboard  
│     UserDashboard.jsx  → User role dashboard  
│     (New UI components go here)
│
└── /utils
      supabaseClient.js  → Supabase client config (for auth)  
      apiClient.js       → CRITICAL API FILE (Axios instance with JWT interceptor)

.env                   → Environment variables (not in git)

## Architectural Rules & Generation Guardrails

These are rules for all new code generation.

### Backend Rules
* **Rule:** All new backend features (e..g, "Enrichment") MUST be in a new blueprint file inside `/routes/`.
* **Rule:** All protected API routes MUST import and use the `verify_jwt_from_request` function from `auth_utils.py` as a decorator or first-line check.
* **Rule:** All database queries MUST use the `supabase` client imported from `config.supabase_client`.

### Frontend Rules
* **Rule:** ALL frontend API calls to our backend MUST use the `apiClient` instance imported from `src/utils/apiClient.js`.
* **Rule:** Do NOT use `fetch()` or a new `axios()` instance. The `apiClient` is required as it automatically handles JWT Bearer token injection.
* **Rule:** All new authenticated pages MUST be wrapped in the `ProtectedRoute` component defined in `App.jsx` to ensure session and role validation.
* **Rule:** All user-facing alerts and notifications SHOULD use `Swal.fire({...})` (from `sweetalert2`) for a consistent UI.

### API Conventions
* **Rule:** All new backend routes MUST be prefixed with `/api/`.
* **Rule:** Generated API error responses MUST follow the `{"error": "message"}` JSON format.
* **Rule:** Do not add new external libraries (npm, pip) without explicit instruction.