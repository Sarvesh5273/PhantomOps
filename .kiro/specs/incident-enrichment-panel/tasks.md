# Implementation Plan: Incident Enrichment Panel

- [x] 1. Set up backend dependencies and environment configuration





  - Install new Python libraries: tweepy, googlemaps, feedparser
  - Add new environment variables to backend/.env: TWITTER_BEARER_TOKEN, GOOGLE_MAPS_API_KEY, RSS_FEED_URL
  - Verify all dependencies load correctly on Flask startup
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Create enrichment routes blueprint with external service integrations




  - [x] 2.1 Create backend/routes/enrichment_routes.py with blueprint registration


    - Define enrichment_bp Blueprint
    - Register blueprint in backend/app.py
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 Implement Twitter/X service integration function


    - Create function to fetch geotagged tweets using tweepy library
    - Filter tweets within 2km radius of incident coordinates
    - Filter tweets from last 24 hours
    - Parse response to extract username, text, timestamp, location
    - Return list of up to 5 TwitterPost objects
    - Handle API errors and rate limiting gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.5_

  - [x] 2.3 Implement Google Maps traffic service integration function


    - Create function to generate Static Maps API URL with traffic styling
    - Center map on incident coordinates with appropriate zoom level
    - Add red marker at incident location
    - Return complete image URL string
    - Handle API key validation errors
    - _Requirements: 3.1, 3.2, 3.3, 6.2, 6.5_

  - [x] 2.4 Implement RSS feed parser integration function


    - Create function to fetch and parse RSS feed using feedparser
    - Extract title, link, published date from feed items
    - Return list of up to 5 NewsItem objects
    - Handle various RSS/Atom feed formats
    - Handle feed unavailability gracefully
    - _Requirements: 4.1, 4.2, 4.5, 6.3, 6.5_

  - [x] 2.5 Implement main enrichment endpoint with parallel execution


    - Create GET route at /api/incidents/<int:incident_id>/enrich
    - Add verify_jwt_from_request decorator for authentication
    - Fetch incident record from Supabase to get latitude/longitude
    - Execute all three external service calls in parallel using ThreadPoolExecutor
    - Aggregate results into single JSON response with twitter_posts, traffic_map_url, news_items
    - Include errors object for partial failure handling
    - Return 404 if incident not found, 200 with partial data if services fail
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 2.5, 3.5, 4.4_

- [x] 3. Create EnrichmentPanel React component




  - [x] 3.1 Create frontend/src/components/EnrichmentPanel.jsx with modal structure

    - Define functional component with incidentId, onClose, incidentData props
    - Implement modal overlay with dark background and centered card
    - Add header with incident ID title and close button
    - Create three-section grid layout for social media, traffic, and news
    - Apply consistent styling with AdminDashboard dark theme
    - _Requirements: 1.1, 1.2, 7.5_


  - [x] 3.2 Implement enrichment data fetching logic
    - Add state for enrichmentData, loading, error
    - Create fetchEnrichmentData function using apiClient.get
    - Call /api/incidents/${incidentId}/enrich endpoint
    - Handle loading state with spinner overlay
    - Handle error state with SweetAlert2 notification
    - Implement 30-second timeout with error message
    - _Requirements: 1.3, 5.1, 7.1, 7.2_


  - [x] 3.3 Implement social media posts section rendering
    - Display "🐦 Social Media Posts" section title
    - Map over twitter_posts array to render tweet cards
    - Display username, timestamp, and text for each tweet
    - Show "No social media posts found" message when array is empty
    - Handle null or error state for twitter section
    - _Requirements: 2.4, 2.5_


  - [x] 3.4 Implement traffic map section rendering
    - Display "🚗 Traffic Conditions" section title
    - Render static map image using traffic_map_url
    - Add alt text and error handling for image load failures
    - Show error message if traffic_map_url is null
    - _Requirements: 3.4, 3.5_


  - [x] 3.5 Implement news feed section rendering
    - Display "📰 Local News" section title
    - Map over news_items array to render news cards
    - Display title, publication date, and link for each item
    - Open links in new tab using target="_blank" and rel="noopener noreferrer"
    - Show "No news items found" message when array is empty
    - Handle null or error state for news section
    - _Requirements: 4.2, 4.3, 4.4_


  - [x] 3.6 Implement modal close and cleanup logic

    - Create handleClose function that calls onClose prop
    - Reset component state on close
    - Add click handler to overlay background for close
    - Add escape key listener for close
    - Disable close button during loading state
    - _Requirements: 1.4_

- [x] 4. Modify AdminDashboard to integrate EnrichmentPanel






  - [x] 4.1 Add state and handlers for enrichment panel

    - Add selectedIncident state (object | null)
    - Add showEnrichmentPanel state (boolean)
    - Create handleIncidentClick function to set selectedIncident and open modal
    - Create handleCloseEnrichment function to clear state and close modal
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Update incident table with click handlers and styling


    - Add onClick handler to each table row that calls handleIncidentClick
    - Add hover effect styling (cursor: pointer, background highlight)
    - Pass full incident object to click handler
    - Ensure click handler doesn't interfere with existing Resolve button
    - _Requirements: 1.1_

  - [x] 4.3 Conditionally render EnrichmentPanel component


    - Import EnrichmentPanel component
    - Render EnrichmentPanel when showEnrichmentPanel is true
    - Pass selectedIncident.id as incidentId prop
    - Pass selectedIncident as incidentData prop
    - Pass handleCloseEnrichment as onClose prop
    - Position component at end of component tree for proper z-index layering
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 5. Test and validate the complete enrichment feature





  - [x] 5.1 Test backend enrichment endpoint with real API credentials

    - Verify Twitter API returns geotagged tweets within 2km radius
    - Verify Google Maps returns valid static map URL
    - Verify RSS feed parser returns news items
    - Test error handling when external services fail
    - Test JWT authentication on enrichment endpoint
    - Test incident not found scenario (404 response)
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.5, 5.2, 5.5_


  - [x] 5.2 Test EnrichmentPanel component rendering and interactions

    - Verify modal opens when incident row clicked in AdminDashboard
    - Verify loading state displays during API call
    - Verify all three data sections render with real data
    - Verify close button and overlay click close the modal
    - Verify error notification appears on API failure
    - Verify news links open in new tab
    - Test responsive layout on mobile and desktop viewports
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.4, 3.4, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4, 7.5_


  - [x] 5.3 Test error handling and partial data scenarios


    - Test enrichment with one external service failing
    - Test enrichment with all external services failing
    - Verify partial data renders correctly in EnrichmentPanel
    - Verify error messages display appropriately
    - Test network timeout scenarios
    - _Requirements: 1.5, 2.5, 3.5, 4.4, 5.5_

  - [ ]* 5.4 Test performance and optimization
    - Verify parallel API calls complete within 15 seconds
    - Test caching behavior for repeated enrichment requests
    - Verify rate limiting prevents abuse
    - Test with high-latency external services
    - _Requirements: 5.3, 5.4_

  - [ ]* 5.5 Validate security and authentication
    - Test enrichment endpoint rejects requests without JWT token
    - Test enrichment endpoint rejects expired JWT tokens
    - Verify API keys are not exposed in frontend code
    - Verify RSS feed content is sanitized to prevent XSS
    - Test with invalid latitude/longitude values
    - _Requirements: 5.2, 6.4, 6.5_
