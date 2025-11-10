# Manual Testing Guide for Incident Enrichment API

## Prerequisites
1. Backend server running: `python app.py` (from backend directory)
2. Valid JWT token from a logged-in user
3. At least one incident in the database

## Step 1: Get a JWT Token

### Option A: Login via Frontend
1. Start the frontend: `npm run dev` (from frontend directory)
2. Login at http://localhost:5173
3. Open browser DevTools > Application > Session Storage
4. Copy the JWT token value

### Option B: Login via Supabase API
```bash
curl -X POST "https://vgvngeemmxlvnipiglox.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndm5nZWVtbXhsdm5pcGlnbG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjAwNzUsImV4cCI6MjA3Nzk5NjA3NX0.qZiCU0Om2b66o-2leJ_J6eLEHeIh2HbhA5NUIRA2bm0" \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

## Step 2: Get Incident List

```bash
curl -X GET "http://localhost:5000/api/incidents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Note the incident ID from the response.

## Step 3: Test Enrichment Endpoint (Valid Request)

```bash
curl -X GET "http://localhost:5000/api/incidents/1/enrich" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "incident_id": 1,
  "twitter_posts": [],
  "traffic_map_url": null,
  "news_items": [],
  "errors": {}
}
```

Note: Empty arrays are expected if API credentials are not configured.

## Step 4: Test Without JWT (Should Fail)

```bash
curl -X GET "http://localhost:5000/api/incidents/1/enrich"
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Missing or invalid JWT token"
}
```

## Step 5: Test Invalid Incident ID (Should Fail)

```bash
curl -X GET "http://localhost:5000/api/incidents/999999/enrich" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Incident not found"
}
```

## Step 6: Configure Real API Credentials (Optional)

To test with real external data, update `backend/.env`:

```env
# Twitter API v2 Bearer Token
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABearerTokenHere

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsKeyHere

# RSS Feed URL (use a real local news feed)
RSS_FEED_URL=https://rss.nytimes.com/services/xml/rss/nyt/US.xml
```

Then restart the backend server and test again.

## Expected Behavior with Real Credentials

### Twitter Posts
- Should return up to 5 geotagged tweets within 2km of incident location
- Each tweet should have: id, username, text, created_at, location

### Traffic Map
- Should return a Google Maps Static API URL
- URL should include incident coordinates and traffic styling

### News Items
- Should return up to 5 news items from RSS feed
- Each item should have: title, link, published date

## Troubleshooting

### "No incidents found"
- Create an incident via the frontend UserDashboard
- Or insert directly into Supabase incidents table

### "JWT token expired"
- Get a fresh token (tokens expire after a certain time)
- Login again via frontend or Supabase API

### "External services returning empty data"
- Check that API credentials are configured in .env
- Check backend console for warning messages
- Verify API keys are valid and have proper permissions

### "Request timeout"
- External APIs may be slow or rate-limited
- Check backend console for specific error messages
- Try again after a few minutes
