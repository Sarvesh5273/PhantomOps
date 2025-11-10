# Design Document

## Overview

The Escape Routes Integration feature enhances the UserDashboard by embedding the existing EscapeRoutes component directly into the incident reporting workflow. This design leverages the already-implemented backend API (`/api/escape-routes`) and frontend component (`EscapeRoutes.jsx`) to provide users with immediate access to nearby safety resources when reporting incidents.

The integration follows a "smart sync" pattern where GPS coordinates captured in the incident form automatically populate and trigger the escape routes search, creating a seamless user experience during emergencies.

## Architecture

### Component Hierarchy

```
UserDashboard (Parent)
├── Header (with LogoutButton)
├── Report Incident Button
├── Incident Report Form (conditional)
│   ├── Form Fields
│   ├── GPS Location Capture
│   └── Submit Button
├── EscapeRoutes Component (conditional, embedded)
│   ├── Location Input (synced with form)
│   ├── Search Controls
│   └── Results Display (Hospitals, Police, Fire Stations)
└── My Incidents Table
```

### State Management

The UserDashboard will manage shared state between the incident form and EscapeRoutes component:

```javascript
// Existing state
const [showReportForm, setShowReportForm] = useState(false);
const [formData, setFormData] = useState({
  latitude: "",
  longitude: "",
  // ... other fields
});

// New state for escape routes integration
const [escapeRoutesLocation, setEscapeRoutesLocation] = useState({
  latitude: "",
  longitude: ""
});
const [triggerEscapeSearch, setTriggerEscapeSearch] = useState(false);
```

### Data Flow

1. **User captures GPS location** → Updates `formData.latitude/longitude`
2. **GPS update triggers** → Updates `escapeRoutesLocation` state
3. **Location state change** → Triggers `EscapeRoutes` component to fetch data
4. **EscapeRoutes displays** → Shows nearby safety resources
5. **User can manually search** → Independent search in EscapeRoutes component

## Components and Interfaces

### Modified UserDashboard Component

**New Props/State:**
- `escapeRoutesLocation`: Object containing latitude/longitude for escape routes
- `triggerEscapeSearch`: Boolean flag to trigger automatic search

**Modified Functions:**
- `getCurrentLocation()`: Enhanced to also update escape routes location and trigger search

**New Integration Logic:**
```javascript
// When GPS location is captured
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        
        // Update incident form
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lon,
        });
        
        // Update escape routes and trigger search
        setEscapeRoutesLocation({ latitude: lat, longitude: lon });
        setTriggerEscapeSearch(true);
        
        // Show success message
        Swal.fire({...});
      },
      (error) => {
        // Error handling
      }
    );
  }
};
```

### Modified EscapeRoutes Component

**New Props:**
- `initialLocation`: Object with latitude/longitude from parent (optional)
- `autoSearch`: Boolean to trigger automatic search on mount/update (optional)

**Component Signature:**
```javascript
const EscapeRoutes = ({ initialLocation, autoSearch }) => {
  // Existing state
  const [escapeData, setEscapeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  
  // New effect to handle props
  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      setLocation(initialLocation);
      if (autoSearch) {
        fetchEscapeRoutes(initialLocation.latitude, initialLocation.longitude);
      }
    }
  }, [initialLocation, autoSearch]);
  
  // Existing functions remain unchanged
};
```

### API Integration

**Existing Backend Endpoint:**
- `GET /api/escape-routes?latitude={lat}&longitude={lon}`
- Returns: `{ hospitals: [], police_stations: [], fire_stations: [] }`
- Uses OpenStreetMap Overpass API (no API key required)
- Searches within 5km radius
- Returns up to 5 results per category

**No backend changes required** - the API is already implemented and functional.

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│ PhantomOps User Portal              [Logout]    │
├─────────────────────────────────────────────────┤
│ [🚨 Report New Incident]                        │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Report Safety Incident                      │ │
│ │ [Form fields...]                            │ │
│ │ [Latitude] [Longitude] [📍 Use My Location] │ │
│ │ [Submit Report]                             │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 🗺️ Find Nearby Safety Resources            │ │
│ │                                             │ │
│ │ [Latitude] [Longitude] [📍] [🔍 Search]    │ │
│ │                                             │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│ │ │🏥Hospital│ │🚔 Police │ │🚒 Fire   │    │ │
│ │ │  Results │ │  Results │ │  Results │    │ │
│ │ └──────────┘ └──────────┘ └──────────┘    │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ My Incident Reports                             │
│ [Table of user's incidents...]                  │
└─────────────────────────────────────────────────┘
```

### Visibility Rules

1. **EscapeRoutes component visibility:**
   - SHOW when `showReportForm === true`
   - HIDE when `showReportForm === false`

2. **Auto-search behavior:**
   - Automatically search when GPS location is captured in incident form
   - Allow manual search at any time
   - Maintain results when form is submitted (don't clear)

3. **Responsive behavior:**
   - Stack vertically on mobile devices
   - Maintain card-based layout for consistency
   - Use existing `professional-card` styling

### Styling Approach

**Reuse existing CSS classes:**
- `.professional-card` for container
- `.section-header` for titles
- `.input-field` for inputs
- `.btn-primary`, `.btn-success` for buttons
- `.loading-spinner` for loading state

**Color scheme (from balanced-halloween.css):**
- Hospitals: Green (`#10b981`)
- Police: Blue (`#3b82f6`)
- Fire Stations: Red (`#ef4444`)
- Background: Dark theme (`#1a1f2e`)
- Accents: Orange (`#ff6b35`)

## Data Models

### Location Data Structure

```typescript
interface Location {
  latitude: string | number;
  longitude: string | number;
}
```

### Safety Resource Data Structure

```typescript
interface SafetyPlace {
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  type: "hospital" | "police" | "fire_station";
}

interface EscapeRoutesResponse {
  hospitals: SafetyPlace[];
  police_stations: SafetyPlace[];
  fire_stations: SafetyPlace[];
}
```

## Error Handling

### GPS Location Errors

**Scenario:** User denies location permission or GPS fails
**Handling:**
1. Display SweetAlert2 error message
2. Keep escape routes component visible
3. Allow manual coordinate entry
4. Do not trigger automatic search

### API Request Errors

**Scenario:** `/api/escape-routes` endpoint fails
**Handling:**
1. Display error message in EscapeRoutes component
2. Show "Failed to fetch escape routes" message
3. Allow user to retry search
4. Log error to console for debugging

### Invalid Coordinates

**Scenario:** User enters invalid latitude/longitude
**Handling:**
1. Display validation warning
2. Prevent search until valid coordinates entered
3. Show helpful placeholder text (e.g., "40.7128")

### No Results Found

**Scenario:** No safety resources within 5km radius
**Handling:**
1. Display "No [type] found nearby" message for each category
2. Suggest expanding search radius (future enhancement)
3. Maintain UI structure with empty state messages

## Testing Strategy

### Unit Testing Focus

**UserDashboard Integration:**
1. Verify GPS location updates both form and escape routes state
2. Verify escape routes component visibility tied to form visibility
3. Verify state synchronization between components

**EscapeRoutes Component:**
1. Verify component accepts and uses `initialLocation` prop
2. Verify `autoSearch` prop triggers automatic fetch
3. Verify manual search still works independently
4. Verify results display correctly for all three categories

### Integration Testing Focus

**End-to-End Flow:**
1. User clicks "Report New Incident" → Form and escape routes appear
2. User clicks "Use My Location" → Both form and escape routes populate
3. Escape routes automatically fetch and display results
4. User can manually search different location in escape routes
5. User submits incident → Escape routes remain visible with data
6. User clicks "Cancel" → Both form and escape routes hide

**Error Scenarios:**
1. GPS permission denied → Error message, manual entry available
2. API request fails → Error message, retry available
3. No results found → Empty state messages displayed
4. Invalid coordinates → Validation warning shown

### Manual Testing Checklist

- [ ] GPS location capture updates both components
- [ ] Automatic search triggers after GPS capture
- [ ] Manual search works independently
- [ ] Results display correctly with distances
- [ ] Google Maps directions links work
- [ ] Component hides/shows with form visibility
- [ ] Responsive layout works on mobile
- [ ] Loading states display correctly
- [ ] Error messages are clear and helpful
- [ ] Styling matches existing theme

## Performance Considerations

### Optimization Strategies

1. **Debounce automatic searches:** Prevent multiple API calls if GPS updates rapidly
2. **Cache results:** Store escape routes data to avoid redundant API calls for same location
3. **Lazy loading:** Only fetch escape routes when component is visible
4. **Request cancellation:** Cancel pending requests if user changes location quickly

### API Rate Limiting

**OpenStreetMap Overpass API:**
- Free tier with reasonable rate limits
- No API key required
- Implement 1-second delay between requests if needed
- Show loading state during fetch

## Security Considerations

### Authentication

- Escape routes endpoint requires JWT authentication (already implemented)
- Uses existing `verify_jwt_from_request()` decorator
- No additional security changes needed

### Data Privacy

- GPS coordinates are not stored permanently
- Only used for real-time search
- No tracking or logging of user locations
- Coordinates cleared when form is reset

### Input Validation

- Backend validates latitude/longitude parameters
- Frontend validates coordinate format before search
- Prevent injection attacks through coordinate inputs

## Future Enhancements

### Phase 2 Improvements (Not in Current Scope)

1. **Expandable search radius:** Allow users to search 10km, 20km
2. **Route visualization:** Show map with incident location and safety resources
3. **Save favorite locations:** Store frequently used locations
4. **Real-time updates:** WebSocket updates for changing facility availability
5. **Additional resource types:** Shelters, pharmacies, gas stations
6. **Offline mode:** Cache nearby resources for offline access

## Dependencies

### Existing Dependencies (No Changes)

- React 18.3.1
- Axios 1.13.2 (via apiClient)
- SweetAlert2 11.26.3
- OpenStreetMap Overpass API (external, free)

### No New Dependencies Required

All functionality can be implemented with existing libraries and components.
