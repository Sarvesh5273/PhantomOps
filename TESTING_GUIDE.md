# Incident Enrichment Feature - Complete Testing Guide

## Quick Start

### 1. Start the Servers

**Backend:**
```bash
cd backend
python app.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Both servers should now be running:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

## 2. Run Automated Tests

### Backend Tests
```bash
cd backend

# Test 1: Basic endpoint tests (no JWT required)
python test_enrichment_automated.py

# Test 2: Error handling tests
python test_error_scenarios.py
```

**Expected Results:**
- ✅ All automated tests should pass
- ✅ Backend server health confirmed
- ✅ JWT authentication working
- ✅ Enrichment route registered
- ✅ All dependencies installed

---

## 3. Manual Frontend Testing

### Step 1: Login to the Application
1. Open http://localhost:5173 in your browser
2. Login with your credentials (or create a new account)
3. Navigate to the Admin Dashboard

### Step 2: Test EnrichmentPanel Opening
1. Click on any incident row in the table
2. **Verify:**
   - ✅ Modal overlay appears
   - ✅ Dark background with blur effect
   - ✅ Modal is centered on screen
   - ✅ Header shows "Enrichment Data for Incident #X"
   - ✅ Loading spinner appears

### Step 3: Test Data Display
1. Wait for data to load (should be quick with placeholder credentials)
2. **Verify three sections appear:**
   - 🐦 Social Media Posts
   - 🚗 Traffic Conditions
   - 📰 Local News

3. **With placeholder credentials, you should see:**
   - "No social media posts found"
   - "Traffic map unavailable"
   - "No news items found"

4. **This is expected behavior!** The feature is working correctly.

### Step 4: Test Modal Interactions
1. **Close Button:** Click the X button → Modal should close
2. **Overlay Click:** Click outside modal → Modal should close
3. **Escape Key:** Press Escape → Modal should close
4. **Multiple Opens:** Click different incidents → Each shows correct ID

### Step 5: Test Resolve Button
1. Click on an incident row (modal opens)
2. Close the modal
3. Click the "Resolve" button on the same incident
4. **Verify:** Resolve action works independently (no modal opens)

---

## 4. Testing with Real API Data (Optional)

To see the feature with real external data:

### Step 1: Get API Credentials

**Twitter API:**
1. Go to https://developer.twitter.com/
2. Create a developer account
3. Create a new app
4. Generate Bearer Token (API v2)

**Google Maps API:**
1. Go to https://console.cloud.google.com/
2. Enable "Maps Static API"
3. Create API key
4. Restrict key to Static Maps API

**RSS Feed:**
- Use any valid RSS feed URL
- Example: https://rss.nytimes.com/services/xml/rss/nyt/US.xml

### Step 2: Configure Credentials

Edit `backend/.env`:
```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAYourRealTokenHere
GOOGLE_MAPS_API_KEY=AIzaSyYourRealKeyHere
RSS_FEED_URL=https://rss.nytimes.com/services/xml/rss/nyt/US.xml
```

### Step 3: Restart Backend
```bash
cd backend
# Stop the server (Ctrl+C)
python app.py
```

### Step 4: Test with Real Data
1. Open frontend and login
2. Click on an incident
3. **You should now see:**
   - Real tweets from the incident location (if any exist)
   - Google Maps image with traffic styling
   - Recent news items from the RSS feed

---

## 5. Browser DevTools Testing

### Test Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Click on an incident
4. **Verify:**
   - Request to `/api/incidents/{id}/enrich`
   - Authorization header with Bearer token
   - Response status 200 OK
   - Response contains incident_id, twitter_posts, traffic_map_url, news_items

### Test Error Handling
1. In DevTools, go to Network tab
2. Enable "Offline" mode
3. Click on an incident
4. **Verify:**
   - SweetAlert2 error notification appears
   - Error message is user-friendly
   - Modal can still be closed

### Test Console Logs
1. Open Console tab
2. Click on an incident
3. **Verify:**
   - No React errors or warnings
   - API errors are logged (if any)
   - No memory leaks

---

## 6. Responsive Design Testing

### Desktop (>1200px)
1. Resize browser to full width
2. Open enrichment panel
3. **Verify:**
   - Three sections side-by-side
   - Proper spacing
   - Modal has max-width

### Tablet (768px - 1200px)
1. Resize browser to ~900px width
2. Open enrichment panel
3. **Verify:**
   - Sections may wrap
   - Still readable
   - Scrolling works

### Mobile (<768px)
1. Resize browser to ~400px width (or use DevTools device emulation)
2. Open enrichment panel
3. **Verify:**
   - Sections stack vertically
   - Modal fits screen
   - Touch interactions work
   - Text is readable

---

## 7. Performance Testing

### Response Time
1. Open DevTools Network tab
2. Click on an incident
3. Check the enrichment API request
4. **Verify:**
   - Response time < 15 seconds (with real APIs)
   - Response time < 2 seconds (with placeholder credentials)

### Multiple Requests
1. Click on incident #1
2. Close modal
3. Click on incident #2
4. Close modal
5. Click on incident #1 again
6. **Verify:**
   - Each request completes successfully
   - No performance degradation
   - Correct data for each incident

---

## 8. Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate
2. **Verify:**
   - Can reach close button with keyboard
   - Escape key closes modal
   - Focus is managed properly

### Screen Reader (Optional)
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Open enrichment panel
3. **Verify:**
   - Modal content is announced
   - Section headings are read
   - Links are accessible

---

## 9. Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

**Verify in each:**
- Modal displays correctly
- Styling is consistent
- Interactions work
- No console errors

---

## 10. Troubleshooting

### "No incidents found"
**Solution:** Create an incident via the UserDashboard:
1. Logout and login as a regular user
2. Go to UserDashboard
3. Click "Report New Incident"
4. Fill in details (make sure to include location)
5. Submit
6. Logout and login as admin
7. Try again

### "Cannot connect to backend"
**Solution:**
1. Check backend is running: `python app.py`
2. Check URL is http://localhost:5000
3. Check for port conflicts

### "JWT token expired"
**Solution:**
1. Logout and login again
2. Get fresh token

### "External services returning empty data"
**Solution:**
1. This is expected with placeholder credentials
2. Configure real API keys in `.env`
3. Restart backend server

### "Modal not opening"
**Solution:**
1. Check browser console for errors
2. Verify EnrichmentPanel component is imported
3. Check that incident has latitude/longitude

---

## 11. Test Results Checklist

Use this checklist to track your testing:

### Backend Tests
- [ ] Automated tests pass (test_enrichment_automated.py)
- [ ] Error scenario tests pass (test_error_scenarios.py)
- [ ] Server starts without errors
- [ ] Dependencies are installed

### Frontend Tests
- [ ] Modal opens on incident click
- [ ] Loading state displays
- [ ] Three sections render
- [ ] Close button works
- [ ] Overlay click closes modal
- [ ] Escape key closes modal
- [ ] Error notification works
- [ ] Multiple incidents work correctly
- [ ] Resolve button works independently

### Integration Tests
- [ ] API request includes JWT token
- [ ] Response has correct structure
- [ ] Partial data handled gracefully
- [ ] Error responses are user-friendly

### Responsive Design
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works

### Performance
- [ ] Response time acceptable
- [ ] No memory leaks
- [ ] Multiple requests work

### Accessibility
- [ ] Keyboard navigation works
- [ ] Escape key works
- [ ] Focus management correct

### Cross-Browser
- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works (if available)

---

## 12. Demo Script

Use this script for demonstrating the feature:

### Setup (Before Demo)
1. Start backend and frontend servers
2. Login as admin
3. Ensure at least 2-3 incidents exist
4. (Optional) Configure real API credentials for impressive demo

### Demo Flow
1. **Show AdminDashboard**
   - "Here's our admin dashboard with all reported incidents"
   
2. **Click on Incident**
   - "When I click on an incident, the enrichment panel opens"
   - "It automatically fetches data from three external sources"

3. **Show Loading State**
   - "Notice the loading indicator while data is being fetched"

4. **Show Data Sections**
   - "Here we have social media posts from the incident location"
   - "This is a traffic map showing current conditions"
   - "And here are recent news items from local sources"

5. **Show Interactions**
   - "I can close the modal with the X button"
   - "Or by clicking outside"
   - "Or by pressing Escape"

6. **Show Multiple Incidents**
   - "Each incident loads its own enrichment data"
   - "The system handles multiple requests efficiently"

7. **Show Error Handling**
   - (Optional) Disconnect network
   - "If external services fail, we show friendly error messages"
   - "The system continues to work with partial data"

---

## Success Criteria

The feature is working correctly if:

✅ All automated tests pass  
✅ Modal opens and closes properly  
✅ Three data sections display  
✅ Error handling is graceful  
✅ Responsive design works  
✅ No console errors  
✅ JWT authentication works  
✅ Partial data scenarios handled  

---

## Next Steps

After testing is complete:

1. **For Development:**
   - Feature is ready for code review
   - Consider adding unit tests
   - Consider adding E2E tests with Playwright

2. **For Production:**
   - Configure real API credentials
   - Set up monitoring and logging
   - Implement rate limiting
   - Implement caching
   - Add analytics tracking

3. **For Hackathon:**
   - Feature is demo-ready!
   - Prepare demo script
   - Practice demo flow
   - Highlight "Frankenstein" aspect (stitching together multiple APIs)

---

**Happy Testing! 🧪**
