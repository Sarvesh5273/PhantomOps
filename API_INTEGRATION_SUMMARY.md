# 🔗 PhantomOps API Integration Summary

## ✅ External APIs Configured

Your PhantomOps application integrates **3 external APIs** for the enrichment feature:

### 1. Reddit API 💬
**Status:** ✅ Configured  
**Credentials in `.env`:**
```env
REDDIT_CLIENT_ID=0FvofluBjOygbZThngk0oA
REDDIT_CLIENT_SECRET=H7LaRLTPRmWUcXpnWEnU0_OEtKqwOg
REDDIT_USER_AGENT="PhantomOps v0.1 by /u/Powerful-Phone-8782"
```

**What it does:**
- Searches Reddit for posts related to emergencies/incidents
- Looks in subreddits: r/news, r/worldnews, r/emergencies, r/PublicFreakout
- Returns up to 5 recent posts from the last 24 hours
- Shows: username, subreddit, title, timestamp

**Library:** `praw` (Python Reddit API Wrapper)

---

### 2. OpenWeatherMap API 🌤️
**Status:** ✅ Configured  
**Credentials in `.env`:**
```env

```

**What it does:**
- Fetches current weather at incident location
- Uses latitude/longitude coordinates
- Returns: temperature, feels like, humidity, wind speed, clouds, description
- Shows weather icon from OpenWeatherMap

**Library:** `requests` (HTTP library)

---

### 3. RSS News Feed 📰
**Status:** ✅ Configured  
**Credentials in `.env`:**
```env
RSS_FEED_URL="https://feeds.bbci.co.uk/news/world/rss.xml"
```

**What it does:**
- Parses BBC World News RSS feed
- Returns up to 5 recent news items
- Shows: title, link, published date
- Links open in new tab

**Library:** `feedparser` (RSS/Atom parser)

---

## 🎯 How It Works

### Enrichment Flow

```
Admin clicks incident in dashboard
         ↓
Frontend calls: GET /api/incidents/{id}/enrich
         ↓
Backend fetches incident location (lat/long)
         ↓
Backend calls 3 APIs in parallel:
    ├─ Reddit API (search for emergency posts)
    ├─ OpenWeatherMap API (get weather at location)
    └─ RSS Feed (parse BBC news)
         ↓
Backend returns combined data
         ↓
Frontend displays in EnrichmentPanel modal:
    ├─ 💬 Reddit Discussion
    ├─ 🌤️ Weather Conditions
    └─ 📰 Local News
```

---

## 📊 Data Structure

### Response Format

```json
{
  "incident_id": 42,
  "reddit_posts": [
    {
      "id": "abc123",
      "username": "u/example",
      "text": "Breaking: Fire reported downtown",
      "created_at": "2025-11-09T10:30:00",
      "subreddit": "r/news",
      "url": "https://reddit.com/r/news/comments/..."
    }
  ],
  "weather_data": {
    "temperature": 22.5,
    "feels_like": 21.0,
    "humidity": 65,
    "pressure": 1013,
    "description": "partly cloudy",
    "icon": "02d",
    "wind_speed": 3.5,
    "clouds": 40,
    "location": "New York"
  },
  "news_items": [
    {
      "title": "Breaking News: Incident Reported",
      "link": "https://bbc.com/news/...",
      "published": "2025-11-09T09:00:00"
    }
  ],
  "errors": {}
}
```

---

## 🔧 Technical Details

### Backend Implementation

**File:** `backend/routes/enrichment_routes.py`

**Functions:**
1. `fetch_reddit_posts(lat, long)` - Searches Reddit
2. `fetch_weather_data(lat, long)` - Gets weather from OpenWeatherMap
3. `fetch_news_items()` - Parses RSS feed

**Endpoint:** `GET /api/incidents/<id>/enrich`
- Protected with JWT authentication
- Parallel execution (ThreadPoolExecutor)
- 10-second timeout per API
- Graceful error handling (partial data)

### Frontend Implementation

**File:** `frontend/src/components/EnrichmentPanel.jsx`

**Features:**
- Modal overlay with dark background
- Three-column grid layout
- Loading state with spinner
- Error handling with SweetAlert2
- Responsive design
- Close on Escape key or overlay click

---

## 🎃 "Frankenstein" Feature

This enrichment feature is your **Kiroween Hackathon "Frankenstein"** because it:

1. **Stitches together multiple data sources:**
   - Reddit (social media)
   - OpenWeatherMap (live weather)
   - RSS feeds ("dead" tech)

2. **Combines "live" and "dead" technologies:**
   - Modern APIs (Reddit, OpenWeatherMap)
   - Classic tech (RSS feeds from 1999)

3. **Creates something new:**
   - Incident validation platform
   - Multi-source intelligence
   - Context-aware decision making

---

## 🚀 Testing the APIs

### 1. Test Reddit API

```bash
# In Python console
import praw
reddit = praw.Reddit(
    client_id="0FvofluBjOygbZThngk0oA",
    client_secret="H7LaRLTPRmWUcXpnWEnU0_OEtKqwOg",
    user_agent="PhantomOps v0.1 by /u/Powerful-Phone-8782"
)
subreddit = reddit.subreddit("news")
for post in subreddit.search("emergency", limit=5):
    print(post.title)
```

### 2. Test OpenWeatherMap API

```bash
# In browser or curl
https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.0060&appid=6c31d6bfff3204a47e20dad4177fd30c&units=metric
```

### 3. Test RSS Feed

```bash
# In browser
https://feeds.bbci.co.uk/news/world/rss.xml
```

---

## 🎯 Where It's Used

### Admin Dashboard Only

Currently, the enrichment feature is **only accessible to admins**:

1. Admin logs in → AdminDashboard
2. Admin sees table of all incidents
3. Admin clicks on incident row
4. EnrichmentPanel modal opens
5. Backend fetches data from 3 APIs
6. Admin sees:
   - Reddit posts about emergencies
   - Weather at incident location
   - Recent news from BBC

### Why Admin Only?

- **Validation tool** - Helps admins verify if incidents are real
- **Context** - Provides additional information for decision-making
- **Resource intensive** - 3 API calls per enrichment
- **Professional use** - Designed for operations team

---

## 💡 Future Enhancements

### For User Dashboard

Could add:
- Weather widget (show current weather)
- News feed (show recent safety news)
- Reddit safety tips (show helpful posts)

### For Enrichment

Could improve:
- Location-based Reddit search (if API supports)
- Multiple news sources (add more RSS feeds)
- Traffic data (Google Maps API)
- Social media sentiment analysis
- Historical incident data

---

## 🐛 Troubleshooting

### Reddit API Not Working

**Check:**
1. Credentials are correct in `.env`
2. `praw` library is installed: `pip install praw`
3. Reddit app is active (check https://www.reddit.com/prefs/apps)

**Common Issues:**
- Invalid credentials → Check client_id and client_secret
- Rate limiting → Reddit has rate limits, wait a few minutes
- Subreddit doesn't exist → Check subreddit names

### OpenWeatherMap API Not Working

**Check:**
1. API key is correct in `.env`
2. API key is activated (can take a few hours after signup)
3. `requests` library is installed: `pip install requests`

**Common Issues:**
- 401 Unauthorized → API key not activated yet
- 429 Too Many Requests → Rate limit exceeded (60 calls/minute free tier)

### RSS Feed Not Working

**Check:**
1. RSS URL is correct in `.env`
2. `feedparser` library is installed: `pip install feedparser`
3. Feed URL is accessible (test in browser)

**Common Issues:**
- Feed URL changed → Update to new URL
- Feed parsing error → Try different RSS feed
- No items returned → Feed might be empty

---

## 📈 API Limits

### Reddit API (Free Tier)
- **Rate Limit:** 60 requests per minute
- **Cost:** Free
- **Restrictions:** Read-only access

### OpenWeatherMap API (Free Tier)
- **Rate Limit:** 60 calls per minute
- **Daily Limit:** 1,000 calls per day
- **Cost:** Free
- **Restrictions:** Current weather only (no forecasts)

### RSS Feed (BBC News)
- **Rate Limit:** None (public feed)
- **Cost:** Free
- **Restrictions:** None

---

## ✅ Summary

Your PhantomOps application successfully integrates:

1. ✅ **Reddit API** - Social media posts about emergencies
2. ✅ **OpenWeatherMap API** - Current weather at incident location
3. ✅ **RSS Feed** - Recent news from BBC World News

All APIs are:
- ✅ Configured with valid credentials
- ✅ Implemented in backend
- ✅ Displayed in frontend
- ✅ Working in parallel
- ✅ Handling errors gracefully

**Perfect for the Kiroween Hackathon "Frankenstein" category!** 🎃🏆
