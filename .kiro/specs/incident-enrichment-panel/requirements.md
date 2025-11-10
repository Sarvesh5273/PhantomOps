# Requirements Document

## Introduction

The Incident Enrichment Panel feature enhances the PhantomOps admin experience by providing real-time, multi-source validation data for reported incidents. When an admin clicks on an incident in the AdminDashboard, a modal panel displays enriched context from three external sources: social media posts, weather conditions, and local news feeds. This feature enables admins to quickly validate incident authenticity and assess real-world impact, transforming PhantomOps from a simple reporting tool into an intelligent incident validation platform.

## Glossary

- **EnrichmentPanel**: The React modal component that displays aggregated external data for a specific incident
- **AdminDashboard**: The existing React component where admins view and manage all reported incidents
- **EnrichmentAPI**: The new backend API endpoint that aggregates data from Reddit, OpenWeatherMap, and RSS feeds
- **IncidentRecord**: A database record containing incident details including geolocation (latitude/longitude)
- **RedditPost**: A Reddit post from emergency-related subreddits
- **WeatherData**: Current weather conditions from OpenWeatherMap API at the incident location
- **NewsFeedItem**: An entry from a local news RSS feed

## Requirements

### Requirement 1

**User Story:** As an admin, I want to click on an incident in the AdminDashboard table, so that I can view enriched validation data in a modal panel

#### Acceptance Criteria

1. WHEN an admin clicks on any incident row in the AdminDashboard table, THE EnrichmentPanel SHALL display as a modal overlay
2. THE EnrichmentPanel SHALL receive the incident ID as a prop from the AdminDashboard
3. THE EnrichmentPanel SHALL display a loading state while fetching enrichment data
4. THE EnrichmentPanel SHALL include a close button that dismisses the modal and returns focus to the AdminDashboard
5. IF the EnrichmentAPI request fails, THEN THE EnrichmentPanel SHALL display an error message using SweetAlert2

### Requirement 2

**User Story:** As an admin, I want to see recent social media posts related to emergencies, so that I can validate the incident against real-time public reports

#### Acceptance Criteria

1. THE EnrichmentAPI SHALL fetch up to 5 posts from Reddit API
2. THE EnrichmentAPI SHALL search emergency-related subreddits (news, worldnews, emergencies, PublicFreakout)
3. THE EnrichmentAPI SHALL filter posts posted within the last 24 hours
4. THE EnrichmentPanel SHALL display each RedditPost with its title, timestamp, author username, and subreddit
5. IF no posts are found within the search parameters, THEN THE EnrichmentPanel SHALL display a "No social media posts found" message

### Requirement 3

**User Story:** As an admin, I want to see current weather conditions at the incident location, so that I can assess environmental factors affecting the incident

#### Acceptance Criteria

1. THE EnrichmentAPI SHALL request weather data from OpenWeatherMap API
2. THE EnrichmentAPI SHALL use the IncidentRecord latitude and longitude coordinates
3. THE EnrichmentAPI SHALL retrieve temperature, humidity, wind speed, weather description, and weather icon
4. THE EnrichmentPanel SHALL display the WeatherData with temperature, conditions, and relevant metrics
5. IF the OpenWeatherMap API request fails, THEN THE EnrichmentAPI SHALL return an error indicator for the weather section

### Requirement 4

**User Story:** As an admin, I want to see recent local news items, so that I can cross-reference the incident with official news sources

#### Acceptance Criteria

1. THE EnrichmentAPI SHALL fetch up to 5 items from a configured local news RSS feed
2. THE EnrichmentPanel SHALL display each NewsFeedItem with its title, publication date, and a link to the full article
3. THE EnrichmentPanel SHALL open news article links in a new browser tab
4. IF the RSS feed is unavailable or returns no items, THEN THE EnrichmentPanel SHALL display a "No news items found" message
5. THE EnrichmentAPI SHALL parse RSS feed XML and extract title, link, and publication date fields

### Requirement 5

**User Story:** As an admin, I want all enrichment data to be fetched from a single API call, so that the panel loads efficiently without multiple network requests

#### Acceptance Criteria

1. THE EnrichmentAPI SHALL expose a single endpoint at `/api/incidents/<incident_id>/enrich`
2. THE EnrichmentAPI SHALL require JWT authentication using the verify_jwt_from_request decorator
3. THE EnrichmentAPI SHALL fetch data from all three external sources (Reddit, OpenWeatherMap, RSS) in parallel using ThreadPoolExecutor
4. THE EnrichmentAPI SHALL return a single JSON response containing reddit_posts, weather_data, and news_items fields
5. IF any individual external service fails, THEN THE EnrichmentAPI SHALL return partial data with null or empty values for the failed service

### Requirement 6

**User Story:** As a developer, I want the enrichment feature to use new Python libraries for external API integration, so that the implementation follows best practices for each service

#### Acceptance Criteria

1. THE EnrichmentAPI SHALL use the praw library for Reddit API integration
2. THE EnrichmentAPI SHALL use the requests library for OpenWeatherMap API integration
3. THE EnrichmentAPI SHALL use the feedparser library for RSS feed parsing
4. THE backend .env file SHALL include new environment variables for Reddit API credentials, OpenWeatherMap API key, and RSS feed URL
5. THE EnrichmentAPI SHALL handle API authentication and rate limiting according to each service's requirements

### Requirement 7

**User Story:** As an admin, I want the enrichment panel to follow the existing PhantomOps UI patterns, so that the feature feels integrated and consistent

#### Acceptance Criteria

1. THE EnrichmentPanel SHALL use SweetAlert2 for error notifications
2. THE EnrichmentPanel SHALL make API calls using the apiClient utility from src/utils/apiClient.js
3. THE EnrichmentPanel SHALL follow React functional component patterns with Hooks
4. THE AdminDashboard modifications SHALL maintain the existing table layout and functionality
5. THE EnrichmentPanel SHALL use consistent styling with the existing AdminDashboard component
