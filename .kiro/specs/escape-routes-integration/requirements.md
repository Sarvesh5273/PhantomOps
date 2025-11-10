# Requirements Document

## Introduction

The Escape Routes Integration feature enhances the PhantomOps UserDashboard by providing users with immediate access to nearby safety resources (hospitals, police stations, fire stations) when reporting incidents. This feature helps users find safety quickly during emergencies by displaying nearby facilities with distances and directions.

## Glossary

- **UserDashboard**: The authenticated user interface where citizens report safety incidents
- **EscapeRoutes Component**: A React component that displays nearby safety resources using geolocation
- **Safety Resources**: Hospitals, police stations, and fire stations within a 5km radius
- **Incident Report Form**: The form interface where users submit new incident reports
- **Geolocation**: GPS coordinates (latitude/longitude) used to find nearby facilities
- **OpenStreetMap Overpass API**: The external API service used to query nearby facilities

## Requirements

### Requirement 1

**User Story:** As a user reporting an incident, I want to see nearby safety resources, so that I can quickly find help during an emergency.

#### Acceptance Criteria

1. WHEN the UserDashboard loads, THE UserDashboard SHALL display an Escape Routes section below the incident report form
2. WHEN a user captures their GPS location in the incident form, THE UserDashboard SHALL automatically populate the Escape Routes component with the same coordinates
3. WHEN the Escape Routes component receives valid coordinates, THE UserDashboard SHALL display nearby hospitals, police stations, and fire stations within 5km
4. WHEN safety resources are displayed, THE UserDashboard SHALL show the facility name, distance in kilometers, and a link to Google Maps directions
5. WHEN no safety resources are found, THE UserDashboard SHALL display a clear message indicating no facilities were found nearby

### Requirement 2

**User Story:** As a user in an emergency, I want the escape routes to load automatically when I use my GPS location, so that I don't have to manually search for safety resources.

#### Acceptance Criteria

1. WHEN a user clicks "Use My Location" in the incident report form, THE UserDashboard SHALL capture the GPS coordinates
2. WHEN GPS coordinates are captured, THE UserDashboard SHALL automatically trigger the Escape Routes search with those coordinates
3. WHEN the Escape Routes search completes, THE UserDashboard SHALL display the results without requiring additional user action
4. WHEN GPS location fails, THE UserDashboard SHALL display an error message and allow manual coordinate entry

### Requirement 3

**User Story:** As a user, I want to manually search for safety resources at a different location, so that I can plan ahead or help others in different areas.

#### Acceptance Criteria

1. WHEN a user enters coordinates manually in the Escape Routes component, THE UserDashboard SHALL allow the user to trigger a search
2. WHEN the user clicks the search button, THE UserDashboard SHALL fetch safety resources for the manually entered coordinates
3. WHEN coordinates are invalid or missing, THE UserDashboard SHALL display a validation error message
4. WHEN the search is in progress, THE UserDashboard SHALL display a loading indicator

### Requirement 4

**User Story:** As a user, I want the escape routes feature to work seamlessly with the incident reporting flow, so that I have a cohesive experience.

#### Acceptance Criteria

1. WHEN the incident report form is hidden, THE UserDashboard SHALL also hide the Escape Routes component
2. WHEN the incident report form is shown, THE UserDashboard SHALL display the Escape Routes component below it
3. WHEN a user submits an incident report, THE UserDashboard SHALL maintain the Escape Routes data on screen
4. WHEN the page layout changes, THE UserDashboard SHALL ensure the Escape Routes component is responsive and properly styled

### Requirement 5

**User Story:** As a user, I want clear visual feedback when searching for safety resources, so that I understand the system is working.

#### Acceptance Criteria

1. WHEN the Escape Routes search begins, THE UserDashboard SHALL display a loading spinner
2. WHEN the search completes successfully, THE UserDashboard SHALL hide the loading spinner and show results
3. WHEN the search fails, THE UserDashboard SHALL display an error message with details
4. WHEN results are displayed, THE UserDashboard SHALL organize them by category (hospitals, police, fire stations) with color-coded sections
