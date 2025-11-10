# Frontend EnrichmentPanel Testing Guide

## Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend server running on http://localhost:5173
3. Valid user account (admin role preferred)
4. At least one incident in the database

## Test Checklist

### Test 5.2.1: Modal Opens on Incident Click ✓
**Steps:**
1. Login to the application
2. Navigate to Admin Dashboard
3. Click on any incident row in the table

**Expected Result:**
- EnrichmentPanel modal should appear as an overlay
- Modal should have dark background with blur effect
- Modal should be centered on screen
- Header should show "Enrichment Data for Incident #{id}"

**Pass Criteria:**
- [ ] Modal appears immediately on click
- [ ] Background is darkened and blurred
- [ ] Modal is properly centered
- [ ] Correct incident ID is displayed in header

---

### Test 5.2.2: Loading State Display ✓
**Steps:**
1. Click on an incident row
2. Observe the modal during API call

**Expected Result:**
- Loading spinner (⏳) should be visible
- "Loading enrichment data..." message should appear
- Close button should be disabled during loading

**Pass Criteria:**
- [ ] Loading indicator is visible
- [ ] Loading message is clear
- [ ] Close button is disabled (grayed out)
- [ ] No content sections visible during loading

---

### Test 5.2.3: All Three Data Sections Render ✓
**Steps:**
1. Click on an incident row
2. Wait for data to load
3. Observe all three sections

**Expected Result:**
- Three sections should be visible:
  - 🐦 Social Media Posts
  - 🚗 Traffic Conditions
  - 📰 Local News
- Each section should have appropriate styling
- Sections should be in a responsive grid layout

**Pass Criteria:**
- [ ] Social Media section displays
- [ ] Traffic section displays
- [ ] News section displays
- [ ] Grid layout is responsive
- [ ] Sections have consistent styling

---

### Test 5.2.4: Social Media Posts Section ✓
**Steps:**
1. Open enrichment panel
2. Check Social Media Posts section

**Expected Result (with API credentials):**
- Up to 5 tweet cards displayed
- Each tweet shows: username, timestamp, text
- Tweets have blue accent border
- Username is in blue color

**Expected Result (without API credentials):**
- "No social media posts found" message

**Pass Criteria:**
- [ ] Section title is visible
- [ ] Tweet cards render correctly (if data available)
- [ ] Empty state message shows (if no data)
- [ ] Timestamps are formatted correctly
- [ ] Text content is readable

---

### Test 5.2.5: Traffic Map Section ✓
**Steps:**
1. Open enrichment panel
2. Check Traffic Conditions section

**Expected Result (with API key):**
- Static map image displays
- Map is centered on incident location
- Red marker visible at incident coordinates
- Image has proper styling

**Expected Result (without API key):**
- "Traffic map unavailable" message

**Pass Criteria:**
- [ ] Section title is visible
- [ ] Map image loads (if API key configured)
- [ ] Empty state message shows (if no API key)
- [ ] Image has proper dimensions
- [ ] Image error handling works

---

### Test 5.2.6: News Feed Section ✓
**Steps:**
1. Open enrichment panel
2. Check Local News section

**Expected Result (with RSS feed):**
- Up to 5 news item cards displayed
- Each item shows: title, publication date, link
- Links have "Read more →" text
- Items have orange accent border

**Expected Result (without RSS feed):**
- "No news items found" message

**Pass Criteria:**
- [ ] Section title is visible
- [ ] News cards render correctly (if data available)
- [ ] Empty state message shows (if no data)
- [ ] Dates are formatted correctly
- [ ] Links are styled correctly

---

### Test 5.2.7: Close Button Functionality ✓
**Steps:**
1. Open enrichment panel
2. Click the X button in top-right corner

**Expected Result:**
- Modal should close immediately
- Background should return to normal
- AdminDashboard should be visible again
- No errors in console

**Pass Criteria:**
- [ ] Close button is visible
- [ ] Clicking close button closes modal
- [ ] Modal state is reset
- [ ] No memory leaks or errors

---

### Test 5.2.8: Overlay Click to Close ✓
**Steps:**
1. Open enrichment panel
2. Click on the dark background (outside modal)

**Expected Result:**
- Modal should close
- Same behavior as close button

**Pass Criteria:**
- [ ] Clicking overlay closes modal
- [ ] Clicking inside modal does NOT close it
- [ ] Behavior is consistent with close button

---

### Test 5.2.9: Escape Key to Close ✓
**Steps:**
1. Open enrichment panel
2. Press Escape key on keyboard

**Expected Result:**
- Modal should close
- Same behavior as close button

**Pass Criteria:**
- [ ] Escape key closes modal
- [ ] Escape key is disabled during loading
- [ ] No conflicts with other keyboard shortcuts

---

### Test 5.2.10: Error Notification ✓
**Steps:**
1. Stop the backend server
2. Open enrichment panel
3. Observe error handling

**Expected Result:**
- SweetAlert2 error notification appears
- Error message is clear and helpful
- Modal remains open with error state
- User can close modal after error

**Pass Criteria:**
- [ ] Error notification appears
- [ ] Error message is user-friendly
- [ ] Modal can be closed after error
- [ ] Error is logged to console

---

### Test 5.2.11: News Links Open in New Tab ✓
**Steps:**
1. Open enrichment panel with news data
2. Click on a news item link

**Expected Result:**
- Link opens in new browser tab
- Original tab remains on AdminDashboard
- Link has proper security attributes (noopener noreferrer)

**Pass Criteria:**
- [ ] Link opens in new tab
- [ ] Original tab is not affected
- [ ] No security warnings in console

---

### Test 5.2.12: Responsive Layout - Desktop ✓
**Steps:**
1. Open enrichment panel on desktop (>1200px width)
2. Observe layout

**Expected Result:**
- Three sections displayed side-by-side
- Grid layout with equal columns
- Modal is centered and not full-width
- All content is readable

**Pass Criteria:**
- [ ] Three-column grid layout
- [ ] Proper spacing between sections
- [ ] Modal has max-width constraint
- [ ] Content is not cramped

---

### Test 5.2.13: Responsive Layout - Mobile ✓
**Steps:**
1. Open enrichment panel on mobile (<768px width)
2. Observe layout

**Expected Result:**
- Sections stack vertically
- Modal adapts to screen width
- All content remains accessible
- Scrolling works properly

**Pass Criteria:**
- [ ] Sections stack vertically
- [ ] Modal fits mobile screen
- [ ] Text is readable
- [ ] Scrolling is smooth
- [ ] Touch interactions work

---

### Test 5.2.14: Multiple Incident Clicks ✓
**Steps:**
1. Open enrichment panel for incident #1
2. Close modal
3. Open enrichment panel for incident #2
4. Verify correct data loads

**Expected Result:**
- Each incident loads its own data
- No data mixing between incidents
- Modal resets properly between opens

**Pass Criteria:**
- [ ] Correct incident ID in header
- [ ] Data corresponds to selected incident
- [ ] No stale data from previous incident
- [ ] State resets properly

---

### Test 5.2.15: Resolve Button Still Works ✓
**Steps:**
1. Click on incident row (modal opens)
2. Close modal
3. Click "Resolve" button on same incident

**Expected Result:**
- Resolve button works independently
- Clicking resolve does NOT open enrichment modal
- Incident status updates correctly

**Pass Criteria:**
- [ ] Resolve button is clickable
- [ ] Resolve action works correctly
- [ ] No interference with enrichment modal
- [ ] Event propagation is handled correctly

---

## Testing with Real API Data

To test with real external data, configure API credentials in `backend/.env`:

```env
# Get from https://developer.twitter.com/
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABearerTokenHere

# Get from https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsKeyHere

# Use any valid RSS feed URL
RSS_FEED_URL=https://rss.nytimes.com/services/xml/rss/nyt/US.xml
```

Then restart the backend server and test again.

---

## Browser Compatibility Testing

Test the EnrichmentPanel in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

Verify:
- Modal displays correctly
- Styling is consistent
- Interactions work properly
- No console errors

---

## Performance Testing

- [ ] Modal opens within 500ms
- [ ] API call completes within 30 seconds
- [ ] No memory leaks after multiple opens/closes
- [ ] Smooth animations and transitions
- [ ] No layout shifts during loading

---

## Accessibility Testing

- [ ] Modal can be closed with keyboard (Escape)
- [ ] Focus is trapped within modal when open
- [ ] Screen reader announces modal content
- [ ] Color contrast meets WCAG standards
- [ ] All interactive elements are keyboard accessible

---

## Notes

- Most tests can be performed without real API credentials
- Empty state messages should display when no data is available
- Error handling should be graceful and user-friendly
- Modal should never block the user from closing it (except during loading)
