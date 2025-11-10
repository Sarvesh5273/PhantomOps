# Design Document: Incident Enrichment Panel

## Overview

The Incident Enrichment Panel feature adds real-time validation capabilities to PhantomOps by integrating three external data sources: Twitter/X social media posts, Google Maps traffic data, and local news RSS feeds. When an admin clicks on an incident in the AdminDashboard table, a modal overlay displays enriched context that helps validate the incident's authenticity and assess its real-world impact.

This design follows the existing PhantomOps architecture patterns: React functional components with hooks on the frontend, Flask blueprints with JWT-protected routes on the backend, and the apiClient utility for all API communication.

## Architecture

### High-Level Flow

```
AdminDashboard (click incident row)
    ↓
EnrichmentPanel component (modal opens)
    ↓
apiClient.get('/api/incidents/:id/enrich')
    ↓
enrichment_routes.py (Flask blueprint)
    ↓
Parallel/Sequential External API Calls:
    - Twitter/X API (tweepy)
    - Google Maps Static API (googlemaps library)
    - RSS Feed Parser (feedparser)
    ↓
Aggregated JSON Response
    ↓
EnrichmentPanel displays data sections
```

### Component Interaction

1. **AdminDashboard** maintains incident table state and adds click handlers to rows
2. **EnrichmentPanel** receives `incidentId` prop and manages modal visibility
3. **Backend Enrichment Route** orchestrates external API calls and returns unified response
4. **External Services** provide validation data based on incident geolocation

## Components and Interfaces

### Frontend Components

#### EnrichmentPanel.jsx

**Purpose:** Modal component that displays enriched incident data

**Props:**
- `incidentId` (number, required): The ID of the incident to enrich
- `onClose` (function, required): Callback to close the modal
- `incidentData` (object, required): The full incident record including lat/long

**State:**
- `enrichmentData` (object): Stores the API response with twitter_posts, traffic_map_url, news_items
- `loading` (boolean): Tracks API request status
- `error` (string): Stores error messages

**Key Methods:**
- `fetchEnrichmentData()`: Calls `/api/incidents/${incidentId}/enrich` using apiClient
- `handleClose()`: Invokes onClose callback and resets state

**UI Structure:**
```
Modal Overlay (dark background)
  └─ Modal Container (centered card)
      ├─ Header
      │   ├─ Title: "Enrichment Data for Incident #{incidentId}"
      │   └─ Close Button (X)
      ├─ Loading State (spinner + text)
      ├─ Error State (SweetAlert2 notification)
      └─ Content Grid (3 sections)
          ├─ Social Media Section
          │   ├─ Section Title: "🐦 Social Media Posts"
          │   └─ Tweet List (5 items max)
          │       └─ Tweet Card: username, timestamp, text
          ├─ Traffic Section
          │   ├─ Section Title: "🚗 Traffic Conditions"
          │   └─ Static Map Image
          └─ News Section
              ├─ Section Title: "📰 Local News"
              └─ News List (5 items max)
                  └─ News Item: title, date, link (opens new tab)
```

**Styling:**
- Follows existing AdminDashboard dark theme (#0f172a background, #1e293b cards)
- Modal overlay: rgba(0,0,0,0.7) with backdrop blur
- Responsive grid layout (3 columns on desktop, stacked on mobile)
- Consistent button styles with existing dashboard

#### AdminDashboard.jsx Modifications

**New State:**
- `selectedIncident` (object | null): Stores the clicked incident for enrichment
- `showEnrichmentPanel` (boolean): Controls modal visibility

**New Methods:**
- `handleIncidentClick(incident)`: Sets selectedIncident and opens modal
- `handleCloseEnrichment()`: Clears selectedIncident and closes modal

**UI Changes:**
- Add `onClick` handler to each table row
- Add hover effect to indicate clickable rows (cursor: pointer, background highlight)
- Conditionally render `<EnrichmentPanel>` component at bottom of component tree

### Backend Components

#### enrichment_routes.py (New Blueprint)

**Route:** `GET /api/incidents/<int:incident_id>/enrich`

**Authentication:** Protected with `verify_jwt_from_request()` decorator

**Request Flow:**
1. Verify JWT token
2. Fetch incident record from Supabase to get latitude/longitude
3. Call external services in parallel (using threading or asyncio)
4. Aggregate results into single response object
5. Return JSON with error handling for partial failures

**Response Schema:**
```json
{
  "incident_id": 123,
  "twitter_posts": [
    {
      "id": "tweet_id",
      "username": "@user",
      "text": "Tweet content...",
      "created_at": "2025-11-09T10:30:00Z",
      "location": "lat,long"
    }
  ],
  "traffic_map_url": "https://maps.googleapis.com/maps/api/staticmap?...",
  "news_items": [
    {
      "title": "News headline",
      "link": "https://news.example.com/article",
      "published": "2025-11-09T08:00:00Z"
    }
  ],
  "errors": {
    "twitter": null,
    "traffic": null,
    "news": "RSS feed unavailable"
  }
}
```

**Error Handling:**
- If incident not found: Return 404 with `{"error": "Incident not found"}`
- If external service fails: Include error in `errors` object, return partial data with 200
- If all services fail: Return 500 with `{"error": "All enrichment services failed"}`

#### External Service Integration

**Twitter/X Integration (tweepy library):**
- Use Twitter API v2 with OAuth 2.0 Bearer Token
- Search endpoint: `/2/tweets/search/recent`
- Query parameters:
  - `query`: `point_radius:[longitude latitude 2km]`
  - `start_time`: 24 hours ago (ISO 8601 format)
  - `max_results`: 5
  - `tweet.fields`: created_at,author_id,geo
  - `expansions`: author_id
- Parse response to extract username, text, timestamp

**Google Maps Integration (googlemaps library):**
- Use Static Maps API
- Request URL format:
  ```
  https://maps.googleapis.com/maps/api/staticmap?
    center={latitude},{longitude}
    &zoom=15
    &size=600x400
    &maptype=roadmap
    &markers=color:red|{latitude},{longitude}
    &style=feature:road|element:geometry|color:0x38414e
    &style=feature:road.arterial|element:labels|visibility:on
    &key={GOOGLE_MAPS_API_KEY}
  ```
- Note: Traffic layer requires JavaScript API, so we'll use styled roadmap with traffic-like colors
- Alternative: Use Distance Matrix API to get travel time as traffic indicator

**RSS Feed Integration (feedparser library):**
- Parse configured RSS feed URL from environment variable
- Extract fields: `title`, `link`, `published` (or `pubDate`)
- Limit to 5 most recent items
- Handle various RSS/Atom formats automatically with feedparser

## Data Models

### Incident Record (Existing)

```python
{
  "id": int,
  "user_id": str (UUID),
  "name": str,
  "type": str,  # fire, medical, harassment, accident, other
  "description": str,
  "latitude": float,
  "longitude": float,
  "severity": int (1-5),
  "status": str,  # active, acknowledged, resolved
  "created_at": str (ISO 8601)
}
```

### Enrichment Response (New)

```python
{
  "incident_id": int,
  "twitter_posts": List[TwitterPost],
  "traffic_map_url": str,
  "news_items": List[NewsItem],
  "errors": Dict[str, Optional[str]]
}
```

### TwitterPost (New)

```python
{
  "id": str,
  "username": str,
  "text": str,
  "created_at": str (ISO 8601),
  "location": Optional[str]  # "lat,long" if available
}
```

### NewsItem (New)

```python
{
  "title": str,
  "link": str,
  "published": str (ISO 8601)
}
```

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Display SweetAlert2 error notification with message from API response
- Keep modal open with error state, allow user to retry or close
- Log error details to console for debugging

**Partial Data:**
- Display available sections even if some services failed
- Show "No data available" message in failed sections
- Display error details in console (not to user)

**Loading States:**
- Show spinner overlay while fetching data
- Disable close button during loading to prevent race conditions
- Timeout after 30 seconds with error message

### Backend Error Handling

**External API Failures:**
- Wrap each external API call in try-except block
- Log error details to Flask console
- Continue execution and return partial data
- Include error message in `errors` object of response

**Authentication Errors:**
- Return 401 with `{"error": "Unauthorized"}` if JWT invalid
- Return 403 with `{"error": "Forbidden"}` if user lacks admin role (future enhancement)

**Database Errors:**
- Return 404 if incident not found in Supabase
- Return 500 for unexpected database errors
- Log full stack trace to Flask console

**Rate Limiting:**
- Implement basic rate limiting for enrichment endpoint (e.g., 10 requests per minute per user)
- Return 429 with `{"error": "Too many requests"}` if exceeded
- Cache enrichment results for 5 minutes to reduce external API calls

## Testing Strategy

### Frontend Testing

**Component Tests (Manual):**
1. Verify modal opens when incident row clicked
2. Verify modal closes when X button clicked
3. Verify loading state displays during API call
4. Verify error notification appears on API failure
5. Verify all three data sections render correctly
6. Verify news links open in new tab
7. Verify responsive layout on mobile/desktop

**Integration Tests:**
1. Test apiClient correctly attaches JWT token
2. Test error handling for 401, 404, 500 responses
3. Test partial data rendering when some services fail

### Backend Testing

**Unit Tests:**
1. Test JWT verification with valid/invalid tokens
2. Test incident lookup with valid/invalid IDs
3. Test Twitter API response parsing
4. Test Google Maps URL generation
5. Test RSS feed parsing with various formats

**Integration Tests:**
1. Test full enrichment endpoint with mocked external APIs
2. Test error handling for each external service failure
3. Test parallel API call execution
4. Test response aggregation logic

**External API Tests:**
1. Test Twitter API with real credentials (development only)
2. Test Google Maps API with real key (development only)
3. Test RSS feed parsing with real feed URL (development only)

### Environment Configuration Testing

**Required Environment Variables:**
- Backend `.env`:
  - `TWITTER_BEARER_TOKEN` (Twitter API v2 Bearer Token)
  - `GOOGLE_MAPS_API_KEY` (Google Maps Static API key)
  - `RSS_FEED_URL` (Local news RSS feed URL)
  - Existing: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`

**Configuration Validation:**
1. Test application startup with missing API keys (should log warnings)
2. Test enrichment endpoint returns appropriate errors when keys missing
3. Document fallback behavior for each missing service

## Implementation Notes

### Performance Considerations

**Parallel API Calls:**
- Use Python `concurrent.futures.ThreadPoolExecutor` for parallel external API calls
- Set timeout of 10 seconds per external service
- Total enrichment request should complete within 15 seconds

**Caching Strategy:**
- Cache enrichment results in memory (Python dict) for 5 minutes
- Cache key: `f"enrichment_{incident_id}"`
- Clear cache when incident is updated or resolved

**Frontend Optimization:**
- Lazy load EnrichmentPanel component (React.lazy + Suspense)
- Debounce rapid clicks on incident rows
- Preload modal styles to prevent flash of unstyled content

### Security Considerations

**API Key Protection:**
- Never expose API keys in frontend code
- Store all keys in backend `.env` file
- Add `.env` to `.gitignore` (already done)

**JWT Validation:**
- Verify JWT on every enrichment request
- Check token expiration
- Future: Add role-based access control (admin-only)

**External API Safety:**
- Validate latitude/longitude ranges before passing to APIs
- Sanitize RSS feed content to prevent XSS
- Implement rate limiting to prevent abuse

### Dependency Management

**New Python Dependencies (requirements.txt):**
```
tweepy==4.14.0
googlemaps==4.10.0
feedparser==6.0.10
```

**Installation Command:**
```bash
pip install tweepy googlemaps feedparser
```

**No New Frontend Dependencies Required** (uses existing React, axios, sweetalert2)

## Design Decisions and Rationales

### Single API Endpoint vs. Multiple Endpoints

**Decision:** Use single `/api/incidents/<id>/enrich` endpoint

**Rationale:**
- Reduces frontend complexity (one API call instead of three)
- Enables backend to optimize parallel execution
- Simplifies error handling and loading states
- Allows for future caching at aggregation layer

### Modal vs. Side Panel

**Decision:** Use modal overlay

**Rationale:**
- Focuses admin attention on enrichment data
- Prevents accidental clicks on dashboard while reviewing
- Easier to implement responsive design
- Consistent with existing SweetAlert2 modal patterns

### Parallel vs. Sequential External API Calls

**Decision:** Parallel execution with ThreadPoolExecutor

**Rationale:**
- Reduces total response time from ~30s to ~10s
- Each service is independent (no data dependencies)
- Graceful degradation if one service is slow
- Python GIL not an issue for I/O-bound operations

### Static Map vs. Interactive Map

**Decision:** Use Google Maps Static API

**Rationale:**
- Simpler implementation (just an image URL)
- No need for Google Maps JavaScript SDK
- Faster loading (no client-side map rendering)
- Sufficient for quick traffic assessment
- Reduces frontend bundle size

### Twitter API v2 vs. v1.1

**Decision:** Use Twitter API v2

**Rationale:**
- v1.1 is deprecated
- v2 has better geolocation search capabilities
- OAuth 2.0 Bearer Token is simpler than v1.1 OAuth 1.0a
- Better rate limits for search endpoint

### RSS Feed Configuration

**Decision:** Single RSS feed URL in environment variable

**Rationale:**
- Simplifies initial implementation
- Can be extended to multiple feeds in future
- Allows easy configuration per deployment environment
- Avoids hardcoding news sources in code
